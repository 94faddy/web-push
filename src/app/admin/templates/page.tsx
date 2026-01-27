'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import { Template } from '@/types';

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
  send: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  document: (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  close: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  spinner: (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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
  bell: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  eye: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

interface TemplateForm {
  id?: number;
  name: string;
  title: string;
  body: string;
  image: string;
  url: string;
}

interface PushSettings {
  sender_name: string;
  sender_icon: string | null;
}

const emptyForm: TemplateForm = {
  name: '',
  title: '',
  body: '',
  image: '',
  url: ''
};

// URL validation helper
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showPreview, setShowPreview] = useState<Template | null>(null);
  const [pushSettings, setPushSettings] = useState<PushSettings>({
    sender_name: 'แจ้งเตือน',
    sender_icon: null
  });
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    try {
      const [templatesRes, settingsRes] = await Promise.all([
        fetch('/api/templates'),
        fetch('/api/push-settings')
      ]);
      
      const [templatesData, settingsData] = await Promise.all([
        templatesRes.json(),
        settingsRes.json()
      ]);
      
      if (templatesData.success) {
        setTemplates(templatesData.data || []);
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (file: File) => {
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'image');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
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
      setUploadingImage(false);
    }
  };

  const openCreateForm = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setShowForm(true);
  };

  const openEditForm = (template: Template) => {
    setForm({
      id: template.id,
      name: template.name,
      title: template.title,
      body: template.body,
      image: template.image || '',
      url: template.url || ''
    });
    setIsEditing(true);
    setShowForm(true);
  };

  // Validation
  const validateForm = (): string[] => {
    const errors: string[] = [];
    
    if (!form.name.trim()) errors.push('ชื่อ Template');
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

  const handleSave = async (e: React.FormEvent) => {
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

    setIsSaving(true);

    try {
      const response = await fetch('/api/templates', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: isEditing ? 'อัพเดทสำเร็จ' : 'สร้างสำเร็จ',
          timer: 1500,
          showConfirmButton: false
        });
        setShowForm(false);
        setForm(emptyForm);
        fetchData();
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

  const handleDelete = async (id: number, name: string) => {
    const result = await Swal.fire({
      title: 'ลบ Template?',
      text: `ต้องการลบ "${name}" หรือไม่?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('/api/templates', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ',
            timer: 1500,
            showConfirmButton: false
          });
          fetchData();
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error instanceof Error ? error.message : 'ไม่สามารถลบได้'
        });
      }
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Templates</h1>
          <p className="text-gray-500 mt-1">จัดการข้อความที่ใช้บ่อย</p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-2 shadow-lg shadow-green-200 font-medium"
        >
          {Icons.plus}
          <span>สร้าง Template</span>
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="text-blue-600 mt-0.5">{Icons.info}</div>
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">การใช้งาน Template</h3>
            <p className="text-sm text-blue-700">
              Template จะใช้ <strong>ชื่อผู้ส่ง</strong> และ <strong>Icon</strong> จากการตั้งค่าในหน้า &quot;ส่งข้อความ&quot; → &quot;ตั้งค่าการส่ง&quot;
            </p>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <span className="text-blue-600">การตั้งค่าปัจจุบัน:</span>
              {pushSettings.sender_icon && (
                <img src={pushSettings.sender_icon} alt="" className="w-5 h-5 rounded" />
              )}
              <span className="font-medium text-blue-800">{pushSettings.sender_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">ตัวอย่าง: {showPreview.name}</h2>
              <button onClick={() => setShowPreview(null)} className="text-gray-400 hover:text-gray-600">
                {Icons.close}
              </button>
            </div>
            <div className="p-5">
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
                    <div className="font-medium truncate">{showPreview.title}</div>
                    <div className="text-sm text-gray-300 mt-1 line-clamp-2">{showPreview.body}</div>
                  </div>
                </div>
                {showPreview.image && (
                  <img 
                    src={showPreview.image} 
                    alt="" 
                    className="w-full h-32 object-cover rounded-lg mt-3"
                  />
                )}
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                * ตัวอย่างอาจแตกต่างในแต่ละ Browser
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {isEditing ? 'แก้ไข Template' : 'สร้าง Template ใหม่'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                {Icons.close}
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-5">
              {/* Template Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ชื่อ Template <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  placeholder="เช่น: โปรโมชั่นประจำเดือน"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    form.name.trim() ? 'border-green-300 bg-green-50/30' : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-end mt-1">
                  {form.name.trim() && <span className="text-xs text-green-600 flex items-center gap-1">{Icons.check} กรอกแล้ว</span>}
                </div>
              </div>

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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    form.title.trim() ? 'border-green-300 bg-green-50/30' : 'border-gray-300'
                  }`}
                  maxLength={100}
                />
                <div className="flex justify-between items-center mt-1">
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
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none ${
                    form.body.trim() ? 'border-green-300 bg-green-50/30' : 'border-gray-300'
                  }`}
                  maxLength={255}
                />
                <div className="flex justify-between items-center mt-1">
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
                      className="w-full h-40 object-cover rounded-lg border-2 border-green-300"
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
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50/30 transition-all"
                  >
                    <input
                      type="file"
                      ref={imageInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                        e.target.value = '';
                      }}
                    />
                    {uploadingImage ? (
                      <div className="flex flex-col items-center gap-2">
                        {Icons.spinner}
                        <span className="text-gray-500">กำลังอัพโหลด...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                          {Icons.upload}
                        </div>
                        <p className="text-gray-600 font-medium">คลิกเพื่ออัพโหลดรูปภาพ</p>
                        <p className="text-xs text-gray-400">รองรับ JPG, PNG, GIF (แนะนำขนาด 720x360 px)</p>
                        <p className="text-xs text-gray-400">ระบบจะปรับขนาดเป็น 720x360 อัตโนมัติ</p>
                      </div>
                    )}
                  </div>
                )}
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
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    form.url.trim() && isValidUrl(form.url.trim()) 
                      ? 'border-green-300 bg-green-50/30' 
                      : form.url.trim() && !isValidUrl(form.url.trim())
                      ? 'border-red-300 bg-red-50/30'
                      : 'border-gray-300'
                  }`}
                />
                <div className="flex justify-end mt-1">
                  {form.url.trim() && (
                    isValidUrl(form.url.trim()) 
                      ? <span className="text-xs text-green-600 flex items-center gap-1">{Icons.check} URL ถูกต้อง</span>
                      : <span className="text-xs text-red-600 flex items-center gap-1">{Icons.xCircle} URL ไม่ถูกต้อง</span>
                  )}
                </div>
              </div>

              {/* Preview in Form */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-3">ตัวอย่าง</div>
                <div className="bg-gray-800 rounded-lg p-4 text-white">
                  <div className="flex items-start gap-3">
                    {pushSettings.sender_icon ? (
                      <img src={pushSettings.sender_icon} alt="" className="w-10 h-10 rounded-lg bg-white object-cover" />
                    ) : (
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                        {Icons.bell}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-gray-400">{pushSettings.sender_name}</div>
                      <div className="font-medium text-sm truncate">{form.title || 'หัวข้อ'}</div>
                      <div className="text-xs text-gray-300 mt-0.5 line-clamp-1">{form.body || 'ข้อความ'}</div>
                    </div>
                  </div>
                  {form.image && (
                    <img src={form.image} alt="" className="w-full h-20 object-cover rounded mt-2" />
                  )}
                </div>
              </div>

              {/* Validation Status */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-sm font-medium text-gray-700 mb-3">สถานะการกรอก</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'ชื่อ Template', valid: !!form.name.trim() },
                    { label: 'หัวข้อ', valid: !!form.title.trim() },
                    { label: 'ข้อความ', valid: !!form.body.trim() },
                    { label: 'รูปภาพ', valid: !!form.image.trim() },
                    { label: 'URL', valid: !!form.url.trim() && isValidUrl(form.url.trim()) },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center justify-between p-2 rounded ${item.valid ? 'bg-green-50' : 'bg-white'}`}>
                      <span className="text-xs text-gray-600">{item.label}</span>
                      {item.valid 
                        ? <span className="text-green-600">{Icons.check}</span>
                        : <span className="text-gray-300">{Icons.xCircle}</span>
                      }
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !isFormValid}
                  className="flex-1 py-3 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                >
                  {isSaving ? Icons.spinner : null}
                  <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึก'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">{template.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => setShowPreview(template)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                      title="ดูตัวอย่าง"
                    >
                      {Icons.eye}
                    </button>
                    <button
                      onClick={() => openEditForm(template)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                      title="แก้ไข"
                    >
                      {Icons.edit}
                    </button>
                    <button
                      onClick={() => handleDelete(template.id, template.name)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                      title="ลบ"
                    >
                      {Icons.trash}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4 text-white mb-4">
                  <div className="flex items-start gap-3">
                    {pushSettings.sender_icon ? (
                      <img src={pushSettings.sender_icon} alt="" className="w-10 h-10 rounded bg-white object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-10 h-10 bg-green-500 rounded flex items-center justify-center flex-shrink-0">
                        {Icons.bell}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{template.title}</div>
                      <div className="text-xs text-gray-300 mt-1 line-clamp-2">{template.body}</div>
                    </div>
                  </div>
                  {template.image && (
                    <img src={template.image} alt="" className="w-full h-20 object-cover rounded mt-3" />
                  )}
                </div>

                <div className="text-xs text-gray-400 mb-4">
                  สร้างเมื่อ: {formatDate(template.created_at)}
                </div>

                <a
                  href="/admin/send"
                  className="w-full py-3 px-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  {Icons.send}
                  <span>ใช้ส่ง Push</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-gray-300 flex justify-center mb-4">{Icons.document}</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">ยังไม่มี Template</h3>
          <p className="text-gray-500 mb-6">สร้าง Template เพื่อใช้ข้อความซ้ำได้ง่ายขึ้น</p>
          <button
            onClick={openCreateForm}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium inline-flex items-center gap-2"
          >
            {Icons.plus}
            <span>สร้าง Template แรก</span>
          </button>
        </div>
      )}
    </div>
  );
}