'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { PushLog } from '@/types';

const Icons = {
  arrowLeft: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  send: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  x: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  click: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
  ),
  link: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  image: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  copy: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  externalLink: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  )
};

interface PushSettings {
  sender_name: string;
  sender_icon: string | null;
}

export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [pushDetail, setPushDetail] = useState<PushLog | null>(null);
  const [pushSettings, setPushSettings] = useState<PushSettings>({
    sender_name: 'แจ้งเตือน',
    sender_icon: null
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [detailRes, settingsRes] = await Promise.all([
        fetch(`/api/push/${id}`),
        fetch('/api/push-settings')
      ]);
      
      const [detailData, settingsData] = await Promise.all([
        detailRes.json(),
        settingsRes.json()
      ]);
      
      if (detailData.success) {
        setPushDetail(detailData.data);
      }
      if (settingsData.success && settingsData.data) {
        setPushSettings({
          sender_name: settingsData.data.sender_name || 'แจ้งเตือน',
          sender_icon: settingsData.data.sender_icon || null
        });
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleUseSendAgain = () => {
    if (pushDetail) {
      // Store data in sessionStorage to pass to send page
      sessionStorage.setItem('pushTemplate', JSON.stringify({
        title: pushDetail.title,
        body: pushDetail.body,
        image: pushDetail.image || '',
        url: pushDetail.url || ''
      }));
      
      Swal.fire({
        icon: 'success',
        title: 'คัดลอกข้อมูลแล้ว',
        text: 'กำลังไปหน้าส่งข้อความ...',
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        router.push('/admin/send?from=history');
      });
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

  if (!pushDetail) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-2">ไม่พบข้อมูล</h3>
          <p className="text-gray-500 mb-6">ไม่พบประวัติการส่งที่ต้องการ</p>
          <Link
            href="/admin/history"
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium inline-flex items-center gap-2"
          >
            {Icons.arrowLeft}
            <span>กลับหน้าประวัติ</span>
          </Link>
        </div>
      </div>
    );
  }

  const successRate = pushDetail.total_sent > 0 
    ? Math.round(((pushDetail.total_success || 0) / pushDetail.total_sent) * 100) 
    : 0;

  const clickRate = (pushDetail.total_success || 0) > 0
    ? Math.round(((pushDetail.total_clicks || 0) / (pushDetail.total_success || 1)) * 100)
    : 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/history"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {Icons.arrowLeft}
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">รายละเอียดการส่ง #{pushDetail.id}</h1>
            <p className="text-gray-600 mt-1">{formatDate(pushDetail.created_at)}</p>
          </div>
        </div>
        <button
          onClick={handleUseSendAgain}
          className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all flex items-center gap-2 font-medium shadow-lg shadow-green-200"
        >
          {Icons.copy}
          <span>ใช้ส่งต่อ</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            {Icons.users}
            <span className="text-sm">ส่งทั้งหมด</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{pushDetail.total_sent}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            {Icons.check}
            <span className="text-sm">สำเร็จ</span>
          </div>
          <div className="text-3xl font-bold text-green-600">{pushDetail.total_success || 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-red-500 mb-2">
            {Icons.x}
            <span className="text-sm">ล้มเหลว</span>
          </div>
          <div className="text-3xl font-bold text-red-600">{pushDetail.total_failed || 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            {Icons.click}
            <span className="text-sm">คลิก</span>
          </div>
          <div className="text-3xl font-bold text-blue-600">{pushDetail.total_clicks || 0}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="text-sm text-gray-500 mb-2">อัตราสำเร็จ</div>
          <div className="text-3xl font-bold text-purple-600">{successRate}%</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left - Message Detail */}
        <div className="xl:col-span-2 space-y-6">
          {/* Message Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-6 text-lg">เนื้อหาข้อความ</h3>
            <div className="space-y-5">
              <div>
                <label className="text-sm text-gray-500 block mb-1">หัวข้อ</label>
                <p className="text-gray-900 font-medium text-lg">{pushDetail.title}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">ข้อความ</label>
                <p className="text-gray-900">{pushDetail.body}</p>
              </div>
              {pushDetail.url && (
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-1 mb-1">
                    {Icons.link}
                    <span>URL เมื่อคลิก</span>
                  </label>
                  <a 
                    href={pushDetail.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    {pushDetail.url}
                    {Icons.externalLink}
                  </a>
                </div>
              )}
              {pushDetail.image && (
                <div>
                  <label className="text-sm text-gray-500 flex items-center gap-1 mb-2">
                    {Icons.image}
                    <span>รูปภาพ</span>
                  </label>
                  <img 
                    src={pushDetail.image} 
                    alt="" 
                    className="max-w-full h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Meta Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-6 text-lg">ข้อมูลเพิ่มเติม</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500 block mb-1">ส่งโดย</label>
                <p className="text-gray-900 font-medium">{pushDetail.sent_by}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">อัตราการคลิก</label>
                <p className="text-gray-900 font-medium">{clickRate}%</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">เวลาที่ส่ง</label>
                <p className="text-gray-900">{formatDate(pushDetail.created_at)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">ID</label>
                <p className="text-gray-900">#{pushDetail.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Preview & Stats */}
        <div className="xl:col-span-1 space-y-6">
          {/* Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">ตัวอย่าง Notification</h3>
            <div className="bg-gray-800 rounded-xl p-4 text-white">
              <div className="flex items-start gap-3">
                {pushSettings.sender_icon ? (
                  <img src={pushSettings.sender_icon} alt="" className="w-12 h-12 rounded-lg bg-white object-cover" />
                ) : (
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                    {Icons.bell}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-gray-400 mb-1">{pushSettings.sender_name}</div>
                  <div className="font-medium truncate">{pushDetail.title}</div>
                  <div className="text-sm text-gray-300 mt-1 line-clamp-2">{pushDetail.body}</div>
                </div>
              </div>
              {pushDetail.image && (
                <img 
                  src={pushDetail.image} 
                  alt="" 
                  className="w-full h-32 object-cover rounded-lg mt-3"
                />
              )}
            </div>
          </div>

          {/* Success Rate Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">อัตราการส่ง</h3>
            <div className="space-y-4">
              {/* Success */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-green-600 font-medium">สำเร็จ</span>
                  <span className="text-gray-600">{pushDetail.total_success || 0} ({successRate}%)</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{ width: `${successRate}%` }}
                  />
                </div>
              </div>
              {/* Failed */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-red-600 font-medium">ล้มเหลว</span>
                  <span className="text-gray-600">{pushDetail.total_failed || 0} ({100 - successRate}%)</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 rounded-full transition-all"
                    style={{ width: `${100 - successRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Click Rate */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              {Icons.click}
              <h3 className="font-semibold text-blue-800">อัตราการคลิก</h3>
            </div>
            <div className="text-4xl font-bold text-blue-600 mb-2">{clickRate}%</div>
            <p className="text-sm text-blue-700">
              {pushDetail.total_clicks || 0} คลิก จาก {pushDetail.total_success || 0} ที่ส่งสำเร็จ
            </p>
          </div>

          {/* Use Again Button */}
          <button
            onClick={handleUseSendAgain}
            className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-200"
          >
            {Icons.send}
            <span>ใช้ข้อความนี้ส่งอีกครั้ง</span>
          </button>
        </div>
      </div>
    </div>
  );
}