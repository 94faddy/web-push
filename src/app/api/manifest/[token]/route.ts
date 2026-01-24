import { NextRequest, NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ token: string }>;
}

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  const token = params.token;
  
  const manifest = {
    name: "Web Push Notification",
    short_name: "Web Push",
    description: "รับการแจ้งเตือนข่าวสาร",
    start_url: `/s/${token}`,
    id: `/s/${token}`,
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#22C55E",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-72x72.png", sizes: "72x72", type: "image/png" },
      { src: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { src: "/icons/icon-128x128.png", sizes: "128x128", type: "image/png" },
      { src: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { src: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { src: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { src: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" }
    ]
  };

  return NextResponse.json(manifest, {
    headers: {
      'Content-Type': 'application/manifest+json'
    }
  });
}