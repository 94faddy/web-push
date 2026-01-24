'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin/dashboard');
  }, [router]);

  return (
    <div className="p-6 flex items-center justify-center min-h-screen">
      <div className="text-gray-500 text-lg">กำลังโหลด...</div>
    </div>
  );
}
