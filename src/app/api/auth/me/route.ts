import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';
import { ApiResponse, AuthUser } from '@/types';

export async function GET(): Promise<NextResponse<ApiResponse<AuthUser | null>>> {
  try {
    const admin = await getCurrentAdmin();
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        error: 'ไม่ได้เข้าสู่ระบบ'
      }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        username: admin.username,
        displayName: admin.display_name || null,
        token: admin.token,
        email: admin.email || null,
        role: admin.role || 'admin'
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาด'
    }, { status: 500 });
  }
}