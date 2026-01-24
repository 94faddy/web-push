import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { ApiResponse, Template } from '@/types';
import { ResultSetHeader } from 'mysql2';

// Get templates
export async function GET(): Promise<NextResponse<ApiResponse<Template[]>>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    const templates = await query<Template[]>(
      `SELECT * FROM templates 
       WHERE admin_id = ? AND is_active = TRUE 
       ORDER BY created_at DESC`,
      [admin.id]
    );

    return NextResponse.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Get templates error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}

// Create template
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    const body = await request.json();
    const { name, title, body: templateBody, icon, image, url } = body;

    if (!name || !title || !templateBody) {
      return NextResponse.json({
        success: false,
        error: 'กรุณากรอก ชื่อ, หัวข้อ และข้อความ'
      }, { status: 400 });
    }

    const result = await query<ResultSetHeader>(
      `INSERT INTO templates (admin_id, name, title, body, icon, image, url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [admin.id, name, title, templateBody, icon || null, image || null, url || null]
    );

    return NextResponse.json({
      success: true,
      message: 'สร้าง template สำเร็จ',
      data: { id: result.insertId }
    });

  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}

// Update template
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
    const { id, name, title, body: templateBody, icon, image, url } = body;

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ไม่พบ template ID'
      }, { status: 400 });
    }

    await query(
      `UPDATE templates 
       SET name = ?, title = ?, body = ?, icon = ?, image = ?, url = ?, updated_at = NOW()
       WHERE id = ? AND admin_id = ?`,
      [name, title, templateBody, icon || null, image || null, url || null, id, admin.id]
    );

    return NextResponse.json({
      success: true,
      message: 'อัพเดท template สำเร็จ'
    });

  } catch (error) {
    console.error('Update template error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}

// Delete template
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
        error: 'ไม่พบ template ID'
      }, { status: 400 });
    }

    await query(
      'UPDATE templates SET is_active = FALSE WHERE id = ? AND admin_id = ?',
      [id, admin.id]
    );

    return NextResponse.json({
      success: true,
      message: 'ลบ template สำเร็จ'
    });

  } catch (error) {
    console.error('Delete template error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}
