import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, createSession, setSessionCookie } from '@/lib/auth';
import { Admin, ApiResponse, AuthUser } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<AuthUser>>> {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        error: 'กรุณากรอก username และ password'
      }, { status: 400 });
    }

    // Find admin
    const admins = await query<Admin[]>(
      'SELECT * FROM admins WHERE username = ? AND is_active = TRUE',
      [username]
    );

    if (admins.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'ไม่พบบัญชีผู้ใช้นี้'
      }, { status: 401 });
    }

    const admin = admins[0];

    // Verify password
    const isValid = await verifyPassword(password, admin.password_hash);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        error: 'รหัสผ่านไม่ถูกต้อง'
      }, { status: 401 });
    }

    // Get client info
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || undefined;

    // Create session
    const sessionToken = await createSession(admin.id, ip, userAgent);

    // Set cookie
    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        id: admin.id,
        username: admin.username,
        displayName: admin.display_name || null,
        token: admin.token,
        email: admin.email || null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ'
    }, { status: 500 });
  }
}
