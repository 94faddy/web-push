import type { Metadata } from "next";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { token } = await params;
  
  return {
    title: "Web Push Notifications",
    description: "รับการแจ้งเตือนข่าวสารล่าสุดผ่านเว็บ",
    manifest: `/api/manifest/${token}`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Web Push",
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