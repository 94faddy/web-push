'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

// Icons
const Icons = {
  plus: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  edit: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  trash: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  key: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
    </svg>
  ),
  copy: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  shield: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  user: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  x: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  spinner: (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  eye: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  eyeOff: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
};

interface AdminData {
  id: number;
  username: string;
  role: 'superadmin' | 'admin';
  token: string;
  display_name: string | null;
  email: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

interface FormData {
  username: string;
  password: string;
  displayName: string;
  email: string;
  role: 'superadmin' | 'admin';
}

const emptyForm: FormData = {
  username: '',
  password: '',
  displayName: '',
  email: '',
  role: 'admin'
};

export default function ManageAdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await fetch('/api/admins');
      const data = await response.json();

      if (data.success) {
        setAdmins(data.data || []);
      } else if (response.status === 403) {
        // ไม่มีสิทธิ์ - redirect กลับ
        Swal.fire({
          icon: 'error',
          title: 'ไม่มีสิทธิ์เข้าถึง',
          text: 'เฉพาะ Super Admin เท่านั้นที่สามารถจัดการ Admin ได้',
          confirmButtonColor: '#22C55E'
        }).then(() => {
          router.push('/admin/dashboard');
        });
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const checkRole = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success) {
        setCurrentUserRole(data.data.role);
        if (data.data.role !== 'superadmin') {
          router.push('/admin/dashboard');
        }
      }
    } catch {
      router.push('/admin/dashboard');
    }
  }, [router]);

  useEffect(() => {
    checkRole();
    fetchAdmins();
  }, [checkRole, fetchAdmins]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setShowPassword(false);
  };

  const openEditForm = (admin: AdminData) => {
    setForm({
      username: admin.username,
      password: '',
      displayName: admin.display_name || '',
      email: admin.email || '',
      role: admin.role
    });
    setEditingId(admin.id);
    setShowForm(true);
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingId) {
        // Update
        const response = await fetch('/api/admins', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            displayName: form.displayName,
            email: form.email,
            password: form.password || undefined,
            role: form.role
          })
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'อัพเดทสำเร็จ',
            timer: 1500,
            showConfirmButton: false
          });
          setShowForm(false);
          fetchAdmins();
        } else {
          throw new Error(data.error);
        }
      } else {
        // Create
        const response = await fetch('/api/admins', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.username,
            password: form.password,
            displayName: form.displayName,
            email: form.email,
            role: form.role
          })
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'สร้าง Admin สำเร็จ',
            html: `
              <div class="text-left">
                <p><strong>Username:</strong> ${form.username}</p>
                <p><strong>Role:</strong> ${data.data.role === 'superadmin' ? 'Super Admin' : 'Admin'}</p>
                <p><strong>Token:</strong></p>
                <p class="text-xs bg-gray-100 p-2 rounded break-all">${data.data.token}</p>
              </div>
            `,
            confirmButtonColor: '#22C55E'
          });
          setShowForm(false);
          fetchAdmins();
        } else {
          throw new Error(data.error);
        }
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error instanceof Error ? error.message : 'ไม่สามารถดำเนินการได้',
        confirmButtonColor: '#22C55E'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (admin: AdminData) => {
    if (admin.role === 'superadmin') {
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถลบได้',
        text: 'ไม่สามารถลบ Super Admin ได้',
        confirmButtonColor: '#22C55E'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'ยืนยันการลบถาวร',
      html: `
        <div class="text-left">
          <p>คุณต้องการลบ <strong>${admin.display_name || admin.username}</strong> หรือไม่?</p>
          <p class="text-red-600 text-sm mt-2">⚠️ การลบนี้จะลบออกจากระบบถาวร ไม่สามารถกู้คืนได้</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'ลบถาวร',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('/api/admins', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: admin.id })
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ',
            timer: 1500,
            showConfirmButton: false
          });
          fetchAdmins();
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'ลบไม่สำเร็จ',
          text: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
          confirmButtonColor: '#22C55E'
        });
      }
    }
  };

  const handleToggleActive = async (admin: AdminData) => {
    const actionText = admin.is_active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน';
    
    const result = await Swal.fire({
      title: `${actionText} Admin?`,
      html: `คุณต้องการ${actionText} <strong>${admin.display_name || admin.username}</strong> หรือไม่?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: admin.is_active ? '#EF4444' : '#22C55E',
      cancelButtonColor: '#64748B',
      confirmButtonText: actionText,
      cancelButtonText: 'ยกเลิก'
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch('/api/admins', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: admin.id,
          displayName: admin.display_name,
          email: admin.email,
          isActive: !admin.is_active
        })
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: admin.is_active ? 'ปิดการใช้งานแล้ว' : 'เปิดการใช้งานแล้ว',
          timer: 1500,
          showConfirmButton: false
        });
        fetchAdmins();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error instanceof Error ? error.message : 'ไม่สามารถดำเนินการได้',
        confirmButtonColor: '#22C55E'
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    Swal.fire({
      icon: 'success',
      title: 'คัดลอกแล้ว!',
      timer: 1000,
      showConfirmButton: false
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading || currentUserRole !== 'superadmin') {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            {Icons.spinner}
            <span className="text-gray-600">กำลังโหลด...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">จัดการ Admin</h1>
          <p className="text-gray-500 mt-1">สร้าง แก้ไข และจัดการบัญชี Admin</p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          {Icons.plus}
          <span>สร้าง Admin ใหม่</span>
        </button>
      </div>

      {/* Admin List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Admin</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Token</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">สถานะ</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">เข้าใช้ล่าสุด</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((admin) => (
                <tr key={admin.id} className={`hover:bg-gray-50 ${!admin.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        admin.role === 'superadmin' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {admin.display_name?.[0] || admin.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {admin.display_name || admin.username}
                        </div>
                        <div className="text-sm text-gray-500">@{admin.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {admin.role === 'superadmin' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {Icons.shield}
                        Super Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {Icons.user}
                        Admin
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {admin.token.slice(0, 8)}...
                      </code>
                      <button
                        onClick={() => copyToClipboard(admin.token)}
                        className="p-1 hover:bg-gray-100 rounded text-gray-500"
                        title="คัดลอก Token"
                      >
                        {Icons.copy}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(admin)}
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                        admin.is_active 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}
                    >
                      {admin.is_active ? Icons.check : Icons.x}
                      {admin.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(admin.last_login)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditForm(admin)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        title="แก้ไข"
                      >
                        {Icons.edit}
                      </button>
                      {admin.role !== 'superadmin' && (
                        <button
                          onClick={() => handleDelete(admin)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                          title="ลบ"
                        >
                          {Icons.trash}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {admins.length === 0 && (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">{Icons.user}</div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">ยังไม่มี Admin</h3>
            <p className="text-gray-500">กดปุ่ม "สร้าง Admin ใหม่" เพื่อเริ่มต้น</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                {editingId ? 'แก้ไข Admin' : 'สร้าง Admin ใหม่'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
              >
                {Icons.close}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleInputChange}
                  disabled={!!editingId}
                  placeholder="username"
                  className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    editingId ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  minLength={3}
                  required={!editingId}
                />
                {!editingId && (
                  <p className="text-xs text-gray-500 mt-1">อย่างน้อย 3 ตัวอักษร</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {!editingId && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    placeholder={editingId ? 'เว้นว่างถ้าไม่ต้องการเปลี่ยน' : '••••••'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                    minLength={6}
                    required={!editingId}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? Icons.eyeOff : Icons.eye}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">อย่างน้อย 6 ตัวอักษร</p>
              </div>

              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อที่แสดง
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={form.displayName}
                  onChange={handleInputChange}
                  placeholder="ชื่อที่แสดง (ไม่บังคับ)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com (ไม่บังคับ)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, role: 'admin' }))}
                    className={`p-4 border-2 rounded-lg transition-all flex flex-col items-center gap-2 ${
                      form.role === 'admin'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {Icons.user}
                    <span className="font-medium">Admin</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, role: 'superadmin' }))}
                    className={`p-4 border-2 rounded-lg transition-all flex flex-col items-center gap-2 ${
                      form.role === 'superadmin'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    {Icons.shield}
                    <span className="font-medium">Super Admin</span>
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? Icons.spinner : null}
                  <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึก'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}