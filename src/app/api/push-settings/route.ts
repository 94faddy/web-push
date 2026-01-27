import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { ApiResponse } from '@/types';
import { ResultSetHeader } from 'mysql2/promise';

interface PushSettings {
  id: number;
  admin_id: number;
  sender_name: string;
  sender_icon: string | null;
}

// GET - ดึงการตั้งค่าการส่ง
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    let adminId: number | null = null;
    
    // ถ้ามี token = public access (สำหรับ subscribe page)
    if (token) {
      const adminResult = await query<{ id: number }[]>(
        'SELECT id FROM admins WHERE token = ?',
        [token]
      );
      
      if (adminResult.length > 0) {
        adminId = adminResult[0].id;
      }
    } else {
      // ถ้าไม่มี token = ต้อง login (admin access)
      const admin = await getCurrentAdmin();
      
      if (!admin) {
        return NextResponse.json({
          success: false,
          error: 'ไม่ได้เข้าสู่ระบบ'
        }, { status: 401 });
      }
      
      adminId = admin.id;
    }
    
    if (!adminId) {
      return NextResponse.json({
        success: false,
        error: 'ไม่พบข้อมูล'
      }, { status: 404 });
    }

    const settings = await query<PushSettings[]>(
      'SELECT * FROM push_settings WHERE admin_id = ?',
      [adminId]
    );

    if (settings.length === 0) {
      // Return default settings
      return NextResponse.json({
        success: true,
        data: {
          sender_name: 'แจ้งเตือน',
          sender_icon: null
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: settings[0]
    });

  } catch (error) {
    console.error('Get push settings error:', error);
    return NextResponse.json({
      success: false,
      error: 'ไม่สามารถดึงการตั้งค่าได้'
    }, { status: 500 });
  }
}

// POST - บันทึกการตั้งค่าการส่ง
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
    const { sender_name, sender_icon } = body;

    if (!sender_name || !sender_name.trim()) {
      return NextResponse.json({
        success: false,
        error: 'กรุณากรอกชื่อผู้ส่ง'
      }, { status: 400 });
    }

    // Upsert - insert or update
    await query<ResultSetHeader>(
      `INSERT INTO push_settings (admin_id, sender_name, sender_icon)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
       sender_name = VALUES(sender_name),
       sender_icon = VALUES(sender_icon)`,
      [admin.id, sender_name.trim(), sender_icon || null]
    );

    return NextResponse.json({
      success: true,
      message: 'บันทึกการตั้งค่าสำเร็จ'
    });

  } catch (error) {
    console.error('Save push settings error:', error);
    return NextResponse.json({
      success: false,
      error: 'ไม่สามารถบันทึกการตั้งค่าได้'
    }, { status: 500 });
  }
}