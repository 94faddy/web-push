'use client';

import { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { AuthUser } from '@/types';

// Icons
const Icons = {
  link: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  copy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  externalLink: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  ),
  refresh: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  lock: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  spinner: (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
};

export default function SettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
        setForm(prev => ({
          ...prev,
          displayName: data.data.displayName || '',
          email: data.data.email || ''
        }));
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password && form.password !== form.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'รหัสผ่านไม่ตรงกัน',
        text: 'กรุณากรอกรหัสผ่านให้ตรงกัน',
        confirmButtonColor: '#22C55E'
      });
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/admins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.id,
          displayName: form.displayName,
          email: form.email,
          password: form.password || undefined
        })
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          timer: 1500,
          showConfirmButton: false
        });
        setForm(prev => ({ ...prev, password: '', confirmPassword: '' }));
        fetchUser();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error instanceof Error ? error.message : 'ไม่สามารถบันทึกได้',
        confirmButtonColor: '#22C55E'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const regenerateToken = async () => {
    const result = await Swal.fire({
      title: 'สร้าง URL ใหม่?',
      text: 'URL เดิมจะไม่สามารถใช้งานได้อีก ผู้ใช้ที่สมัครด้วย URL เดิมจะยังคงอยู่ในระบบ',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'สร้างใหม่',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('/api/admins', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user?.id,
            regenerateToken: true
          })
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'สร้าง URL ใหม่สำเร็จ',
            timer: 1500,
            showConfirmButton: false
          });
          fetchUser();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error instanceof Error ? error.message : 'ไม่สามารถสร้าง URL ได้'
        });
      }
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    Swal.fire({
      icon: 'success',
      title: 'คัดลอกแล้ว!',
      timer: 1500,
      showConfirmButton: false
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-500">กำลังโหลด...</span>
        </div>
      </div>
    );
  }

  const subscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')}/s/${user?.token}`;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">ตั้งค่า</h1>
        <p className="text-gray-500">จัดการบัญชีและการตั้งค่าต่างๆ</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscribe URL */}
        <div className="lg:col-span-2">
          <div className="bg-green-500 rounded-xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              {Icons.link}
              <div>
                <h3 className="text-lg font-semibold">URL สำหรับรับ Subscriber</h3>
                <p className="text-green-100 text-sm">
                  แชร์ URL นี้ให้ผู้ใช้เพื่อสมัครรับ Push Notification
                </p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur rounded-lg p-4 mb-4">
              <code className="text-sm break-all">{subscribeUrl}</code>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => copyUrl(subscribeUrl)}
                className="px-4 py-2.5 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium flex items-center gap-2"
              >
                {Icons.copy}
                <span>คัดลอก URL</span>
              </button>
              <button
                onClick={() => window.open(subscribeUrl, '_blank')}
                className="px-4 py-2.5 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors flex items-center gap-2"
              >
                {Icons.externalLink}
                <span>เปิดดู</span>
              </button>
              <button
                onClick={regenerateToken}
                className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
              >
                {Icons.refresh}
                <span>สร้าง URL ใหม่</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            {Icons.user}
            <h3 className="text-lg font-semibold text-gray-800">ข้อมูลส่วนตัว</h3>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">ไม่สามารถเปลี่ยนได้</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อที่แสดง
              </label>
              <input
                type="text"
                name="displayName"
                value={form.displayName}
                onChange={handleInputChange}
                placeholder="กรอกชื่อที่แสดง"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                อีเมล
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {isSaving ? Icons.spinner : null}
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}</span>
            </button>
          </form>
        </div>

        {/* Password Change */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            {Icons.lock}
            <h3 className="text-lg font-semibold text-gray-800">เปลี่ยนรหัสผ่าน</h3>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่านใหม่
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleInputChange}
                placeholder="กรอกรหัสผ่านใหม่"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ยืนยันรหัสผ่านใหม่
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleInputChange}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving || !form.password}
              className="w-full py-3 px-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 font-medium"
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </form>
        </div>

        {/* Info */}
        <div className="lg:col-span-2">
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              {Icons.info}
              <h3 className="font-semibold text-green-800">ข้อมูลระบบ</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Token:</span>
                <span className="ml-2 font-mono text-gray-700">{user?.token?.slice(0, 8)}...</span>
              </div>
              <div>
                <span className="text-gray-500">Admin ID:</span>
                <span className="ml-2 font-mono text-gray-700">{user?.id}</span>
              </div>
              <div>
                <span className="text-gray-500">Version:</span>
                <span className="ml-2 text-gray-700">2.0 Multi-Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
