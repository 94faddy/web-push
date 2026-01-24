'use client';

import { useEffect, useState, useCallback } from 'react';
import Swal from 'sweetalert2';
import { PushLog, Template } from '@/types';

// Icons
const Icons = {
  send: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  template: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  history: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  eye: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  spinner: (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
};

interface PushForm {
  title: string;
  body: string;
  icon: string;
  image: string;
  url: string;
  saveAsTemplate: boolean;
  templateName: string;
}

export default function SendPushPage() {
  const [form, setForm] = useState<PushForm>({
    title: '',
    body: '',
    icon: '',
    image: '',
    url: '',
    saveAsTemplate: false,
    templateName: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [pushHistory, setPushHistory] = useState<PushLog[]>([]);
  const [activeSubscribers, setActiveSubscribers] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [templatesRes, historyRes, statsRes] = await Promise.all([
        fetch('/api/templates'),
        fetch('/api/push'),
        fetch('/api/stats')
      ]);

      const [templatesData, historyData, statsData] = await Promise.all([
        templatesRes.json(),
        historyRes.json(),
        statsRes.json()
      ]);

      if (templatesData.success) setTemplates(templatesData.data || []);
      if (historyData.success) setPushHistory(historyData.data || []);
      if (statsData.success) setActiveSubscribers(statsData.data.activeSubscribers || 0);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const loadTemplate = (template: Template) => {
    setForm(prev => ({
      ...prev,
      title: template.title,
      body: template.body,
      icon: template.icon || '',
      image: template.image || '',
      url: template.url || ''
    }));
    setShowTemplates(false);
    Swal.fire({
      icon: 'success',
      title: 'โหลด Template แล้ว',
      text: template.name,
      timer: 1500,
      showConfirmButton: false
    });
  };

  const loadFromHistory = (push: PushLog) => {
    setForm(prev => ({
      ...prev,
      title: push.title,
      body: push.body,
      icon: push.icon || '',
      image: push.image || '',
      url: push.url || ''
    }));
    setShowHistory(false);
  };

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim() || !form.body.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'กรุณากรอกข้อมูล',
        text: 'หัวข้อและข้อความจำเป็นต้องกรอก',
        confirmButtonColor: '#22C55E'
      });
      return;
    }

    if (form.saveAsTemplate && !form.templateName.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'กรุณากรอกชื่อ Template',
        confirmButtonColor: '#22C55E'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'ยืนยันการส่ง',
      html: `
        <div class="text-left">
          <p><strong>หัวข้อ:</strong> ${form.title}</p>
          <p><strong>ข้อความ:</strong> ${form.body}</p>
          ${form.url ? `<p><strong>URL:</strong> ${form.url}</p>` : ''}
          <p class="mt-3 text-green-600"><strong>ส่งไปยัง ${activeSubscribers} คน</strong></p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22C55E',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'ส่งเลย',
      cancelButtonText: 'ยกเลิก'
    });

    if (!result.isConfirmed) return;

    setIsSending(true);

    try {
      const response = await fetch('/api/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'ส่งสำเร็จ!',
          html: `
            <div class="text-left">
              <p>ส่งทั้งหมด: ${data.data.totalSent}</p>
              <p>สำเร็จ: ${data.data.success}</p>
              <p>ล้มเหลว: ${data.data.failed}</p>
            </div>
          `,
          confirmButtonColor: '#22C55E'
        });

        setForm({
          title: '',
          body: '',
          icon: '',
          image: '',
          url: '',
          saveAsTemplate: false,
          templateName: ''
        });

        fetchData();
      } else {
        throw new Error(data.error || 'Failed to send');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error instanceof Error ? error.message : 'ไม่สามารถส่ง notification ได้',
        confirmButtonColor: '#22C55E'
      });
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">ส่ง Push Notification</h1>
        <p className="text-gray-500">ส่งข้อความแจ้งเตือนไปยังผู้ติดตาม</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            {/* Quick Actions */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => { setShowTemplates(!showTemplates); setShowHistory(false); }}
                className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                  showTemplates ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {Icons.template}
                <span>Templates ({templates.length})</span>
              </button>
              <button
                type="button"
                onClick={() => { setShowHistory(!showHistory); setShowTemplates(false); }}
                className={`px-4 py-2 rounded-lg transition-colors text-sm flex items-center gap-2 ${
                  showHistory ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {Icons.history}
                <span>ประวัติ ({pushHistory.length})</span>
              </button>
            </div>

            {/* Template Selection */}
            {showTemplates && templates.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">เลือก Template</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => loadTemplate(template)}
                      className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-sm transition-all"
                    >
                      <div className="font-medium text-gray-800 truncate">{template.name}</div>
                      <div className="text-xs text-gray-500 truncate">{template.title}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* History Selection */}
            {showHistory && pushHistory.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">เลือกจากประวัติ</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {pushHistory.slice(0, 10).map((push) => (
                    <button
                      key={push.id}
                      onClick={() => loadFromHistory(push)}
                      className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-green-400 hover:shadow-sm transition-all"
                    >
                      <div className="font-medium text-gray-800 truncate">{push.title}</div>
                      <div className="text-xs text-gray-500 truncate">{push.body}</div>
                      <div className="text-xs text-gray-400 mt-1">{formatDate(push.created_at)}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSendPush} className="space-y-5">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  หัวข้อ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleInputChange}
                  placeholder="กรอกหัวข้อข้อความ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  maxLength={100}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {form.title.length}/100 ตัวอักษร
                </div>
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ข้อความ <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="body"
                  value={form.body}
                  onChange={handleInputChange}
                  placeholder="กรอกเนื้อหาข้อความ"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all"
                  maxLength={255}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {form.body.length}/255 ตัวอักษร
                </div>
              </div>

              {/* Icon URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon URL <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
                </label>
                <input
                  type="url"
                  name="icon"
                  value={form.icon}
                  onChange={handleInputChange}
                  placeholder="https://example.com/icon.png"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <div className="text-xs text-gray-500 mt-1">
                  แนะนำขนาด 192x192 px
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  รูปภาพใหญ่ <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
                </label>
                <input
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/banner.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <div className="text-xs text-gray-500 mt-1">
                  รองรับเฉพาะ Chrome/Edge
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL เมื่อคลิก <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
                </label>
                <input
                  type="url"
                  name="url"
                  value={form.url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/promo"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                />
                <div className="text-xs text-gray-500 mt-1">
                  ระบบจะ track การคลิกอัตโนมัติ
                </div>
              </div>

              {/* Save as Template */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="saveAsTemplate"
                    checked={form.saveAsTemplate}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-green-500 rounded focus:ring-green-500 border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    บันทึกเป็น Template
                  </span>
                </label>
                {form.saveAsTemplate && (
                  <input
                    type="text"
                    name="templateName"
                    value={form.templateName}
                    onChange={handleInputChange}
                    placeholder="ชื่อ Template"
                    className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSending || activeSubscribers === 0}
                className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-200"
              >
                {isSending ? (
                  <>
                    {Icons.spinner}
                    <span>กำลังส่ง...</span>
                  </>
                ) : (
                  <>
                    {Icons.send}
                    <span>ส่งไปยัง {activeSubscribers} คน</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Preview & Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              {Icons.eye}
              <h3 className="font-semibold text-gray-800">ตัวอย่าง</h3>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-white">
              <div className="flex items-start gap-3">
                {form.icon ? (
                  <img src={form.icon} alt="" className="w-10 h-10 rounded-lg bg-white object-cover" />
                ) : (
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    {Icons.bell}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {form.title || 'หัวข้อข้อความ'}
                  </div>
                  <div className="text-sm text-gray-300 mt-1 line-clamp-2">
                    {form.body || 'เนื้อหาข้อความ'}
                  </div>
                </div>
              </div>
              {form.image && (
                <img 
                  src={form.image} 
                  alt="" 
                  className="w-full h-32 object-cover rounded-lg mt-3"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              * ตัวอย่างอาจแตกต่างในแต่ละ Browser
            </p>
          </div>

          {/* Info */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              {Icons.info}
              <h3 className="font-semibold text-green-800">ข้อมูลที่รองรับ</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">{Icons.check}</span>
                <span>Title & Body</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">{Icons.check}</span>
                <span>Emoji รองรับทุกแบบ</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">{Icons.check}</span>
                <span>Icon</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500">{Icons.check}</span>
                <span>URL + Click Tracking</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <span className="text-yellow-500">{Icons.info}</span>
                <span>Image (Chrome/Edge)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
