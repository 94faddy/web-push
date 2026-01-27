'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2';
import { Template } from '@/types';

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
  ),
  settings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  upload: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  x: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  save: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  xCircle: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

interface PushForm {
  title: string;
  body: string;
  image: string;
  url: string;
  saveAsTemplate: boolean;
  templateName: string;
}

interface PushSettings {
  sender_name: string;
  sender_icon: string | null;
}

// URL validation helper
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function SendPushPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'send' | 'settings'>('send');
  
  // Form state
  const [form, setForm] = useState<PushForm>({
    title: '',
    body: '',
    image: '',
    url: '',
    saveAsTemplate: false,
    templateName: ''
  });
  
  // Settings state
  const [settings, setSettings] = useState<PushSettings>({
    sender_name: 'แจ้งเตือน',
    sender_icon: null
  });
  
  const [isSending, setIsSending] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [activeSubscribers, setActiveSubscribers] = useState(0);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  // Load template from history if coming from history page
  useEffect(() => {
    if (searchParams.get('from') === 'history') {
      const savedTemplate = sessionStorage.getItem('pushTemplate');
      if (savedTemplate) {
        try {
          const templateData = JSON.parse(savedTemplate);
          setForm(prev => ({
            ...prev,
            title: templateData.title || '',
            body: templateData.body || '',
            image: templateData.image || '',
            url: templateData.url || ''
          }));
          sessionStorage.removeItem('pushTemplate');
          
          Swal.fire({
            icon: 'info',
            title: 'โหลดข้อมูลจากประวัติ',
            text: 'ข้อมูลจากประวัติการส่งถูกโหลดแล้ว',
            timer: 2000,
            showConfirmButton: false
          });
        } catch (e) {
          console.error('Failed to parse template:', e);
        }
      }
    }
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    try {
      const [templatesRes, statsRes, settingsRes] = await Promise.all([
        fetch('/api/templates'),
        fetch('/api/stats'),
        fetch('/api/push-settings')
      ]);

      const [templatesData, statsData, settingsData] = await Promise.all([
        templatesRes.json(),
        statsRes.json(),
        settingsRes.json()
      ]);

      if (templatesData.success) setTemplates(templatesData.data || []);
      if (statsData.success) setActiveSubscribers(statsData.data.activeSubscribers || 0);
      if (settingsData.success && settingsData.data) {
        setSettings({
          sender_name: settingsData.data.sender_name || 'แจ้งเตือน',
          sender_icon: settingsData.data.sender_icon || null
        });
      }
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

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file upload
  const handleFileUpload = async (file: File, type: 'icon' | 'image') => {
    if (type === 'icon') {
      setUploadingIcon(true);
    } else {
      setUploadingImage(true);
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
        if (type === 'icon') {
          setSettings(prev => ({ ...prev, sender_icon: data.data.url }));
          Swal.fire({
            icon: 'success',
            title: 'อัพโหลด Icon สำเร็จ',
            text: 'ปรับขนาดเป็น 192x192 แล้ว',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          setForm(prev => ({ ...prev, image: data.data.url }));
          const sizeText = data.data.resized 
            ? `ปรับขนาดเป็น ${data.data.width}x${data.data.height} แล้ว`
            : `ขนาด ${data.data.width}x${data.data.height}`;
          Swal.fire({
            icon: 'success',
            title: 'อัพโหลดรูปภาพสำเร็จ',
            text: sizeText,
            timer: 1500,
            showConfirmButton: false
          });
        }
      } else {
        throw new Error(data.error || 'อัพโหลดไม่สำเร็จ');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'อัพโหลดไม่สำเร็จ',
        text: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#22C55E'
      });
    } finally {
      setUploadingIcon(false);
      setUploadingImage(false);
    }
  };

  const loadTemplate = (template: Template) => {
    setForm(prev => ({
      ...prev,
      title: template.title,
      body: template.body,
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

  const handleSaveSettings = async () => {
    if (!settings.sender_name.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'กรุณากรอกชื่อผู้ส่ง',
        confirmButtonColor: '#22C55E'
      });
      return;
    }

    setIsSavingSettings(true);

    try {
      const response = await fetch('/api/push-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกการตั้งค่าสำเร็จ',
          text: 'การตั้งค่านี้จะใช้กับการส่งทุกครั้ง',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#22C55E'
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Validation
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!form.title.trim()) errors.push('หัวข้อ');
    if (!form.body.trim()) errors.push('ข้อความ');
    if (!form.image.trim()) errors.push('รูปภาพใหญ่');
    if (!form.url.trim()) errors.push('URL เมื่อคลิก');
    
    if (form.url.trim() && !isValidUrl(form.url.trim())) {
      errors.push('URL ไม่ถูกต้อง');
    }
    
    return errors;
  };

  const isFormValid = validateForm().length === 0;

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();
    
    if (errors.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'กรุณากรอกข้อมูลให้ครบ',
        html: `<div class="text-left"><p>ข้อมูลที่ต้องกรอก:</p><ul class="list-disc pl-5 mt-2">${errors.map(e => `<li class="text-red-600">${e}</li>`).join('')}</ul></div>`,
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
        <div class="text-left space-y-2">
          <p><strong>ชื่อผู้ส่ง:</strong> ${settings.sender_name}</p>
          <p><strong>หัวข้อ:</strong> ${form.title}</p>
          <p><strong>ข้อความ:</strong> ${form.body}</p>
          <p><strong>URL:</strong> ${form.url}</p>
          <p class="mt-4 text-green-600 font-semibold">ส่งไปยัง ${activeSubscribers} คน</p>
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
        body: JSON.stringify({
          ...form,
          icon: settings.sender_icon
        })
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
          image: '',
          url: '',
          saveAsTemplate: false,
          templateName: ''
        });

        fetchData();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'ส่งไม่สำเร็จ',
        text: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#22C55E'
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ส่ง Push Notification</h1>
          <p className="text-gray-600 mt-1">
            {activeSubscribers > 0 
              ? `มีผู้ติดตาม ${activeSubscribers} คน`
              : 'ยังไม่มีผู้ติดตาม'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/history"
            className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            {Icons.history}
            <span>ประวัติ</span>
          </Link>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              showTemplates 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {Icons.template}
            <span>Templates</span>
          </button>
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && templates.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">เลือก Template</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => loadTemplate(template)}
                className="p-4 text-left bg-gray-50 hover:bg-green-50 rounded-lg border border-gray-200 hover:border-green-300 transition-all"
              >
                <div className="font-medium text-gray-800 truncate">{template.name}</div>
                <div className="text-sm text-gray-500 truncate mt-1">{template.title}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('send')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'send'
                ? 'bg-green-500 text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {Icons.send}
            <span>ส่งข้อความ</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-green-500 text-white'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {Icons.settings}
            <span>ตั้งค่าการส่ง</span>
          </button>
        </div>
      </div>

      {/* Content based on Tab */}
      {activeTab === 'send' ? (
        /* Send Tab */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Form */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <form onSubmit={handleSendPush} className="space-y-6">
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
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      form.title.trim() ? 'border-green-300 bg-green-50/30' : 'border-gray-300'
                    }`}
                    maxLength={100}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">{form.title.length}/100 ตัวอักษร</span>
                    {form.title.trim() && <span className="text-xs text-green-600 flex items-center gap-1">{Icons.check} กรอกแล้ว</span>}
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
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all ${
                      form.body.trim() ? 'border-green-300 bg-green-50/30' : 'border-gray-300'
                    }`}
                    maxLength={255}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">{form.body.length}/255 ตัวอักษร</span>
                    {form.body.trim() && <span className="text-xs text-green-600 flex items-center gap-1">{Icons.check} กรอกแล้ว</span>}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รูปภาพใหญ่ <span className="text-red-500">*</span>
                  </label>
                  
                  {form.image ? (
                    <div className="relative">
                      <img 
                        src={form.image} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg border-2 border-green-300"
                      />
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, image: '' }))}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg"
                        title="ลบรูปภาพ"
                      >
                        {Icons.x}
                      </button>
                      <div className="absolute bottom-2 left-2 px-3 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                        {Icons.check} อัพโหลดแล้ว
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => imageInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-all"
                    >
                      <input
                        type="file"
                        ref={imageInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'image');
                          e.target.value = '';
                        }}
                      />
                      {uploadingImage ? (
                        <div className="flex flex-col items-center gap-3">
                          {Icons.spinner}
                          <span className="text-gray-500">กำลังอัพโหลด...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                            {Icons.upload}
                          </div>
                          <div>
                            <p className="text-gray-600 font-medium">คลิกเพื่ออัพโหลดรูปภาพ</p>
                            <p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG, GIF (แนะนำขนาด 720x360 px)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    * ระบบจะปรับขนาดรูปเป็น 720x360 (อัตราส่วน 2:1) อัตโนมัติ (เเสดงเฉพาะบน Chrome,Edge, เเละมือถือ android)
                  </p>
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL เมื่อคลิก <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={form.url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/promo"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                      form.url.trim() && isValidUrl(form.url.trim()) 
                        ? 'border-green-300 bg-green-50/30' 
                        : form.url.trim() && !isValidUrl(form.url.trim())
                        ? 'border-red-300 bg-red-50/30'
                        : 'border-gray-300'
                    }`}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">ระบบจะ track การคลิกอัตโนมัติ</span>
                    {form.url.trim() && (
                      isValidUrl(form.url.trim()) 
                        ? <span className="text-xs text-green-600 flex items-center gap-1">{Icons.check} URL ถูกต้อง</span>
                        : <span className="text-xs text-red-600 flex items-center gap-1">{Icons.xCircle} URL ไม่ถูกต้อง</span>
                    )}
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
                      className="w-full mt-3 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isSending || activeSubscribers === 0 || !isFormValid}
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
          <div className="xl:col-span-1 space-y-6">
            {/* Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                {Icons.eye}
                <h3 className="font-semibold text-gray-800">ตัวอย่าง</h3>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-white">
                <div className="flex items-start gap-3">
                  {settings.sender_icon ? (
                    <img src={settings.sender_icon} alt="" className="w-12 h-12 rounded-lg bg-white object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      {Icons.bell}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 mb-1">{settings.sender_name}</div>
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
              <p className="text-xs text-gray-500 mt-4 text-center">
                * ตัวอย่างอาจแตกต่างในแต่ละ Browser
              </p>
            </div>

            {/* Required Fields Status */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                {Icons.info}
                <h3 className="font-semibold text-gray-800">สถานะการกรอก</h3>
              </div>
              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-lg ${form.title.trim() ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <span className="text-sm text-gray-700">หัวข้อ</span>
                  {form.title.trim() 
                    ? <span className="text-green-600">{Icons.check}</span>
                    : <span className="text-gray-400">{Icons.xCircle}</span>
                  }
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg ${form.body.trim() ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <span className="text-sm text-gray-700">ข้อความ</span>
                  {form.body.trim() 
                    ? <span className="text-green-600">{Icons.check}</span>
                    : <span className="text-gray-400">{Icons.xCircle}</span>
                  }
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg ${form.image.trim() ? 'bg-green-50' : 'bg-gray-50'}`}>
                  <span className="text-sm text-gray-700">รูปภาพใหญ่</span>
                  {form.image.trim() 
                    ? <span className="text-green-600">{Icons.check}</span>
                    : <span className="text-gray-400">{Icons.xCircle}</span>
                  }
                </div>
                <div className={`flex items-center justify-between p-3 rounded-lg ${form.url.trim() && isValidUrl(form.url.trim()) ? 'bg-green-50' : form.url.trim() ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <span className="text-sm text-gray-700">URL เมื่อคลิก</span>
                  {form.url.trim() && isValidUrl(form.url.trim())
                    ? <span className="text-green-600">{Icons.check}</span>
                    : form.url.trim()
                    ? <span className="text-red-600">{Icons.xCircle}</span>
                    : <span className="text-gray-400">{Icons.xCircle}</span>
                  }
                </div>
              </div>
            </div>

            {/* Settings Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                {Icons.settings}
                <h3 className="font-semibold text-blue-800">การตั้งค่าปัจจุบัน</h3>
              </div>
              <div className="space-y-3 text-sm text-blue-700">
                <div className="flex items-center gap-3">
                  <span className="font-medium">ชื่อผู้ส่ง:</span>
                  <span>{settings.sender_name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium">Icon:</span>
                  {settings.sender_icon ? (
                    <img src={settings.sender_icon} alt="" className="w-8 h-8 rounded" />
                  ) : (
                    <span className="text-gray-400">ใช้ค่าเริ่มต้น</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveTab('settings')}
                className="mt-4 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                แก้ไขการตั้งค่า →
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Settings Tab */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">ตั้งค่าการส่ง Push Notification</h3>
              <p className="text-gray-600 mb-6">
                การตั้งค่านี้จะใช้กับการส่ง Push Notification ทุกครั้ง และใช้แสดงใน PWA Shortcut (iOS Add to Home Screen)
              </p>

              <div className="space-y-6">
                {/* Sender Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อผู้ส่ง / ชื่อ App <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="sender_name"
                    value={settings.sender_name}
                    onChange={handleSettingsChange}
                    placeholder="แจ้งเตือน"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    ชื่อนี้จะแสดงใน Notification และเป็นชื่อ App บน iOS Home Screen
                  </p>
                </div>

                {/* Sender Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon <span className="text-gray-400 font-normal">(แนะนำขนาด 192x192 px)</span>
                  </label>
                  <div className="flex gap-4 items-start">
                    {/* Icon Preview */}
                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 overflow-hidden flex-shrink-0">
                      {settings.sender_icon ? (
                        <img src={settings.sender_icon} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <div className="w-8 h-8 mx-auto mb-1">{Icons.upload}</div>
                          <span className="text-xs">No Icon</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <input
                        type="file"
                        ref={iconInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, 'icon');
                          e.target.value = '';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => iconInputRef.current?.click()}
                        disabled={uploadingIcon}
                        className="w-full px-4 py-3 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                      >
                        {uploadingIcon ? Icons.spinner : Icons.upload}
                        <span>{uploadingIcon ? 'กำลังอัพโหลด...' : 'อัพโหลด Icon'}</span>
                      </button>
                      {settings.sender_icon && (
                        <button
                          type="button"
                          onClick={() => setSettings(prev => ({ ...prev, sender_icon: null }))}
                          className="w-full text-sm text-red-600 hover:text-red-800 py-2"
                        >
                          ลบ Icon
                        </button>
                      )}
                      <p className="text-xs text-gray-500">
                        ระบบจะปรับขนาดรูปเป็น 192x192 อัตโนมัติ
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="w-full py-4 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-200"
                >
                  {isSavingSettings ? (
                    <>
                      {Icons.spinner}
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      {Icons.save}
                      <span>บันทึกการตั้งค่า</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="xl:col-span-1 space-y-6">
            {/* Notification Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                {Icons.eye}
                <h3 className="font-semibold text-gray-800">ตัวอย่าง Notification</h3>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 text-white">
                <div className="flex items-start gap-3">
                  {settings.sender_icon ? (
                    <img src={settings.sender_icon} alt="" className="w-12 h-12 rounded-lg bg-white object-cover" />
                  ) : (
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      {Icons.bell}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-400 mb-1">{settings.sender_name}</div>
                    <div className="font-medium truncate">หัวข้อตัวอย่าง</div>
                    <div className="text-sm text-gray-300 mt-1">ข้อความตัวอย่าง</div>
                  </div>
                </div>
              </div>
            </div>

            {/* PWA Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                {Icons.bell}
                <h3 className="font-semibold text-gray-800">ตัวอย่าง iOS Home Screen</h3>
              </div>
              <div className="bg-gradient-to-b from-blue-100 to-blue-200 rounded-xl p-8">
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-lg overflow-hidden flex items-center justify-center">
                    {settings.sender_icon ? (
                      <img src={settings.sender_icon} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white">
                        {Icons.bell}
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-sm text-gray-800 font-medium text-center truncate max-w-[100px]">
                    {settings.sender_name}
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                * แสดงเมื่อ user กด &quot;เพิ่มไปยังหน้าจอหลัก&quot;
              </p>
            </div>

            {/* Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                {Icons.info}
                <h3 className="font-semibold text-yellow-800">หมายเหตุ</h3>
              </div>
              <ul className="text-sm text-yellow-700 space-y-2">
                <li>• ชื่อและ Icon จะใช้กับทุกการส่ง</li>
                <li>• iOS จะแสดงชื่อนี้เป็นชื่อ App</li>
                <li>• แนะนำใช้รูป PNG ขนาด 192x192</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}