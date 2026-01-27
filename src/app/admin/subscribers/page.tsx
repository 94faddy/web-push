'use client';

import { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';

interface Subscriber {
  id: number;
  endpoint: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface SubscriberStats {
  total: number;
  active: number;
  inactive: number;
  todayNew: number;
  dateRangeNew: number;
}

const Icons = {
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  search: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  trash: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  desktop: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  mobile: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  tablet: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  refresh: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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
  calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  userPlus: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  )
};

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [stats, setStats] = useState<SubscriberStats>({
    total: 0,
    active: 0,
    inactive: 0,
    todayNew: 0,
    dateRangeNew: 0
  });
  
  // Date filter
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilter, setShowDateFilter] = useState(false);

  const fetchSubscribers = useCallback(async () => {
    try {
      const response = await fetch('/api/subscribers');
      const data = await response.json();
      if (data.success) {
        setSubscribers(data.data || []);
        calculateStats(data.data || []);
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

  // Calculate stats
  const calculateStats = (subs: Subscriber[]) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayNew = subs.filter(s => {
      const created = new Date(s.created_at);
      created.setHours(0, 0, 0, 0);
      return created.getTime() === today.getTime();
    }).length;

    setStats({
      total: subs.length,
      active: subs.filter(s => s.is_active).length,
      inactive: subs.filter(s => !s.is_active).length,
      todayNew,
      dateRangeNew: 0
    });
  };

  // Calculate date range stats
  const calculateDateRangeStats = useCallback(() => {
    if (!startDate || !endDate) return;
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const count = subscribers.filter(s => {
      const created = new Date(s.created_at);
      return created >= start && created <= end;
    }).length;
    
    setStats(prev => ({ ...prev, dateRangeNew: count }));
  }, [startDate, endDate, subscribers]);

  useEffect(() => {
    calculateDateRangeStats();
  }, [calculateDateRangeStats]);

  // Filter subscribers
  useEffect(() => {
    let filtered = [...subscribers];

    // Filter by status
    if (filterStatus === 'active') {
      filtered = filtered.filter(s => s.is_active);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(s => !s.is_active);
    }

    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(s => 
        s.browser?.toLowerCase().includes(search) ||
        s.device_type?.toLowerCase().includes(search) ||
        s.endpoint.toLowerCase().includes(search)
      );
    }

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(s => {
        const created = new Date(s.created_at);
        return created >= start && created <= end;
      });
    }

    setFilteredSubscribers(filtered);
  }, [subscribers, filterStatus, searchTerm, startDate, endDate]);

  // Handle delete single subscriber
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'ลบ Subscriber?',
      text: 'คุณต้องการลบ Subscriber นี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('/api/subscribers', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: [id] })
        });
        const data = await response.json();
        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ',
            timer: 1500,
            showConfirmButton: false
          });
          fetchSubscribers();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบได้'
        });
      }
    }
  };

  // Handle delete selected
  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: `ลบ ${selectedIds.length} รายการ?`,
      text: 'คุณต้องการลบ Subscribers ที่เลือกหรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'ลบทั้งหมด',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('/api/subscribers', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: selectedIds })
        });
        const data = await response.json();
        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: `ลบสำเร็จ ${selectedIds.length} รายการ`,
            timer: 1500,
            showConfirmButton: false
          });
          setSelectedIds([]);
          fetchSubscribers();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบได้'
        });
      }
    }
  };

  // Handle delete all inactive
  const handleDeleteAllInactive = async () => {
    const inactiveCount = subscribers.filter(s => !s.is_active).length;
    if (inactiveCount === 0) {
      Swal.fire({
        icon: 'info',
        title: 'ไม่มี Inactive',
        text: 'ไม่มี Subscriber ที่ Inactive'
      });
      return;
    }

    const result = await Swal.fire({
      title: `ลบ Inactive ทั้งหมด?`,
      html: `<p>คุณต้องการลบ Subscriber ที่ Inactive ทั้งหมด <strong>${inactiveCount}</strong> รายการหรือไม่?</p>
             <p class="text-sm text-gray-500 mt-2">Inactive หมายถึง subscription ที่หมดอายุหรือถูกยกเลิกแล้ว</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'ลบทั้งหมด',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const inactiveIds = subscribers.filter(s => !s.is_active).map(s => s.id);
        const response = await fetch('/api/subscribers', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ids: inactiveIds })
        });
        const data = await response.json();
        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: `ลบสำเร็จ ${inactiveCount} รายการ`,
            timer: 1500,
            showConfirmButton: false
          });
          fetchSubscribers();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: 'ไม่สามารถลบได้'
        });
      }
    }
  };

  // Toggle select
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Select all inactive
  const selectAllInactive = () => {
    const inactiveIds = filteredSubscribers.filter(s => !s.is_active).map(s => s.id);
    setSelectedIds(inactiveIds);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedIds([]);
  };

  const formatDate = (dateString: string) => {
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
      default: return Icons.desktop;
    }
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ผู้ติดตาม</h1>
          <p className="text-gray-600 mt-1">จัดการ Subscribers ทั้งหมด</p>
        </div>
        <button
          onClick={() => {
            setIsLoading(true);
            fetchSubscribers();
          }}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all flex items-center gap-2"
        >
          {Icons.refresh}
          <span>รีเฟรช</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            {Icons.users}
            <span className="text-sm">ทั้งหมด</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            {Icons.check}
            <span className="text-sm">Active</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            {Icons.x}
            <span className="text-sm">Inactive</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            {Icons.userPlus}
            <span className="text-sm">สมัครวันนี้</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{stats.todayNew}</div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <button
          onClick={() => setShowDateFilter(!showDateFilter)}
          className="flex items-center gap-2 text-gray-700 font-medium"
        >
          {Icons.calendar}
          <span>ดูจำนวนสมัครตามช่วงวันที่</span>
          <svg className={`w-4 h-4 transition-transform ${showDateFilter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showDateFilter && (
          <div className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">วันที่เริ่มต้น</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">วันที่สิ้นสุด</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ล้าง
                </button>
              </div>
            </div>
            
            {startDate && endDate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-800">
                  {Icons.userPlus}
                  <span className="font-medium">สมัครในช่วงที่เลือก:</span>
                  <span className="text-2xl font-bold">{stats.dateRangeNew}</span>
                  <span>คน</span>
                </div>
                <p className="text-sm text-blue-600 mt-1">
                  {new Date(startDate).toLocaleDateString('th-TH')} - {new Date(endDate).toLocaleDateString('th-TH')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters & Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-3 flex items-center text-gray-400">
              {Icons.search}
            </div>
            <input
              type="text"
              placeholder="ค้นหา browser, อุปกรณ์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'all' 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              ทั้งหมด ({stats.total})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'active' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'inactive' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Inactive ({stats.inactive})
            </button>
          </div>
        </div>

        {/* Selection Actions */}
        {stats.inactive > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3">
            <button
              onClick={selectAllInactive}
              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
            >
              เลือก Inactive ทั้งหมด
            </button>
            <button
              onClick={handleDeleteAllInactive}
              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-2"
            >
              {Icons.trash}
              <span>ลบ Inactive ทั้งหมด ({stats.inactive})</span>
            </button>
            {selectedIds.length > 0 && (
              <>
                <button
                  onClick={clearSelection}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  ยกเลิกการเลือก
                </button>
                <button
                  onClick={handleDeleteSelected}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  {Icons.trash}
                  <span>ลบที่เลือก ({selectedIds.length})</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredSubscribers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredSubscribers.filter(s => !s.is_active).length && filteredSubscribers.filter(s => !s.is_active).length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          selectAllInactive();
                        } else {
                          clearSelection();
                        }
                      }}
                      className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">อุปกรณ์</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Browser</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">สถานะ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">สมัครเมื่อ</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className={`hover:bg-gray-50 transition-colors ${selectedIds.includes(subscriber.id) ? 'bg-red-50' : ''}`}>
                    <td className="px-4 py-3">
                      {!subscriber.is_active && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(subscriber.id)}
                          onChange={() => toggleSelect(subscriber.id)}
                          className="w-4 h-4 text-red-500 rounded focus:ring-red-500"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">{getDeviceIcon(subscriber.device_type)}</span>
                        <span className="text-sm text-gray-700 capitalize">{subscriber.device_type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{subscriber.browser || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {subscriber.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {Icons.check}
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          {Icons.x}
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600">{formatDate(subscriber.created_at)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!subscriber.is_active && (
                        <button
                          onClick={() => handleDelete(subscriber.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบ"
                        >
                          {Icons.trash}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="text-gray-300 flex justify-center mb-4">{Icons.users}</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่พบข้อมูล</h3>
            <p className="text-gray-500">ยังไม่มี Subscriber หรือไม่ตรงกับการค้นหา</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h3 className="font-semibold text-yellow-800 mb-2">ℹ️ หมายเหตุ</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>Active</strong> - Subscriber ที่ยังรับ notification ได้ (ไม่สามารถลบได้)</li>
          <li>• <strong>Inactive</strong> - Subscription หมดอายุ, ถูกยกเลิก หรือ browser data ถูกลบ (สามารถลบได้)</li>
          <li>• ระบบจะส่ง Push Notification เฉพาะ Active เท่านั้น</li>
          <li>• Inactive จะถูก mark อัตโนมัติเมื่อส่งไม่สำเร็จ (Error 410)</li>
        </ul>
      </div>
    </div>
  );
}