import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getAdminByToken } from '@/lib/auth';
import { ApiResponse, Subscriber } from '@/types';
import { ResultSetHeader } from 'mysql2';

// Detect device type from user agent
function detectDeviceType(userAgent: string): 'desktop' | 'mobile' | 'tablet' {
  const ua = userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    return 'mobile';
  }
  return 'desktop';
}

// Detect browser from user agent
function detectBrowser(userAgent: string): string {
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('SamsungBrowser')) return 'Samsung';
  if (userAgent.includes('Opera') || userAgent.includes('OPR')) return 'Opera';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  return 'Unknown';
}

// Log subscriber action
async function logSubscriberAction(
  adminId: number | null,
  subscriberId: number | null,
  action: 'subscribe' | 'unsubscribe' | 'resubscribe',
  endpoint: string,
  userAgent: string,
  ip: string,
  deviceType: string,
  browser: string
) {
  try {
    await query(
      `INSERT INTO subscriber_logs (admin_id, subscriber_id, action, endpoint, user_agent, ip_address, device_type, browser)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminId, subscriberId, action, endpoint, userAgent, ip, deviceType, browser]
    );
  } catch (error) {
    // If table doesn't exist, silently fail
    console.error('Failed to log subscriber action:', error);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const { endpoint, keys, userAgent, adminToken } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({
        success: false,
        error: 'Missing required subscription data'
      }, { status: 400 });
    }

    // Get admin ID from token
    let adminId: number | null = null;
    if (adminToken) {
      const admin = await getAdminByToken(adminToken);
      if (admin) {
        adminId = admin.id;
      }
    }

    // Get client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

    const deviceType = detectDeviceType(userAgent || '');
    const browser = detectBrowser(userAgent || '');

    // Check if subscription already exists
    const existing = await query<Subscriber[]>(
      'SELECT id, is_active, admin_id FROM subscribers WHERE endpoint = ?',
      [endpoint]
    );

    if (existing.length > 0) {
      const existingSub = existing[0];
      const wasInactive = !existingSub.is_active;
      
      // Update existing subscription
      await query(
        `UPDATE subscribers SET 
          p256dh = ?, auth = ?, user_agent = ?, ip_address = ?, 
          device_type = ?, browser = ?, is_active = TRUE, 
          admin_id = COALESCE(?, admin_id), updated_at = NOW()
        WHERE endpoint = ?`,
        [keys.p256dh, keys.auth, userAgent, ip, deviceType, browser, adminId, endpoint]
      );

      // Log resubscribe if was inactive before
      if (wasInactive) {
        await logSubscriberAction(
          adminId || existingSub.admin_id,
          existingSub.id,
          'resubscribe',
          endpoint,
          userAgent || '',
          ip,
          deviceType,
          browser
        );
      }

      return NextResponse.json({
        success: true,
        message: wasInactive ? 'Resubscribed successfully' : 'Subscription updated successfully'
      });
    }

    // Insert new subscription
    const result = await query<ResultSetHeader>(
      `INSERT INTO subscribers (admin_id, endpoint, p256dh, auth, user_agent, ip_address, device_type, browser)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminId, endpoint, keys.p256dh, keys.auth, userAgent, ip, deviceType, browser]
    );

    // Log new subscription
    await logSubscriberAction(
      adminId,
      result.insertId,
      'subscribe',
      endpoint,
      userAgent || '',
      ip,
      deviceType,
      browser
    );

    return NextResponse.json({
      success: true,
      message: 'Subscribed successfully',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to subscribe'
    }, { status: 500 });
  }
}

// Unsubscribe endpoint
export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({
        success: false,
        error: 'Missing endpoint'
      }, { status: 400 });
    }

    // Get subscriber info before updating
    const existing = await query<Subscriber[]>(
      'SELECT id, admin_id, user_agent, ip_address, device_type, browser FROM subscribers WHERE endpoint = ?',
      [endpoint]
    );

    if (existing.length > 0) {
      const subscriber = existing[0];
      
      // Update subscriber status
      await query(
        'UPDATE subscribers SET is_active = FALSE, updated_at = NOW() WHERE endpoint = ?',
        [endpoint]
      );

      // Log unsubscribe action
      await logSubscriberAction(
        subscriber.admin_id,
        subscriber.id,
        'unsubscribe',
        endpoint,
        subscriber.user_agent || '',
        subscriber.ip_address || '',
        subscriber.device_type || 'desktop',
        subscriber.browser || 'Unknown'
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed successfully'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to unsubscribe'
    }, { status: 500 });
  }
}