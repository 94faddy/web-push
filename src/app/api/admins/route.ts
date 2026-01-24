import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentAdmin, hashPassword, generateAdminToken } from '@/lib/auth';
import { ApiResponse, Admin } from '@/types';
import { ResultSetHeader } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

// Get all admins (super admin only - for now, first admin)
export async function GET(): Promise<NextResponse<ApiResponse<Partial<Admin>[]>>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    // Only first admin can see all admins
    if (admin.id !== 1) {
      return NextResponse.json({
        success: false,
        error: 'ไม่มีสิทธิ์'
      }, { status: 403 });
    }

    const admins = await query<Admin[]>(
      `SELECT id, username, token, display_name, email, is_active, last_login, created_at 
       FROM admins ORDER BY id`
    );

    return NextResponse.json({
      success: true,
      data: admins
    });

  } catch (error) {
    console.error('Get admins error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}

// Create new admin
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    // Only first admin can create new admins
    if (admin.id !== 1) {
      return NextResponse.json({
        success: false,
        error: 'ไม่มีสิทธิ์'
      }, { status: 403 });
    }

    const body = await request.json();
    const { username, password, displayName, email } = body;

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: 'กรุณากรอก username และ password'
      }, { status: 400 });
    }

    // Check if username exists
    const existing = await query<Admin[]>(
      'SELECT id FROM admins WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Username นี้มีอยู่แล้ว'
      }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const token = uuidv4();

    const result = await query<ResultSetHeader>(
      `INSERT INTO admins (username, password_hash, token, display_name, email)
       VALUES (?, ?, ?, ?, ?)`,
      [username, passwordHash, token, displayName || null, email || null]
    );

    return NextResponse.json({
      success: true,
      message: 'สร้าง admin สำเร็จ',
      data: { id: result.insertId, token }
    });

  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}

// Update admin
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    const body = await request.json();
    const { id, displayName, email, password, regenerateToken } = body;

    // Admin can only update themselves, or admin 1 can update anyone
    if (admin.id !== 1 && admin.id !== id) {
      return NextResponse.json({
        success: false,
        error: 'ไม่มีสิทธิ์'
      }, { status: 403 });
    }

    const targetId = id || admin.id;

    // Update basic info
    await query(
      'UPDATE admins SET display_name = ?, email = ? WHERE id = ?',
      [displayName || null, email || null, targetId]
    );

    // Update password if provided
    if (password) {
      const passwordHash = await hashPassword(password);
      await query('UPDATE admins SET password_hash = ? WHERE id = ?', [passwordHash, targetId]);
    }

    // Regenerate token if requested
    let newToken: string | undefined;
    if (regenerateToken) {
      newToken = await generateAdminToken(targetId);
    }

    return NextResponse.json({
      success: true,
      message: 'อัพเดทสำเร็จ',
      data: newToken ? { token: newToken } : undefined
    });

  } catch (error) {
    console.error('Update admin error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}

// Delete/deactivate admin
export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    // Only first admin can delete
    if (admin.id !== 1) {
      return NextResponse.json({
        success: false,
        error: 'ไม่มีสิทธิ์'
      }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id || id === 1) {
      return NextResponse.json({
        success: false,
        error: 'ไม่สามารถลบ admin หลักได้'
      }, { status: 400 });
    }

    await query('UPDATE admins SET is_active = FALSE WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'ลบ admin สำเร็จ'
    });

  } catch (error) {
    console.error('Delete admin error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}
