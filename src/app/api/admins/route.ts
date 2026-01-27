import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentAdmin, hashPassword } from '@/lib/auth';
import { ApiResponse, Admin } from '@/types';
import { ResultSetHeader } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';

// Get all admins (superadmin only)
export async function GET(): Promise<NextResponse<ApiResponse<Partial<Admin>[]>>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    // Only superadmin can see all admins
    if (admin.role !== 'superadmin') {
      return NextResponse.json({
        success: false,
        error: 'ไม่มีสิทธิ์'
      }, { status: 403 });
    }

    const admins = await query<Admin[]>(
      `SELECT id, username, role, token, display_name, email, is_active, last_login, created_at 
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

// Create new admin (superadmin only)
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    // Only superadmin can create new admins
    if (admin.role !== 'superadmin') {
      return NextResponse.json({
        success: false,
        error: 'ไม่มีสิทธิ์'
      }, { status: 403 });
    }

    const body = await request.json();
    const { username, password, displayName, email, role } = body;

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: 'กรุณากรอก username และ password'
      }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({
        success: false,
        error: 'Username ต้องมีอย่างน้อย 3 ตัวอักษร'
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({
        success: false,
        error: 'Password ต้องมีอย่างน้อย 6 ตัวอักษร'
      }, { status: 400 });
    }

    // Validate role
    const validRoles = ['superadmin', 'admin'];
    const selectedRole = validRoles.includes(role) ? role : 'admin';

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
    // สร้าง token อัตโนมัติสำหรับ admin ใหม่
    const token = uuidv4();

    const result = await query<ResultSetHeader>(
      `INSERT INTO admins (username, password_hash, role, token, display_name, email)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [username, passwordHash, selectedRole, token, displayName || null, email || null]
    );

    return NextResponse.json({
      success: true,
      message: 'สร้าง admin สำเร็จ',
      data: { id: result.insertId, token, role: selectedRole }
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
    const { id, displayName, email, password, isActive, role } = body;

    // Admin can only update themselves, or superadmin can update anyone
    if (admin.role !== 'superadmin' && admin.id !== id) {
      return NextResponse.json({
        success: false,
        error: 'ไม่มีสิทธิ์'
      }, { status: 403 });
    }

    const targetId = id || admin.id;

    // Get target admin
    const targetAdmins = await query<Admin[]>(
      'SELECT * FROM admins WHERE id = ?',
      [targetId]
    );

    if (targetAdmins.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'ไม่พบ admin'
      }, { status: 404 });
    }

    const targetAdmin = targetAdmins[0];

    // ห้าม admin ธรรมดาแก้ไข superadmin
    if (admin.role !== 'superadmin' && targetAdmin.role === 'superadmin') {
      return NextResponse.json({
        success: false,
        error: 'ไม่มีสิทธิ์แก้ไข superadmin'
      }, { status: 403 });
    }

    // Update basic info
    await query(
      'UPDATE admins SET display_name = ?, email = ? WHERE id = ?',
      [displayName || null, email || null, targetId]
    );

    // Update password if provided
    if (password) {
      if (password.length < 6) {
        return NextResponse.json({
          success: false,
          error: 'Password ต้องมีอย่างน้อย 6 ตัวอักษร'
        }, { status: 400 });
      }
      const passwordHash = await hashPassword(password);
      await query('UPDATE admins SET password_hash = ? WHERE id = ?', [passwordHash, targetId]);
    }

    // Update role (superadmin only)
    if (role && admin.role === 'superadmin') {
      const validRoles = ['superadmin', 'admin'];
      if (validRoles.includes(role)) {
        // ถ้าจะเปลี่ยน superadmin เป็น admin ต้องเช็คว่ายังมี superadmin คนอื่นอยู่
        if (targetAdmin.role === 'superadmin' && role === 'admin') {
          const superadminCount = await query<{ count: number }[]>(
            'SELECT COUNT(*) as count FROM admins WHERE role = ? AND is_active = TRUE',
            ['superadmin']
          );
          
          if (superadminCount[0].count <= 1) {
            return NextResponse.json({
              success: false,
              error: 'ไม่สามารถเปลี่ยนได้ ต้องมี Super Admin อย่างน้อย 1 คน'
            }, { status: 400 });
          }
        }
        
        await query('UPDATE admins SET role = ? WHERE id = ?', [role, targetId]);
      }
    }

    // Update is_active (superadmin only, can't deactivate self or last superadmin)
    if (typeof isActive === 'boolean' && admin.role === 'superadmin') {
      // ห้าม deactivate superadmin ถ้าเหลือคนเดียว
      if (!isActive && targetAdmin.role === 'superadmin') {
        const superadminCount = await query<{ count: number }[]>(
          'SELECT COUNT(*) as count FROM admins WHERE role = ? AND is_active = TRUE',
          ['superadmin']
        );
        
        if (superadminCount[0].count <= 1) {
          return NextResponse.json({
            success: false,
            error: 'ไม่สามารถปิดการใช้งาน Super Admin คนสุดท้ายได้'
          }, { status: 400 });
        }
      }
      await query('UPDATE admins SET is_active = ? WHERE id = ?', [isActive, targetId]);
    }

    return NextResponse.json({
      success: true,
      message: 'อัพเดทสำเร็จ'
    });

  } catch (error) {
    console.error('Update admin error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}

// Delete admin (superadmin only) - ลบจริงจากระบบ
export async function DELETE(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    // Only superadmin can delete
    if (admin.role !== 'superadmin') {
      return NextResponse.json({
        success: false,
        error: 'ไม่มีสิทธิ์'
      }, { status: 403 });
    }

    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'กรุณาระบุ admin id'
      }, { status: 400 });
    }

    // ห้ามลบตัวเอง
    if (id === admin.id) {
      return NextResponse.json({
        success: false,
        error: 'ไม่สามารถลบตัวเองได้'
      }, { status: 400 });
    }

    // Get target admin
    const targetAdmins = await query<Admin[]>(
      'SELECT * FROM admins WHERE id = ?',
      [id]
    );

    if (targetAdmins.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'ไม่พบ admin'
      }, { status: 404 });
    }

    const targetAdmin = targetAdmins[0];

    // ห้ามลบ superadmin
    if (targetAdmin.role === 'superadmin') {
      return NextResponse.json({
        success: false,
        error: 'ไม่สามารถลบ superadmin ได้'
      }, { status: 400 });
    }

    // ลบ sessions ของ admin นี้ก่อน
    await query('DELETE FROM admin_sessions WHERE admin_id = ?', [id]);
    
    // ลบ admin จริงจาก database
    await query('DELETE FROM admins WHERE id = ?', [id]);

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