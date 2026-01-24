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
      // Update existing subscription
      await query(
        `UPDATE subscribers SET 
          p256dh = ?, auth = ?, user_agent = ?, ip_address = ?, 
          device_type = ?, browser = ?, is_active = TRUE, 
          admin_id = COALESCE(?, admin_id), updated_at = NOW()
        WHERE endpoint = ?`,
        [keys.p256dh, keys.auth, userAgent, ip, deviceType, browser, adminId, endpoint]
      );

      return NextResponse.json({
        success: true,
        message: 'Subscription updated successfully'
      });
    }

    // Insert new subscription
    const result = await query<ResultSetHeader>(
      `INSERT INTO subscribers (admin_id, endpoint, p256dh, auth, user_agent, ip_address, device_type, browser)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminId, endpoint, keys.p256dh, keys.auth, userAgent, ip, deviceType, browser]
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

    await query(
      'UPDATE subscribers SET is_active = FALSE, updated_at = NOW() WHERE endpoint = ?',
      [endpoint]
    );

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
