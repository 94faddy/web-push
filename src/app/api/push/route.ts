import { NextRequest, NextResponse } from 'next/server';
import { query, getConnection } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { sendPushNotification, PushSubscription, NotificationPayload } from '@/lib/webpush';
import { ApiResponse, Subscriber } from '@/types';
import { ResultSetHeader, PoolConnection } from 'mysql2/promise';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  let connection: PoolConnection | null = null;
  
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    const body = await request.json();
    const { title, body: messageBody, icon, image, url, tag, saveAsTemplate, templateName } = body;

    // Validate required fields
    if (!title || !messageBody) {
      return NextResponse.json({
        success: false,
        error: 'กรุณากรอก หัวข้อ และข้อความ'
      }, { status: 400 });
    }

    // Get all active subscribers for this admin
    const subscribers = await query<Subscriber[]>(
      'SELECT id, endpoint, p256dh, auth FROM subscribers WHERE admin_id = ? AND is_active = TRUE',
      [admin.id]
    );

    if (subscribers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'ไม่มีผู้ติดตาม'
      }, { status: 404 });
    }

    // Create push log entry
    connection = await getConnection();
    await connection.beginTransaction();

    const [logResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO push_logs (admin_id, title, body, icon, image, url, tag, total_sent, sent_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [admin.id, title, messageBody, icon || null, image || null, url || null, tag || null, subscribers.length, admin.username]
    );

    const pushLogId = logResult.insertId;

    // Generate tracking URL if url is provided
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://push.w99.in';
    let trackingUrl = url;
    if (url) {
      trackingUrl = `${appUrl}/api/click?id=${pushLogId}&url=${encodeURIComponent(url)}`;
    }

    // Prepare notification payload
    const payload: NotificationPayload = {
      title,
      body: messageBody,
      icon: icon || '/icons/icon-192x192.png',
      image: image || undefined,
      badge: '/icons/icon-72x72.png',
      url: trackingUrl || '/',
      tag: tag || `push-${pushLogId}`,
      timestamp: Date.now(),
      requireInteraction: true,
      vibrate: [200, 100, 200],
    };

    // Send to all subscribers
    let successCount = 0;
    let failedCount = 0;
    const expiredEndpoints: string[] = [];

    const sendPromises = subscribers.map(async (subscriber) => {
      const subscription: PushSubscription = {
        endpoint: subscriber.endpoint,
        keys: {
          p256dh: subscriber.p256dh,
          auth: subscriber.auth
        }
      };

      const result = await sendPushNotification(subscription, payload);

      // Record delivery status
      const status = result.success ? 'success' : (result.error === 'subscription_expired' ? 'expired' : 'failed');
      
      await connection!.execute(
        `INSERT INTO push_deliveries (push_log_id, subscriber_id, status, error_message)
         VALUES (?, ?, ?, ?)`,
        [pushLogId, subscriber.id, status, result.error || null]
      );

      if (result.success) {
        successCount++;
        // Update last push time
        await connection!.execute(
          'UPDATE subscribers SET last_push_at = NOW() WHERE id = ?',
          [subscriber.id]
        );
      } else {
        failedCount++;
        if (result.error === 'subscription_expired') {
          expiredEndpoints.push(subscriber.endpoint);
        }
      }

      return result;
    });

    await Promise.all(sendPromises);

    // Mark expired subscriptions as inactive
    if (expiredEndpoints.length > 0) {
      const placeholders = expiredEndpoints.map(() => '?').join(',');
      await connection.execute(
        `UPDATE subscribers SET is_active = FALSE WHERE endpoint IN (${placeholders})`,
        expiredEndpoints
      );
    }

    // Update push log with results
    await connection.execute(
      `UPDATE push_logs SET total_success = ?, total_failed = ? WHERE id = ?`,
      [successCount, failedCount, pushLogId]
    );

    // Save as template if requested
    if (saveAsTemplate && templateName) {
      await connection.execute(
        `INSERT INTO templates (admin_id, name, title, body, icon, image, url)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [admin.id, templateName, title, messageBody, icon || null, image || null, url || null]
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: `ส่งสำเร็จ ${successCount}/${subscribers.length} คน`,
      data: {
        pushLogId,
        totalSent: subscribers.length,
        success: successCount,
        failed: failedCount,
        expired: expiredEndpoints.length
      }
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Send push error:', error);
    return NextResponse.json({
      success: false,
      error: 'ไม่สามารถส่ง notification ได้'
    }, { status: 500 });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// Get push history for current admin
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    const logs = await query<unknown[]>(
      `SELECT * FROM push_logs WHERE admin_id = ? ORDER BY created_at DESC LIMIT 50`,
      [admin.id]
    );

    return NextResponse.json({
      success: true,
      data: logs
    });

  } catch (error) {
    console.error('Get push logs error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get push logs'
    }, { status: 500 });
  }
}
