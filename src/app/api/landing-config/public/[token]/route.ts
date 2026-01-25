import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { ApiResponse, LandingPageConfig, defaultLandingPageConfig } from '@/types';
import { RowDataPacket } from 'mysql2';

interface AdminRow extends RowDataPacket {
  id: number;
}

// Get landing page config by admin token (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse<ApiResponse<LandingPageConfig>>> {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token is required'
      }, { status: 400 });
    }

    // Get admin ID from token
    const admins = await query<AdminRow[]>(
      'SELECT id FROM admins WHERE token = ? AND is_active = TRUE LIMIT 1',
      [token]
    );

    if (admins.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token'
      }, { status: 404 });
    }

    const adminId = admins[0].id;

    // Get landing page config
    const configs = await query<(LandingPageConfig & RowDataPacket)[]>(
      'SELECT * FROM landing_page_config WHERE admin_id = ? AND is_active = TRUE LIMIT 1',
      [adminId]
    );

    if (configs.length === 0) {
      // Return default config if no config exists
      return NextResponse.json({
        success: true,
        data: {
          ...defaultLandingPageConfig,
          id: 0,
          admin_id: adminId,
          created_at: new Date(),
          updated_at: new Date()
        } as LandingPageConfig
      });
    }

    return NextResponse.json({
      success: true,
      data: configs[0]
    });

  } catch (error) {
    console.error('Get public landing config error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}
