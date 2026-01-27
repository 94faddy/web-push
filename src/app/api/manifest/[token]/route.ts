import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface RouteContext {
  params: Promise<{ token: string }>;
}

interface AdminWithSettings {
  id: number;
  sender_name: string | null;
  sender_icon: string | null;
  logo_url: string | null;
  page_title: string | null;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  const token = params.token;
  
  // Default values
  let pwaName = 'Web Push Notification';
  let pwaShortName = 'Web Push';
  let pwaIcon = null;
  const pwaThemeColor = '#22C55E';
  
  try {
    // ดึงข้อมูลจาก push_settings (ถ้ามี) หรือ page_settings เป็น fallback
    const result = await query<AdminWithSettings[]>(
      `SELECT a.id, 
              ps.sender_name, ps.sender_icon,
              pgs.logo_url, pgs.page_title
       FROM admins a
       LEFT JOIN push_settings ps ON a.id = ps.admin_id
       LEFT JOIN page_settings pgs ON a.id = pgs.admin_id
       WHERE a.token = ?`,
      [token]
    );
    
    if (result.length > 0) {
      const settings = result[0];
      // ใช้ sender_name จาก push_settings ก่อน, ถ้าไม่มีใช้ page_title
      pwaName = settings.sender_name || settings.page_title || 'Web Push Notification';
      pwaShortName = settings.sender_name || 'Web Push';
      // ใช้ sender_icon จาก push_settings ก่อน, ถ้าไม่มีใช้ logo_url
      pwaIcon = settings.sender_icon || settings.logo_url || null;
    }
  } catch (error) {
    console.error('Failed to get admin settings for manifest:', error);
  }
  
  // Build icons array
  const icons = [];
  
  // If custom icon is set, use it for all sizes
  if (pwaIcon) {
    icons.push(
      { src: pwaIcon, sizes: '72x72', type: 'image/png', purpose: 'any maskable' },
      { src: pwaIcon, sizes: '96x96', type: 'image/png', purpose: 'any maskable' },
      { src: pwaIcon, sizes: '128x128', type: 'image/png', purpose: 'any maskable' },
      { src: pwaIcon, sizes: '144x144', type: 'image/png', purpose: 'any maskable' },
      { src: pwaIcon, sizes: '152x152', type: 'image/png', purpose: 'any maskable' },
      { src: pwaIcon, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: pwaIcon, sizes: '384x384', type: 'image/png', purpose: 'any maskable' },
      { src: pwaIcon, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    );
  } else {
    // Use default icons
    icons.push(
      { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
      { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
      { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
    );
  }
  
  const manifest = {
    name: pwaName,
    short_name: pwaShortName,
    description: 'รับการแจ้งเตือนข่าวสาร',
    start_url: `/s/${token}`,
    id: `/s/${token}`,
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: pwaThemeColor,
    orientation: 'portrait-primary',
    icons
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  });
}