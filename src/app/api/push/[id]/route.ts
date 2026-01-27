import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { ApiResponse, PushLog, PushDelivery, ClickTracking, PushDetail } from '@/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface DeliveryWithSubscriber extends PushDelivery {
  subscriber_endpoint?: string;
  subscriber_device_type?: string;
  subscriber_browser?: string;
}

interface DeliveryCountResult {
  status: string;
  count: number;
}

// GET - Get push detail by ID
export async function GET(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse<ApiResponse<PushDetail>>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    const params = await context.params;
    const pushId = parseInt(params.id);

    if (isNaN(pushId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid push ID'
      }, { status: 400 });
    }

    // Get push log
    const pushLogs = await query<PushLog[]>(
      `SELECT * FROM push_logs WHERE id = ? AND admin_id = ?`,
      [pushId, admin.id]
    );

    if (pushLogs.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Push not found'
      }, { status: 404 });
    }

    const pushLog = pushLogs[0];

    // Get delivery details with subscriber info
    const deliveries = await query<DeliveryWithSubscriber[]>(
      `SELECT pd.*, 
              s.endpoint as subscriber_endpoint,
              s.device_type as subscriber_device_type,
              s.browser as subscriber_browser
       FROM push_deliveries pd
       LEFT JOIN subscribers s ON pd.subscriber_id = s.id
       WHERE pd.push_log_id = ?
       ORDER BY pd.created_at DESC`,
      [pushId]
    );

    // Get delivery stats
    const deliveryStats = await query<DeliveryCountResult[]>(
      `SELECT status, COUNT(*) as count 
       FROM push_deliveries WHERE push_log_id = ?
       GROUP BY status`,
      [pushId]
    );

    const stats = {
      success: 0,
      failed: 0,
      expired: 0
    };

    deliveryStats.forEach(stat => {
      if (stat.status in stats) {
        stats[stat.status as keyof typeof stats] = stat.count;
      }
    });

    // Get click details
    const clickDetails = await query<ClickTracking[]>(
      `SELECT * FROM click_tracking WHERE push_log_id = ? ORDER BY created_at DESC`,
      [pushId]
    );

    const pushDetail: PushDetail = {
      ...pushLog,
      deliveries: deliveries,
      delivery_stats: stats,
      click_details: clickDetails
    };

    return NextResponse.json({
      success: true,
      data: pushDetail
    });

  } catch (error) {
    console.error('Get push detail error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get push details'
    }, { status: 500 });
  }
}