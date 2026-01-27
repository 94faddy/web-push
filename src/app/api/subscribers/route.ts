import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { RowDataPacket } from 'mysql2';

// GET - Get all subscribers
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const connection = await getConnection();
    
    const [rows] = await connection.execute<RowDataPacket[]>(
      `SELECT id, endpoint, device_type, browser, is_active, created_at, updated_at
       FROM subscribers 
       WHERE admin_id = ?
       ORDER BY created_at DESC`,
      [admin.id]
    );

    connection.release();

    return NextResponse.json<ApiResponse>({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Get subscribers error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to get subscribers'
    }, { status: 500 });
  }
}

// DELETE - Delete subscribers by IDs
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'No IDs provided'
      }, { status: 400 });
    }

    const connection = await getConnection();

    // Only allow deleting inactive subscribers
    const placeholders = ids.map(() => '?').join(',');
    const [result] = await connection.execute(
      `DELETE FROM subscribers 
       WHERE id IN (${placeholders}) 
       AND admin_id = ? 
       AND is_active = FALSE`,
      [...ids, admin.id]
    );

    connection.release();

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Deleted ${(result as { affectedRows: number }).affectedRows} subscribers`
    });

  } catch (error) {
    console.error('Delete subscribers error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Failed to delete subscribers'
    }, { status: 500 });
  }
}