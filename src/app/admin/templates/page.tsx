'use client';

import { useEffect, useState, useCallback } from 'react';
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
  )
};

interface TemplateForm {
  id?: number;
  name: string;
  title: string;
  body: string;
  icon: string;
  image: string;
  url: string;
}

const emptyForm: TemplateForm = {
  name: '',
  title: '',
  body: '',
  icon: '',
  image: '',
  url: ''
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<TemplateForm>(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      if (data.success) {
        setTemplates(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
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
      icon: template.icon || '',
      image: template.image || '',
      url: template.url || ''
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.title.trim() || !form.body.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'กรุณากรอกข้อมูล',
        text: 'ชื่อ, หัวข้อ และข้อความจำเป็นต้องกรอก',
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
        fetchTemplates();
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
          fetchTemplates();
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Templates</h1>
          <p className="text-gray-500">จัดการข้อความที่ใช้บ่อย</p>
        </div>
        <button
          onClick={openCreateForm}
          className="px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all flex items-center gap-2 shadow-lg shadow-green-200 font-medium"
        >
          {Icons.plus}
          <span>สร้าง Template</span>
        </button>
      </div>

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
            <form onSubmit={handleSave} className="p-6 space-y-4">
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
              </div>

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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
                </label>
                <input
                  type="url"
                  name="image"
                  value={form.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL <span className="text-gray-400 font-normal">(ไม่บังคับ)</span>
                </label>
                <input
                  type="url"
                  name="url"
                  value={form.url}
                  onChange={handleInputChange}
                  placeholder="https://example.com/promo"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
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
            <div key={template.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow card-hover">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-800">{template.name}</h3>
                  <div className="flex gap-1">
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
                  <div className="font-medium text-sm truncate">{template.title}</div>
                  <div className="text-xs text-gray-300 mt-1 line-clamp-2">{template.body}</div>
                </div>

                <div className="text-xs text-gray-400 mb-4">
                  สร้างเมื่อ: {formatDate(template.created_at)}
                </div>

                <a
                  href="/admin/send"
                  className="w-full py-2.5 px-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
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
