import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { ApiResponse, Subscriber } from '@/types';

// Get subscribers for current admin
export async function GET(): Promise<NextResponse<ApiResponse<Subscriber[]>>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    const subscribers = await query<Subscriber[]>(
      `SELECT * FROM subscribers WHERE admin_id = ? ORDER BY created_at DESC`,
      [admin.id]
    );

    return NextResponse.json({
      success: true,
      data: subscribers
    });

  } catch (error) {
    console.error('Get subscribers error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get subscribers'
    }, { status: 500 });
  }
}

// Delete/deactivate subscriber
export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'Missing subscriber ID'
      }, { status: 400 });
    }

    await query(
      'UPDATE subscribers SET is_active = FALSE WHERE id = ? AND admin_id = ?',
      [id, admin.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Subscriber deactivated'
    });

  } catch (error) {
    console.error('Delete subscriber error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to deactivate subscriber'
    }, { status: 500 });
  }
}
