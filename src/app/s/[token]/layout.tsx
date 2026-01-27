import type { Metadata } from "next";
import { query } from "@/lib/db";

// Force dynamic rendering - ไม่ให้ cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}

interface AdminWithSettings {
  id: number;
  sender_name: string | null;
  sender_icon: string | null;
  logo_url: string | null;
  page_title: string | null;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { token } = await params;
  
  // Default values
  let pwaName = 'Web Push Notification';
  let pwaIcon: string | null = null;
  
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
      // ใช้ sender_icon จาก push_settings ก่อน, ถ้าไม่มีใช้ logo_url
      pwaIcon = settings.sender_icon || settings.logo_url || null;
    }
  } catch (error) {
    console.error('Failed to get admin settings for layout:', error);
  }
  
  // Build icons array for apple-touch-icon
  const icons: Metadata['icons'] = {};
  
  if (pwaIcon) {
    icons.apple = [
      { url: pwaIcon, sizes: '180x180', type: 'image/png' },
      { url: pwaIcon, sizes: '152x152', type: 'image/png' },
      { url: pwaIcon, sizes: '144x144', type: 'image/png' },
      { url: pwaIcon, sizes: '120x120', type: 'image/png' },
    ];
    icons.icon = [
      { url: pwaIcon, sizes: '192x192', type: 'image/png' },
      { url: pwaIcon, sizes: '512x512', type: 'image/png' },
    ];
  }
  
  return {
    title: pwaName,
    description: "รับการแจ้งเตือนข่าวสารล่าสุดผ่านเว็บ",
    manifest: `/api/manifest/${token}`,
    icons: Object.keys(icons).length > 0 ? icons : undefined,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: pwaName,
    },
    // เพิ่ม meta tag สำหรับ iOS Add to Home Screen
    other: {
      'apple-mobile-web-app-title': pwaName,
    },
  };
}

export default function SubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}