import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { ApiResponse, DashboardStats, PushLog } from '@/types';

interface CountResult {
  count: number;
}

interface DeviceCountResult {
  device_type: string;
  count: number;
}

interface BrowserCountResult {
  browser: string;
  count: number;
}

interface SumResult {
  total: number | null;
}

interface DailyStatResult {
  date: string;
  count: number;
}

interface SubscriberTrendResult {
  date: string;
  action: string;
  count: number;
}

export async function GET(): Promise<NextResponse<ApiResponse<DashboardStats>>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    const adminId = admin.id;

    // Get total subscribers for this admin
    const totalResult = await query<CountResult[]>(
      'SELECT COUNT(*) as count FROM subscribers WHERE admin_id = ?',
      [adminId]
    );
    const totalSubscribers = totalResult[0]?.count || 0;

    // Get active subscribers for this admin
    const activeResult = await query<CountResult[]>(
      'SELECT COUNT(*) as count FROM subscribers WHERE admin_id = ? AND is_active = TRUE',
      [adminId]
    );
    const activeSubscribers = activeResult[0]?.count || 0;

    // Get inactive subscribers for this admin
    const inactiveSubscribers = totalSubscribers - activeSubscribers;

    // Get total push sent
    const pushResult = await query<SumResult[]>(
      'SELECT SUM(total_sent) as total FROM push_logs WHERE admin_id = ?',
      [adminId]
    );
    const totalPushSent = pushResult[0]?.total || 0;

    // Get total clicks
    const clickResult = await query<SumResult[]>(
      'SELECT SUM(total_clicks) as total FROM push_logs WHERE admin_id = ?',
      [adminId]
    );
    const totalClicks = clickResult[0]?.total || 0;

    // Get success rate
    const successResult = await query<SumResult[]>(
      'SELECT SUM(total_success) as total FROM push_logs WHERE admin_id = ?',
      [adminId]
    );
    const totalSuccess = successResult[0]?.total || 0;
    const successRate = totalPushSent > 0 ? Math.round((totalSuccess / totalPushSent) * 100) : 0;

    // Calculate click rate
    const clickRate = totalSuccess > 0 ? Math.round((totalClicks / totalSuccess) * 100) : 0;

    // Get recent push logs
    const recentPushes = await query<PushLog[]>(
      `SELECT * FROM push_logs WHERE admin_id = ? ORDER BY created_at DESC LIMIT 10`,
      [adminId]
    );

    // Get device stats
    const deviceStats = await query<DeviceCountResult[]>(
      `SELECT device_type, COUNT(*) as count 
       FROM subscribers WHERE admin_id = ? AND is_active = TRUE 
       GROUP BY device_type`,
      [adminId]
    );

    const deviceStatMap = {
      desktop: 0,
      mobile: 0,
      tablet: 0
    };
    deviceStats.forEach(stat => {
      if (stat.device_type in deviceStatMap) {
        deviceStatMap[stat.device_type as keyof typeof deviceStatMap] = stat.count;
      }
    });

    // Get browser stats
    const browserStats = await query<BrowserCountResult[]>(
      `SELECT browser, COUNT(*) as count 
       FROM subscribers WHERE admin_id = ? AND is_active = TRUE 
       GROUP BY browser`,
      [adminId]
    );

    const browserStatMap: { [key: string]: number } = {};
    browserStats.forEach(stat => {
      if (stat.browser) {
        browserStatMap[stat.browser] = stat.count;
      }
    });

    // Get daily stats for last 30 days
    const dailySubscribers = await query<DailyStatResult[]>(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM subscribers WHERE admin_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at) ORDER BY date`,
      [adminId]
    );

    const dailyPushes = await query<DailyStatResult[]>(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM push_logs WHERE admin_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at) ORDER BY date`,
      [adminId]
    );

    const dailyClicks = await query<DailyStatResult[]>(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM click_tracking WHERE admin_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at) ORDER BY date`,
      [adminId]
    );

    // Combine daily stats
    const dateMap: { [key: string]: { subscribers: number; pushes: number; clicks: number } } = {};
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap[dateStr] = { subscribers: 0, pushes: 0, clicks: 0 };
    }

    dailySubscribers.forEach(stat => {
      const dateStr = new Date(stat.date).toISOString().split('T')[0];
      if (dateMap[dateStr]) {
        dateMap[dateStr].subscribers = stat.count;
      }
    });

    dailyPushes.forEach(stat => {
      const dateStr = new Date(stat.date).toISOString().split('T')[0];
      if (dateMap[dateStr]) {
        dateMap[dateStr].pushes = stat.count;
      }
    });

    dailyClicks.forEach(stat => {
      const dateStr = new Date(stat.date).toISOString().split('T')[0];
      if (dateMap[dateStr]) {
        dateMap[dateStr].clicks = stat.count;
      }
    });

    const dailyStats = Object.entries(dateMap).map(([date, stats]) => ({
      date,
      ...stats
    }));

    // Get subscriber trend data (subscribe/unsubscribe events)
    const subscriberTrendData = await query<SubscriberTrendResult[]>(
      `SELECT DATE(created_at) as date, action, COUNT(*) as count 
       FROM subscriber_logs WHERE admin_id = ? AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at), action ORDER BY date`,
      [adminId]
    ).catch(() => [] as SubscriberTrendResult[]); // If table doesn't exist yet, return empty array

    // Build subscriber trend map
    const trendMap: { [key: string]: { subscribes: number; unsubscribes: number } } = {};
    
    // Generate last 30 days for trend
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trendMap[dateStr] = { subscribes: 0, unsubscribes: 0 };
    }

    subscriberTrendData.forEach(stat => {
      const dateStr = new Date(stat.date).toISOString().split('T')[0];
      if (trendMap[dateStr]) {
        if (stat.action === 'subscribe' || stat.action === 'resubscribe') {
          trendMap[dateStr].subscribes = stat.count;
        } else if (stat.action === 'unsubscribe') {
          trendMap[dateStr].unsubscribes = stat.count;
        }
      }
    });

    const subscriberTrend = Object.entries(trendMap).map(([date, stats]) => ({
      date,
      subscribes: stats.subscribes,
      unsubscribes: stats.unsubscribes,
      net: stats.subscribes - stats.unsubscribes
    }));

    // Get today's subscribe/unsubscribe counts
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySubscribes = trendMap[todayStr]?.subscribes || 0;
    const todayUnsubscribes = trendMap[todayStr]?.unsubscribes || 0;

    return NextResponse.json({
      success: true,
      data: {
        totalSubscribers,
        activeSubscribers,
        inactiveSubscribers,
        totalPushSent,
        totalClicks,
        successRate,
        clickRate,
        recentPushes,
        deviceStats: deviceStatMap,
        browserStats: browserStatMap,
        dailyStats,
        subscriberTrend,
        todaySubscribes,
        todayUnsubscribes,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get stats'
    }, { status: 500 });
  }
}