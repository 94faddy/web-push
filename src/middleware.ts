import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  
  // Skip all static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/icons') ||
    pathname === '/sw.js' ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.ico' ||
    /\.(png|jpg|jpeg|gif|svg|ico|webp|js|css|woff|woff2)$/.test(pathname)
  ) {
    return NextResponse.next();
  }
  
  // Public routes - no auth required
  if (
    pathname === '/dash/login' ||
    pathname.startsWith('/s/') ||
    pathname === '/api/auth/login' ||
    pathname === '/api/subscribe' ||
    pathname.startsWith('/api/click') ||
    pathname.startsWith('/api/manifest/')
  ) {
    return NextResponse.next();
  }
  
  // Allow /api/page-settings with token (for public subscribe page)
  if (pathname === '/api/page-settings' && searchParams.has('token')) {
    return NextResponse.next();
  }
  
  // Check session for protected routes
  const sessionCookie = request.cookies.get('admin_session');
  
  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/dash/login', request.url));
    }
    return NextResponse.next();
  }
  
  // Protect /api routes (except public ones already handled above)
  if (pathname.startsWith('/api')) {
    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};