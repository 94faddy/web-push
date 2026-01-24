import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse } from '@/types';

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

// Record click
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();
    const { pushLogId, url } = body;

    if (!pushLogId) {
      return NextResponse.json({
        success: false,
        error: 'Missing push log ID'
      }, { status: 400 });
    }

    // Get client info
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const deviceType = detectDeviceType(userAgent);
    const browser = detectBrowser(userAgent);

    // Get admin_id from push_log
    const pushLogs = await query<{ admin_id: number }[]>(
      'SELECT admin_id FROM push_logs WHERE id = ?',
      [pushLogId]
    );

    const adminId = pushLogs.length > 0 ? pushLogs[0].admin_id : null;

    // Insert click tracking
    await query(
      `INSERT INTO click_tracking (push_log_id, admin_id, clicked_url, user_agent, ip_address, device_type, browser)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pushLogId, adminId, url || null, userAgent, ip, deviceType, browser]
    );

    // Update total_clicks in push_logs
    await query(
      'UPDATE push_logs SET total_clicks = total_clicks + 1 WHERE id = ?',
      [pushLogId]
    );

    return NextResponse.json({
      success: true,
      message: 'Click recorded'
    });

  } catch (error) {
    console.error('Click tracking error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to record click'
    }, { status: 500 });
  }
}

// Get click stats (for redirect page)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const pushLogId = searchParams.get('id');
    const targetUrl = searchParams.get('url');

    if (!pushLogId || !targetUrl) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Record the click
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const deviceType = detectDeviceType(userAgent);
    const browser = detectBrowser(userAgent);

    // Get admin_id from push_log
    const pushLogs = await query<{ admin_id: number }[]>(
      'SELECT admin_id FROM push_logs WHERE id = ?',
      [pushLogId]
    );

    const adminId = pushLogs.length > 0 ? pushLogs[0].admin_id : null;

    // Insert click tracking
    await query(
      `INSERT INTO click_tracking (push_log_id, admin_id, clicked_url, user_agent, ip_address, device_type, browser)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [pushLogId, adminId, targetUrl, userAgent, ip, deviceType, browser]
    );

    // Update total_clicks
    await query(
      'UPDATE push_logs SET total_clicks = total_clicks + 1 WHERE id = ?',
      [pushLogId]
    );

    // Redirect to target URL
    return NextResponse.redirect(targetUrl);

  } catch (error) {
    console.error('Click redirect error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
