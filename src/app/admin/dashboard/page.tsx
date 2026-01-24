'use client';

import { useEffect, useState, useCallback } from 'react';
import { DashboardStats, PushLog } from '@/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// Icons
const Icons = {
  users: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  send: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  click: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
  ),
  chart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  template: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
  link: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  inbox: (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  )
};

const COLORS = ['#22C55E', '#3B82F6', '#F59E0B', '#EF4444', '#A855F7', '#EC4899'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const deviceData = stats ? [
    { name: 'Desktop', value: stats.deviceStats.desktop, color: '#22C55E' },
    { name: 'Mobile', value: stats.deviceStats.mobile, color: '#3B82F6' },
    { name: 'Tablet', value: stats.deviceStats.tablet, color: '#F59E0B' },
  ].filter(d => d.value > 0) : [];

  const browserData = stats ? Object.entries(stats.browserStats).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length]
  })) : [];

  const dailyData = stats?.dailyStats.map(day => ({
    date: new Date(day.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' }),
    subscribers: day.subscribers,
    pushes: day.pushes,
    clicks: day.clicks
  })) || [];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">ภาพรวมระบบ Web Push Notification</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">ผู้ติดตาม Active</div>
              <div className="text-3xl font-bold text-gray-800">
                {stats?.activeSubscribers || 0}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                จากทั้งหมด {stats?.totalSubscribers || 0} คน
              </div>
            </div>
            <div className="icon-bg icon-bg-primary">
              {Icons.users}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">ส่ง Push ทั้งหมด</div>
              <div className="text-3xl font-bold text-gray-800">
                {stats?.totalPushSent || 0}
              </div>
              <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                {Icons.check}
                <span>{stats?.successRate || 0}% สำเร็จ</span>
              </div>
            </div>
            <div className="icon-bg icon-bg-blue">
              {Icons.send}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">คลิกทั้งหมด</div>
              <div className="text-3xl font-bold text-gray-800">
                {stats?.totalClicks || 0}
              </div>
              <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                {Icons.link}
                <span>{stats?.clickRate || 0}% อัตราคลิก</span>
              </div>
            </div>
            <div className="icon-bg icon-bg-purple">
              {Icons.click}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 mb-1">อัตราสำเร็จ</div>
              <div className="text-3xl font-bold text-gray-800">
                {stats?.successRate || 0}%
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Delivery Rate
              </div>
            </div>
            <div className="icon-bg icon-bg-orange">
              {Icons.chart}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Stats Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">สถิติข้อความ</h3>
            <span className="text-xs text-gray-500">จำนวนข้อความรายวัน</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }} 
                />
                <Legend />
                <Line type="monotone" dataKey="subscribers" stroke="#22C55E" name="ผู้ติดตามใหม่" strokeWidth={2} dot={{ fill: '#22C55E' }} />
                <Line type="monotone" dataKey="pushes" stroke="#3B82F6" name="ส่ง Push" strokeWidth={2} dot={{ fill: '#3B82F6' }} />
                <Line type="monotone" dataKey="clicks" stroke="#F59E0B" name="คลิก" strokeWidth={2} dot={{ fill: '#F59E0B' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Channel Stats (like in BevChat) */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-800">อุปกรณ์ยอดนิยม</h3>
            <span className="text-xs text-gray-500">ดูทั้งหมด</span>
          </div>
          {deviceData.length > 0 ? (
            <div className="space-y-4">
              {deviceData.map((device, index) => (
                <div key={device.name} className="flex items-center gap-4">
                  <span className="text-gray-500 w-6">#{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{device.name}</span>
                      <span className="text-sm text-gray-500">{device.value} อุปกรณ์</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full" 
                        style={{ 
                          width: `${(device.value / Math.max(...deviceData.map(d => d.value))) * 100}%`,
                          backgroundColor: device.color
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400">
              ยังไม่มีข้อมูล
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Browser Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Browser</h3>
          <div className="h-64">
            {browserData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={browserData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="value" name="จำนวน" radius={[0, 4, 4, 0]}>
                    {browserData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                ยังไม่มีข้อมูล
              </div>
            )}
          </div>
        </div>

        {/* Recent Push History */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">การส่งล่าสุด</h3>
          <div className="h-64 overflow-y-auto">
            {stats?.recentPushes && stats.recentPushes.length > 0 ? (
              <div className="space-y-3">
                {stats.recentPushes.slice(0, 5).map((push: PushLog) => (
                  <div
                    key={push.id}
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600 flex-shrink-0">
                      {Icons.send}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 truncate">
                        {push.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {push.body}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-3">
                        <span className="text-green-600 flex items-center gap-1">
                          {Icons.check} {push.total_success}
                        </span>
                        <span className="text-red-500 flex items-center gap-1">
                          {Icons.x} {push.total_failed}
                        </span>
                        <span className="text-purple-600 flex items-center gap-1">
                          {Icons.link} {push.total_clicks || 0}
                        </span>
                        <span>• {formatDate(push.created_at)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                {Icons.inbox}
                <div className="mt-2">ยังไม่มีประวัติการส่ง</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">การดำเนินการด่วน</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/send"
            className="flex flex-col items-center p-6 bg-green-50 hover:bg-green-100 rounded-xl transition-colors border border-green-100"
          >
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white mb-3">
              {Icons.send}
            </div>
            <span className="text-sm font-medium text-green-700">ส่ง Push</span>
          </a>
          <a
            href="/admin/subscribers"
            className="flex flex-col items-center p-6 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-100"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-3">
              {Icons.users}
            </div>
            <span className="text-sm font-medium text-blue-700">ดูผู้ติดตาม</span>
          </a>
          <a
            href="/admin/templates"
            className="flex flex-col items-center p-6 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-100"
          >
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white mb-3">
              {Icons.template}
            </div>
            <span className="text-sm font-medium text-purple-700">Templates</span>
          </a>
          <a
            href="/admin/settings"
            className="flex flex-col items-center p-6 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors border border-orange-100"
          >
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white mb-3">
              {Icons.settings}
            </div>
            <span className="text-sm font-medium text-orange-700">ตั้งค่า</span>
          </a>
        </div>
      </div>
    </div>
  );
}
