'use client';

import { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { Subscriber } from '@/types';

// Icons
const Icons = {
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  desktop: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  mobile: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  tablet: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
  trash: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  inbox: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  )
};

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSubscribers = useCallback(async () => {
    try {
      const response = await fetch('/api/subscribers');
      const data = await response.json();
      if (data.success) {
        setSubscribers(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleDeactivate = async (id: number) => {
    const result = await Swal.fire({
      title: 'ยกเลิกผู้ติดตาม?',
      text: 'ต้องการยกเลิกผู้ติดตามนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'ยกเลิก',
      cancelButtonText: 'ไม่'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('/api/subscribers', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'ยกเลิกสำเร็จ',
            timer: 1500,
            showConfirmButton: false
          });
          fetchSubscribers();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error instanceof Error ? error.message : 'ไม่สามารถยกเลิกได้'
        });
      }
    }
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile': return Icons.mobile;
      case 'tablet': return Icons.tablet;
      case 'desktop': return Icons.desktop;
      default: return Icons.mobile;
    }
  };

  const filteredSubscribers = subscribers.filter(sub => {
    if (filter === 'active' && !sub.is_active) return false;
    if (filter === 'inactive' && sub.is_active) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        sub.browser?.toLowerCase().includes(term) ||
        sub.device_type?.toLowerCase().includes(term) ||
        sub.ip_address?.includes(term)
      );
    }

    return true;
  });

  const activeCount = subscribers.filter(s => s.is_active).length;
  const mobileCount = subscribers.filter(s => s.device_type === 'mobile').length;
  const desktopCount = subscribers.filter(s => s.device_type === 'desktop').length;

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">ผู้ติดตาม</h1>
        <p className="text-gray-500">จัดการผู้ติดตามทั้งหมด</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="icon-bg icon-bg-primary">{Icons.users}</div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{subscribers.length}</div>
              <div className="text-sm text-gray-500">ทั้งหมด</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">{Icons.check}</div>
            <div>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
              <div className="text-sm text-gray-500">Active</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">{Icons.desktop}</div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{desktopCount}</div>
              <div className="text-sm text-gray-500">Desktop</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">{Icons.mobile}</div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{mobileCount}</div>
              <div className="text-sm text-gray-500">Mobile</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {Icons.search}
            </div>
            <input
              type="text"
              placeholder="ค้นหา (browser, device, IP)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                filter === 'all' ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                filter === 'active' ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
                filter === 'inactive' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredSubscribers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">อุปกรณ์</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Browser</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">IP</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">สถานะ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">สมัคร</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Push ล่าสุด</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        {getDeviceIcon(subscriber.device_type)}
                        <span className="text-sm capitalize">{subscriber.device_type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        {Icons.globe}
                        <span className="text-sm">{subscriber.browser || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600 font-mono">{subscriber.ip_address || '-'}</span>
                    </td>
                    <td className="px-4 py-4">
                      {subscriber.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {Icons.check} Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          {Icons.x} Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{formatDate(subscriber.created_at)}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{formatDate(subscriber.last_push_at)}</span>
                    </td>
                    <td className="px-4 py-4">
                      {subscriber.is_active && (
                        <button
                          onClick={() => handleDeactivate(subscriber.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors"
                        >
                          {Icons.trash}
                          <span>ยกเลิก</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            {Icons.inbox}
            <div className="text-lg mt-4">ไม่พบผู้ติดตาม</div>
            <div className="text-sm mt-2">
              {searchTerm ? 'ลองค้นหาด้วยคำอื่น' : 'รอผู้ใช้สมัครรับการแจ้งเตือน'}
            </div>
          </div>
        )}
      </div>

      {/* Pagination Info */}
      <div className="mt-4 text-sm text-gray-500 text-center">
        แสดง {filteredSubscribers.length} จาก {subscribers.length} รายการ
      </div>
    </div>
  );
}
