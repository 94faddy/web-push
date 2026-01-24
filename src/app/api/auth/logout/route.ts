import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession, deleteSessionCookie } from '@/lib/auth';
import { ApiResponse } from '@/types';

export async function POST(): Promise<NextResponse<ApiResponse>> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('admin_session');
    
    if (sessionCookie?.value) {
      await deleteSession(sessionCookie.value);
    }
    
    await deleteSessionCookie();

    return NextResponse.json({
      success: true,
      message: 'ออกจากระบบสำเร็จ'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({
      success: false,
      error: 'เกิดข้อผิดพลาดในการออกจากระบบ'
    }, { status: 500 });
  }
}
