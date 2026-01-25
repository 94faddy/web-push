'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';
import { LandingPageConfig, LandingPageTemplate, defaultLandingPageConfig } from '@/types';

// HSL Color Picker Component
const HSLColorPicker = ({ 
  value, 
  onChange, 
  label 
}: { 
  value: string; 
  onChange: (color: string) => void; 
  label: string;
}) => {
  const [hsl, setHsl] = useState({ h: 142, s: 71, l: 45 });
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    const match = value.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      setHsl({ h: parseInt(match[1]), s: parseInt(match[2]), l: parseInt(match[3]) });
    }
    setInputValue(value);
  }, [value]);

  const updateColor = (newHsl: typeof hsl) => {
    setHsl(newHsl);
    const color = `hsl(${newHsl.h}, ${newHsl.s}%, ${newHsl.l}%)`;
    setInputValue(color);
    onChange(color);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-3">
        <div 
          className="w-10 h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
          style={{ backgroundColor: inputValue }}
        />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
          }}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          placeholder="hsl(142, 71%, 45%) หรือ #22C55E"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-8">H:</span>
          <input
            type="range"
            min="0"
            max="360"
            value={hsl.h}
            onChange={(e) => updateColor({ ...hsl, h: parseInt(e.target.value) })}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
            style={{ background: 'linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))' }}
          />
          <span className="text-xs text-gray-600 w-8">{hsl.h}°</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-8">S:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={hsl.s}
            onChange={(e) => updateColor({ ...hsl, s: parseInt(e.target.value) })}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-600 w-8">{hsl.s}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-8">L:</span>
          <input
            type="range"
            min="0"
            max="100"
            value={hsl.l}
            onChange={(e) => updateColor({ ...hsl, l: parseInt(e.target.value) })}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-600 w-8">{hsl.l}%</span>
        </div>
      </div>
    </div>
  );
};

// Image Upload Component
const ImageUploader = ({
  value,
  onChange,
  label,
  category = 'other'
}: {
  value?: string | null;
  onChange: (url: string) => void;
  label: string;
  category?: string;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [inputUrl, setInputUrl] = useState(value || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputUrl(value || '');
  }, [value]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setInputUrl(data.data.url);
        onChange(data.data.url);
        Swal.fire({
          icon: 'success',
          title: 'อัพโหลดสำเร็จ',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'อัพโหลดไม่สำเร็จ',
        text: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputUrl}
          onChange={(e) => {
            setInputUrl(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="URL รูปภาพ"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
          }}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 text-sm"
        >
          {isUploading ? '📤' : '📁'}
        </button>
      </div>
      {inputUrl && (
        <div className="mt-2 relative inline-block">
          <img 
            src={inputUrl} 
            alt="Preview" 
            className="w-20 h-20 object-cover rounded-lg border"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => {
              setInputUrl('');
              onChange('');
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

// Tab Button Component
const TabButton = ({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: string; 
  label: string; 
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
      active 
        ? 'bg-green-500 text-white shadow-lg' 
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`}
  >
    <span>{icon}</span>
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// Section Header Component
const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
    <span className="text-xl">{icon}</span>
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
  </div>
);

// Checkmark SVG Component for Preview
const CheckmarkIcon = ({ color = '#22C55E' }: { color?: string }) => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
    <circle cx="32" cy="32" r="30" fill={color} fillOpacity="0.1" />
    <circle cx="32" cy="32" r="24" fill={color} />
    <path 
      d="M44 24L28 40L20 32" 
      stroke="white" 
      strokeWidth="4" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

// Main Component
export default function LandingPageEditorPage() {
  const [config, setConfig] = useState<Partial<LandingPageConfig>>(defaultLandingPageConfig);
  const [templates, setTemplates] = useState<LandingPageTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'templates' | 'general' | 'background' | 'content' | 'button' | 'features' | 'hero'>('general');
  const [currentPage, setCurrentPage] = useState<'subscribe' | 'subscribed'>('subscribe');
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile' | 'ios' | 'android'>('desktop');

  // Fetch config and templates
  const fetchData = useCallback(async () => {
    try {
      const [configRes, templatesRes] = await Promise.all([
        fetch('/api/landing-config'),
        fetch('/api/landing-templates')
      ]);

      const configData = await configRes.json();
      const templatesData = await templatesRes.json();

      if (configData.success && configData.data) {
        setConfig(configData.data);
      }

      if (templatesData.success && templatesData.data) {
        setTemplates(templatesData.data);
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

  // Update config field
  const updateConfig = (field: string, value: unknown) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  // Save config
  const saveConfig = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/landing-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'บันทึกไม่สำเร็จ',
        text: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const resetToDefault = async () => {
    const result = await Swal.fire({
      title: 'รีเซ็ตการตั้งค่า?',
      text: 'การตั้งค่าทั้งหมดจะกลับเป็นค่าเริ่มต้น',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'รีเซ็ต',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await fetch('/api/landing-config', { method: 'DELETE' });
        setConfig(defaultLandingPageConfig);
        Swal.fire({
          icon: 'success',
          title: 'รีเซ็ตสำเร็จ',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Reset failed:', error);
      }
    }
  };

  // Apply template
  const applyTemplate = (template: LandingPageTemplate) => {
    Swal.fire({
      title: `ใช้ Template "${template.name}"?`,
      text: 'การตั้งค่าปัจจุบันจะถูกแทนที่ด้วย Template นี้',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22C55E',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'ใช้ Template',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        setConfig(prev => ({
          ...prev,
          ...template.config,
          template_id: template.id
        }));
        setActiveTab('general');
        Swal.fire({
          icon: 'success',
          title: 'เลือก Template สำเร็จ',
          text: 'อย่าลืมกดบันทึกเพื่อใช้งาน',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  };

  // Get background style
  const getBackgroundStyle = () => {
    if (config.bg_type === 'image' && config.bg_image_url) {
      return {
        backgroundImage: `url(${config.bg_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative' as const
      };
    }
    if (config.bg_type === 'gradient') {
      return {
        background: `linear-gradient(${config.bg_gradient_direction}, ${config.bg_gradient_start}, ${config.bg_gradient_end})`
      };
    }
    return { backgroundColor: config.bg_color };
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
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🎨 แก้ไขหน้า Landing Page</h1>
          <p className="text-gray-500">ปรับแต่งหน้าสมัครรับการแจ้งเตือน</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetToDefault}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            🔄 รีเซ็ต
          </button>
          <button
            onClick={saveConfig}
            disabled={isSaving}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 font-medium"
          >
            {isSaving ? '💾 กำลังบันทึก...' : '💾 บันทึก'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Editor Panel */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border-b border-gray-200 overflow-x-auto">
            <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} icon="📋" label="Templates" />
            <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon="⚙️" label="ทั่วไป" />
            <TabButton active={activeTab === 'background'} onClick={() => setActiveTab('background')} icon="🎨" label="พื้นหลัง" />
            <TabButton active={activeTab === 'content'} onClick={() => setActiveTab('content')} icon="📝" label="ข้อความ" />
            <TabButton active={activeTab === 'button'} onClick={() => setActiveTab('button')} icon="🔘" label="ปุ่ม" />
            <TabButton active={activeTab === 'features'} onClick={() => setActiveTab('features')} icon="✨" label="Features" />
            <TabButton active={activeTab === 'hero'} onClick={() => setActiveTab('hero')} icon="🖼️" label="รูปภาพหลัก" />
          </div>

          {/* Tab Content */}
          <div className="p-6 max-h-[600px] overflow-y-auto">
            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div>
                <SectionHeader icon="📋" title="เลือก Template" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {templates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => applyTemplate(template)}
                      className={`p-3 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                        config.template_id === template.id 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div 
                        className="w-full h-16 rounded-md mb-2"
                        style={{
                          background: template.config.bg_type === 'gradient'
                            ? `linear-gradient(135deg, ${template.config.bg_gradient_start}, ${template.config.bg_gradient_end})`
                            : template.config.bg_color
                        }}
                      />
                      <p className="text-sm font-medium text-gray-800 truncate">{template.name}</p>
                      <p className="text-xs text-gray-500">{template.category}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <SectionHeader icon="📄" title="ข้อมูลหน้า" />
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อหลัก</label>
                    <input
                      type="text"
                      value={config.page_title || ''}
                      onChange={(e) => updateConfig('page_title', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Web Push Notifications"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อรอง</label>
                    <input
                      type="text"
                      value={config.page_subtitle || ''}
                      onChange={(e) => updateConfig('page_subtitle', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="รับการแจ้งเตือนข่าวสารล่าสุดจากเรา"
                    />
                  </div>
                </div>

                {/* ไอคอน - เปลี่ยนตามหน้าที่เลือก */}
                {currentPage === 'subscribe' ? (
                  <>
                    <SectionHeader icon="🔔" title="ไอคอนหลัก (หน้าสมัคร)" />
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทไอคอน</label>
                        <select
                          value={config.main_icon_type || 'emoji'}
                          onChange={(e) => updateConfig('main_icon_type', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="emoji">Emoji</option>
                          <option value="image">รูปภาพ</option>
                          <option value="none">ไม่แสดง</option>
                        </select>
                      </div>
                      {config.main_icon_type === 'emoji' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
                          <input
                            type="text"
                            value={config.main_icon_emoji || ''}
                            onChange={(e) => updateConfig('main_icon_emoji', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-2xl"
                            placeholder="🔔"
                          />
                        </div>
                      )}
                      {config.main_icon_type === 'image' && (
                        <ImageUploader
                          value={config.main_icon_image_url}
                          onChange={(url) => updateConfig('main_icon_image_url', url)}
                          label="รูปภาพไอคอน"
                          category="icon"
                        />
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ขนาดไอคอน (px)</label>
                        <input
                          type="number"
                          value={config.main_icon_size || 48}
                          onChange={(e) => updateConfig('main_icon_size', parseInt(e.target.value))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          min="24"
                          max="128"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <SectionHeader icon="✅" title="ไอคอนสำเร็จ (หน้าสมัครสำเร็จ)" />
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ประเภท</label>
                        <select
                          value={config.success_icon_type || 'checkmark'}
                          onChange={(e) => updateConfig('success_icon_type', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="checkmark">เครื่องหมายถูก (Checkmark)</option>
                          <option value="emoji">Emoji</option>
                          <option value="image">รูปภาพ</option>
                        </select>
                      </div>
                      {config.success_icon_type === 'emoji' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
                          <input
                            type="text"
                            value={config.success_icon_emoji || ''}
                            onChange={(e) => updateConfig('success_icon_emoji', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-2xl"
                            placeholder="✅"
                          />
                        </div>
                      )}
                      {config.success_icon_type === 'image' && (
                        <ImageUploader
                          value={config.success_icon_image_url}
                          onChange={(url) => updateConfig('success_icon_image_url', url)}
                          label="รูปภาพไอคอนสำเร็จ"
                          category="icon"
                        />
                      )}
                      {(config.success_icon_type === 'checkmark' || !config.success_icon_type) && (
                        <HSLColorPicker
                          value={config.success_icon_color || 'hsl(142, 71%, 45%)'}
                          onChange={(color) => updateConfig('success_icon_color', color)}
                          label="สีเครื่องหมายถูก"
                        />
                      )}
                    </div>
                  </>
                )}

                <SectionHeader icon="🏢" title="โลโก้" />
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="show_logo"
                      checked={Boolean(config.show_logo)}
                      onChange={(e) => updateConfig('show_logo', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
                    />
                    <label htmlFor="show_logo" className="text-sm font-medium text-gray-700">แสดงโลโก้</label>
                  </div>
                  {Boolean(config.show_logo) && (
                    <>
                      <ImageUploader
                        value={config.logo_url}
                        onChange={(url) => updateConfig('logo_url', url)}
                        label="รูปโลโก้"
                        category="logo"
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ความกว้าง (px)</label>
                          <input
                            type="number"
                            value={config.logo_width || 120}
                            onChange={(e) => updateConfig('logo_width', parseInt(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ความสูง (px)</label>
                          <input
                            type="number"
                            value={config.logo_height || 40}
                            onChange={(e) => updateConfig('logo_height', parseInt(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Background Tab */}
            {activeTab === 'background' && (
              <div className="space-y-6">
                <SectionHeader icon="🎨" title="พื้นหลังหน้า" />
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทพื้นหลัง</label>
                    <select
                      value={config.bg_type || 'gradient'}
                      onChange={(e) => updateConfig('bg_type', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="color">สีเดียว</option>
                      <option value="gradient">ไล่เฉดสี</option>
                      <option value="image">รูปภาพ</option>
                    </select>
                  </div>

                  {config.bg_type === 'color' && (
                    <HSLColorPicker
                      value={config.bg_color || 'hsl(142, 71%, 45%)'}
                      onChange={(color) => updateConfig('bg_color', color)}
                      label="สีพื้นหลัง"
                    />
                  )}

                  {config.bg_type === 'gradient' && (
                    <>
                      <HSLColorPicker
                        value={config.bg_gradient_start || 'hsl(142, 71%, 45%)'}
                        onChange={(color) => updateConfig('bg_gradient_start', color)}
                        label="สีเริ่มต้น"
                      />
                      <HSLColorPicker
                        value={config.bg_gradient_end || 'hsl(142, 76%, 36%)'}
                        onChange={(color) => updateConfig('bg_gradient_end', color)}
                        label="สีสิ้นสุด"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ทิศทาง</label>
                        <select
                          value={config.bg_gradient_direction || '135deg'}
                          onChange={(e) => updateConfig('bg_gradient_direction', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        >
                          <option value="0deg">บนลงล่าง (0°)</option>
                          <option value="45deg">แนวทแยง (45°)</option>
                          <option value="90deg">ซ้ายไปขวา (90°)</option>
                          <option value="135deg">แนวทแยง (135°)</option>
                          <option value="180deg">ล่างขึ้นบน (180°)</option>
                        </select>
                      </div>
                    </>
                  )}

                  {config.bg_type === 'image' && (
                    <>
                      <ImageUploader
                        value={config.bg_image_url}
                        onChange={(url) => updateConfig('bg_image_url', url)}
                        label="รูปพื้นหลัง"
                        category="background"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">สี Overlay</label>
                        <input
                          type="text"
                          value={config.bg_overlay_color || 'rgba(0,0,0,0.3)'}
                          onChange={(e) => updateConfig('bg_overlay_color', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="rgba(0,0,0,0.3)"
                        />
                      </div>
                    </>
                  )}
                </div>

                <SectionHeader icon="🃏" title="การ์ดเนื้อหา" />
                <div className="space-y-4">
                  <HSLColorPicker
                    value={config.card_bg_color || 'hsl(0, 0%, 100%)'}
                    onChange={(color) => updateConfig('card_bg_color', color)}
                    label="สีพื้นหลังการ์ด"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">มุมโค้ง (px)</label>
                    <input
                      type="range"
                      min="0"
                      max="32"
                      value={config.card_border_radius || 16}
                      onChange={(e) => updateConfig('card_border_radius', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm text-gray-500">{config.card_border_radius || 16}px</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">เงา</label>
                    <input
                      type="text"
                      value={config.card_shadow || '0 10px 40px rgba(0,0,0,0.2)'}
                      onChange={(e) => updateConfig('card_shadow', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="0 10px 40px rgba(0,0,0,0.2)"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Content Tab - เปลี่ยนตามหน้าที่เลือก */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                {currentPage === 'subscribe' ? (
                  <>
                    <SectionHeader icon="📝" title="ข้อความหน้าสมัคร" />
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อ</label>
                        <input
                          type="text"
                          value={config.subscribe_title || ''}
                          onChange={(e) => updateConfig('subscribe_title', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="รับการแจ้งเตือน"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                        <textarea
                          value={config.subscribe_description || ''}
                          onChange={(e) => updateConfig('subscribe_description', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          rows={3}
                          placeholder="สมัครรับการแจ้งเตือนเพื่อไม่พลาดข่าวสาร"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <SectionHeader icon="✅" title="ข้อความหน้าสมัครสำเร็จ" />
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อ</label>
                        <input
                          type="text"
                          value={config.subscribed_title || ''}
                          onChange={(e) => updateConfig('subscribed_title', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="คุณกำลังรับการแจ้งเตือน"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                        <textarea
                          value={config.subscribed_description || ''}
                          onChange={(e) => updateConfig('subscribed_description', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          rows={3}
                          placeholder="คุณจะได้รับข่าวสารอัพเดทล่าสุดจากเรา"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ข้อความเพิ่มเติม (กล่องเขียว)</label>
                        <textarea
                          value={config.subscribed_message || ''}
                          onChange={(e) => updateConfig('subscribed_message', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          rows={2}
                          placeholder="ระบบจะส่งการแจ้งเตือนให้คุณเมื่อมีข่าวสารใหม่"
                        />
                      </div>
                      
                      {/* Success Action Button */}
                      <div className="bg-blue-50 p-4 rounded-lg mt-4">
                        <h4 className="font-medium text-blue-800 mb-3">🔗 ปุ่มลิงก์ปลายทาง (ไม่บังคับ)</h4>
                        <p className="text-sm text-blue-600 mb-3">เพิ่มปุ่มสำหรับนำผู้ใช้ไปยังหน้าอื่น เช่น หน้าโปรโมชั่น</p>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ข้อความปุ่ม</label>
                            <input
                              type="text"
                              value={config.success_button_text || ''}
                              onChange={(e) => updateConfig('success_button_text', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="🎁 รับสิทธิพิเศษ"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">URL ปลายทาง</label>
                            <input
                              type="text"
                              value={config.success_button_url || ''}
                              onChange={(e) => updateConfig('success_button_url', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="https://example.com/promotion"
                            />
                            <p className="text-xs text-gray-500 mt-1">ถ้าไม่ใส่ URL ปุ่มจะไม่แสดง</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <SectionHeader icon="📜" title="Footer" />
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="show_footer"
                      checked={Boolean(config.show_footer)}
                      onChange={(e) => updateConfig('show_footer', e.target.checked)}
                      className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
                    />
                    <label htmlFor="show_footer" className="text-sm font-medium text-gray-700">แสดง Footer</label>
                  </div>
                  {Boolean(config.show_footer) && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ข้อความ Footer</label>
                        <input
                          type="text"
                          value={config.footer_text || ''}
                          onChange={(e) => updateConfig('footer_text', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="© 2024 Company Name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ลิงก์ Footer</label>
                        <input
                          type="text"
                          value={config.footer_link || ''}
                          onChange={(e) => updateConfig('footer_link', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="https://example.com"
                        />
                      </div>
                      <HSLColorPicker
                        value={config.footer_text_color || 'rgba(255,255,255,0.6)'}
                        onChange={(color) => updateConfig('footer_text_color', color)}
                        label="สีข้อความ Footer"
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Button Tab - เฉพาะหน้าสมัคร */}
            {activeTab === 'button' && (
              <div className="space-y-6">
                {currentPage === 'subscribe' ? (
                  <>
                    <SectionHeader icon="🔘" title="ปุ่มสมัคร" />
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ข้อความปุ่ม</label>
                        <input
                          type="text"
                          value={config.button_text || ''}
                          onChange={(e) => updateConfig('button_text', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="🔔 สมัครรับการแจ้งเตือน"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ข้อความขณะโหลด</label>
                        <input
                          type="text"
                          value={config.button_loading_text || ''}
                          onChange={(e) => updateConfig('button_loading_text', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="กำลังดำเนินการ..."
                        />
                      </div>
                      <HSLColorPicker
                        value={config.button_bg_color || 'hsl(142, 71%, 45%)'}
                        onChange={(color) => updateConfig('button_bg_color', color)}
                        label="สีพื้นหลังปุ่ม"
                      />
                      <HSLColorPicker
                        value={config.button_text_color || 'hsl(0, 0%, 100%)'}
                        onChange={(color) => updateConfig('button_text_color', color)}
                        label="สีข้อความปุ่ม"
                      />
                      <HSLColorPicker
                        value={config.button_hover_color || 'hsl(142, 76%, 36%)'}
                        onChange={(color) => updateConfig('button_hover_color', color)}
                        label="สีปุ่มเมื่อ Hover"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">มุมโค้ง (px)</label>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          value={config.button_border_radius || 12}
                          onChange={(e) => updateConfig('button_border_radius', parseInt(e.target.value))}
                          className="w-full"
                        />
                        <span className="text-sm text-gray-500">{config.button_border_radius || 12}px</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">เงาปุ่ม</label>
                        <input
                          type="text"
                          value={config.button_shadow || '0 4px 14px rgba(34,197,94,0.4)'}
                          onChange={(e) => updateConfig('button_shadow', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                          placeholder="0 4px 14px rgba(34,197,94,0.4)"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">ℹ️</div>
                    <p>หน้าสมัครสำเร็จไม่มีปุ่ม</p>
                    <p className="text-sm mt-2">กรุณาเลือก "หน้าสมัคร" เพื่อแก้ไขปุ่ม</p>
                  </div>
                )}
              </div>
            )}

            {/* Features Tab - เฉพาะหน้าสมัคร */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                {currentPage === 'subscribe' ? (
                  <>
                    <SectionHeader icon="✨" title="ส่วน Features" />
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="show_features"
                          checked={config.show_features !== false && config.show_features !== 0}
                          onChange={(e) => updateConfig('show_features', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
                        />
                        <label htmlFor="show_features" className="text-sm font-medium text-gray-700">แสดงส่วน Features</label>
                      </div>
                      
                      {config.show_features !== false && config.show_features !== 0 && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อ Features</label>
                            <input
                              type="text"
                              value={config.features_title || ''}
                              onChange={(e) => updateConfig('features_title', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="สิ่งที่คุณจะได้รับ"
                            />
                          </div>

                          {/* Feature 1 */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-3">Feature 1</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Icon/Emoji</label>
                                <input
                                  type="text"
                                  value={config.feature_1_icon || ''}
                                  onChange={(e) => updateConfig('feature_1_icon', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xl"
                                  placeholder="📰"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">ข้อความ</label>
                                <input
                                  type="text"
                                  value={config.feature_1_text || ''}
                                  onChange={(e) => updateConfig('feature_1_text', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="ข่าวสารล่าสุด"
                                />
                              </div>
                            </div>
                            <div className="mt-3">
                              <ImageUploader
                                value={config.feature_1_image_url}
                                onChange={(url) => updateConfig('feature_1_image_url', url)}
                                label="หรือใช้รูปภาพ (ไม่บังคับ)"
                                category="feature"
                              />
                            </div>
                          </div>

                          {/* Feature 2 */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-3">Feature 2</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Icon/Emoji</label>
                                <input
                                  type="text"
                                  value={config.feature_2_icon || ''}
                                  onChange={(e) => updateConfig('feature_2_icon', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xl"
                                  placeholder="🎁"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">ข้อความ</label>
                                <input
                                  type="text"
                                  value={config.feature_2_text || ''}
                                  onChange={(e) => updateConfig('feature_2_text', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="โปรโมชั่น"
                                />
                              </div>
                            </div>
                            <div className="mt-3">
                              <ImageUploader
                                value={config.feature_2_image_url}
                                onChange={(url) => updateConfig('feature_2_image_url', url)}
                                label="หรือใช้รูปภาพ (ไม่บังคับ)"
                                category="feature"
                              />
                            </div>
                          </div>

                          {/* Feature 3 */}
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-3">Feature 3</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">Icon/Emoji</label>
                                <input
                                  type="text"
                                  value={config.feature_3_icon || ''}
                                  onChange={(e) => updateConfig('feature_3_icon', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xl"
                                  placeholder="⚡"
                                />
                              </div>
                              <div>
                                <label className="block text-sm text-gray-600 mb-1">ข้อความ</label>
                                <input
                                  type="text"
                                  value={config.feature_3_text || ''}
                                  onChange={(e) => updateConfig('feature_3_text', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                  placeholder="แจ้งเตือนทันที"
                                />
                              </div>
                            </div>
                            <div className="mt-3">
                              <ImageUploader
                                value={config.feature_3_image_url}
                                onChange={(url) => updateConfig('feature_3_image_url', url)}
                                label="หรือใช้รูปภาพ (ไม่บังคับ)"
                                category="feature"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">ℹ️</div>
                    <p>หน้าสมัครสำเร็จไม่มี Features</p>
                    <p className="text-sm mt-2">กรุณาเลือก "หน้าสมัคร" เพื่อแก้ไข Features</p>
                  </div>
                )}
              </div>
            )}

            {/* Hero Image Tab - เฉพาะหน้าสมัคร */}
            {activeTab === 'hero' && (
              <div className="space-y-6">
                {currentPage === 'subscribe' ? (
                  <>
                    <SectionHeader icon="🖼️" title="รูปภาพหลัก" />
                    <p className="text-sm text-gray-500 mb-4">
                      รูปภาพจะแสดงก่อนปุ่มสมัครรับการแจ้งเตือน เหมาะสำหรับโปรโมชั่นหรือแบนเนอร์
                    </p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="show_hero_image"
                          checked={Boolean(config.show_hero_image)}
                          onChange={(e) => updateConfig('show_hero_image', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
                        />
                        <label htmlFor="show_hero_image" className="text-sm font-medium text-gray-700">แสดงรูปภาพหลัก</label>
                      </div>

                      {Boolean(config.show_hero_image) && (
                        <>
                          <ImageUploader
                            value={config.hero_image_url}
                            onChange={(url) => updateConfig('hero_image_url', url)}
                            label="รูปภาพ"
                            category="hero"
                          />
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ลิงก์เมื่อคลิก (ไม่บังคับ)</label>
                            <input
                              type="text"
                              value={config.hero_image_link || ''}
                              onChange={(e) => updateConfig('hero_image_link', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                              placeholder="https://example.com/promotion"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">มุมโค้ง (px)</label>
                            <input
                              type="range"
                              min="0"
                              max="24"
                              value={config.hero_image_radius || 12}
                              onChange={(e) => updateConfig('hero_image_radius', parseInt(e.target.value))}
                              className="w-full"
                            />
                            <span className="text-sm text-gray-500">{config.hero_image_radius || 12}px</span>
                          </div>
                        </>
                      )}
                    </div>

                    <SectionHeader icon="💻" title="Custom CSS" />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">CSS เพิ่มเติม</label>
                      <textarea
                        value={config.custom_css || ''}
                        onChange={(e) => updateConfig('custom_css', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 font-mono text-sm"
                        rows={6}
                        placeholder=".custom-class { ... }"
                      />
                      <p className="text-xs text-gray-500 mt-1">CSS จะถูกนำไปใช้กับหน้า Landing Page</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <div className="text-4xl mb-4">ℹ️</div>
                    <p>หน้าสมัครสำเร็จไม่มีรูปภาพหลัก</p>
                    <p className="text-sm mt-2">กรุณาเลือก "หน้าสมัคร" เพื่อแก้ไขรูปภาพหลัก</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Preview Header */}
          <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">👁️ ตัวอย่าง</h3>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`px-2 py-1.5 rounded-lg text-xs ${previewMode === 'desktop' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                💻
              </button>
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`px-2 py-1.5 rounded-lg text-xs ${previewMode === 'mobile' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                📱
              </button>
              <button
                onClick={() => setPreviewMode('ios')}
                className={`px-2 py-1.5 rounded-lg text-xs ${previewMode === 'ios' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                🍎 iOS
              </button>
              <button
                onClick={() => setPreviewMode('android')}
                className={`px-2 py-1.5 rounded-lg text-xs ${previewMode === 'android' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                🤖 Android
              </button>
            </div>
          </div>

          {/* Page Selector */}
          <div className="flex gap-2 p-4 bg-gray-50 border-b border-gray-200">
            <button
              onClick={() => setCurrentPage('subscribe')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'subscribe' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              📝 หน้าสมัคร
            </button>
            <button
              onClick={() => setCurrentPage('subscribed')}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'subscribed' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              ✅ สมัครสำเร็จ
            </button>
          </div>

          {/* Preview Content */}
          <div className="p-4 bg-gray-100 min-h-[600px] flex items-start justify-center overflow-auto">
            <div 
              className={`transition-all duration-300 ${(previewMode === 'mobile' || previewMode === 'ios' || previewMode === 'android') ? 'w-[375px]' : 'w-full max-w-[480px]'}`}
              style={{
                transform: (previewMode === 'mobile' || previewMode === 'ios' || previewMode === 'android') ? 'scale(0.85)' : 'scale(1)',
                transformOrigin: 'top center'
              }}
            >
              {/* Preview Frame */}
              <div 
                className="min-h-[500px] p-6 sm:p-10 relative"
                style={getBackgroundStyle()}
              >
                {config.bg_type === 'image' && config.bg_image_url && (
                  <div 
                    className="absolute inset-0"
                    style={{ backgroundColor: config.bg_overlay_color }}
                  />
                )}
                
                <div className="relative z-10 max-w-md mx-auto">
                  {/* Logo */}
                  {Boolean(config.show_logo) && config.logo_url && (
                    <div className="text-center mb-4">
                      <img 
                        src={config.logo_url} 
                        alt="Logo"
                        style={{ width: config.logo_width, height: config.logo_height }}
                        className="mx-auto object-contain"
                      />
                    </div>
                  )}

                  {/* Page Title */}
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-white mb-2">
                      {config.page_title || 'Web Push Notifications'}
                    </h1>
                    <p className="text-white/80">
                      {config.page_subtitle || 'รับการแจ้งเตือนข่าวสารล่าสุดจากเรา'}
                    </p>
                  </div>

                  {/* Card */}
                  <div 
                    className="p-6 sm:p-8"
                    style={{
                      backgroundColor: config.card_bg_color || 'white',
                      borderRadius: `${config.card_border_radius || 16}px`,
                      boxShadow: config.card_shadow || '0 10px 40px rgba(0,0,0,0.2)'
                    }}
                  >
                    {currentPage === 'subscribe' ? (
                      <>
                        {/* iOS Preview Mode */}
                        {previewMode === 'ios' ? (
                          <div className="text-center">
                            {/* Main Icon */}
                            {config.main_icon_type !== 'none' && (
                              <div className="text-center mb-4">
                                {config.main_icon_type === 'emoji' || !config.main_icon_type ? (
                                  <span style={{ fontSize: `${config.main_icon_size || 48}px` }}>
                                    {config.main_icon_emoji || '🔔'}
                                  </span>
                                ) : config.main_icon_type === 'image' && config.main_icon_image_url ? (
                                  <img 
                                    src={config.main_icon_image_url} 
                                    alt="Icon"
                                    style={{ width: config.main_icon_size || 48, height: config.main_icon_size || 48 }}
                                    className="mx-auto object-contain"
                                  />
                                ) : null}
                              </div>
                            )}
                            
                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                              {config.subscribe_title || 'เพิ่มไปยังหน้าจอโฮม'}
                            </h2>
                            <p className="text-gray-600 mb-4">
                              {config.subscribe_description || 'กรุณาเพิ่มแอปนี้ไปยังหน้าจอโฮมก่อน'}
                            </p>
                            
                            {/* Hero Image */}
                            {Boolean(config.show_hero_image) && config.hero_image_url && (
                              <div className="mb-4">
                                <img 
                                  src={config.hero_image_url} 
                                  alt="Hero"
                                  className="w-full"
                                  style={{ borderRadius: `${config.hero_image_radius || 12}px` }}
                                />
                              </div>
                            )}
                            
                            {/* iOS Instructions */}
                            <div className="bg-green-50 rounded-xl p-4 text-left mb-4">
                              <p className="text-sm font-semibold text-green-700 mb-3">📌 วิธีติดตั้ง:</p>
                              <ol className="text-sm text-green-600 space-y-2 pl-4">
                                <li className="flex items-center gap-2">
                                  กดปุ่ม <span className="inline-block px-2 py-0.5 bg-gray-200 rounded text-xs">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="inline">
                                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                      <polyline points="16 6 12 2 8 6" />
                                      <line x1="12" y1="2" x2="12" y2="15" />
                                    </svg>
                                  </span> ที่ด้านล่าง
                                </li>
                                <li>เลื่อนหาและกด <b>&quot;เพิ่มไปยังหน้าจอโฮม&quot;</b></li>
                                <li>เปิดแอปจากหน้าจอโฮม แล้วสมัครรับการแจ้งเตือน</li>
                              </ol>
                            </div>
                          </div>
                        ) : previewMode === 'android' ? (
                          /* Android Preview Mode */
                          <div className="text-center">
                            {/* Main Icon */}
                            {config.main_icon_type !== 'none' && (
                              <div className="text-center mb-4">
                                {config.main_icon_type === 'emoji' || !config.main_icon_type ? (
                                  <span style={{ fontSize: `${config.main_icon_size || 48}px` }}>
                                    {config.main_icon_emoji || '🔔'}
                                  </span>
                                ) : config.main_icon_type === 'image' && config.main_icon_image_url ? (
                                  <img 
                                    src={config.main_icon_image_url} 
                                    alt="Icon"
                                    style={{ width: config.main_icon_size || 48, height: config.main_icon_size || 48 }}
                                    className="mx-auto object-contain"
                                  />
                                ) : null}
                              </div>
                            )}
                            
                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                              {config.subscribe_title || 'เปิดใน Browser'}
                            </h2>
                            <p className="text-gray-600 mb-4">
                              {config.subscribe_description || 'กรุณาเปิดใน Browser เพื่อรับการแจ้งเตือน'}
                            </p>
                            
                            {/* Hero Image */}
                            {Boolean(config.show_hero_image) && config.hero_image_url && (
                              <div className="mb-4">
                                <img 
                                  src={config.hero_image_url} 
                                  alt="Hero"
                                  className="w-full"
                                  style={{ borderRadius: `${config.hero_image_radius || 12}px` }}
                                />
                              </div>
                            )}
                            
                            {/* Android Browser Buttons */}
                            <div className="mb-4">
                              <p className="text-sm font-semibold text-gray-700 mb-3">📲 เลือก Browser:</p>
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-blue-500 rounded-lg text-blue-500 text-sm">
                                  🌐 Chrome
                                </div>
                                <div className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-orange-500 rounded-lg text-orange-500 text-sm">
                                  🦊 Firefox
                                </div>
                                <div className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-cyan-500 rounded-lg text-cyan-500 text-sm">
                                  🔷 Edge
                                </div>
                                <div className="flex items-center justify-center gap-2 px-3 py-2 border-2 border-red-500 rounded-lg text-red-500 text-sm">
                                  🔴 Opera
                                </div>
                              </div>
                            </div>
                            
                            {/* Android Instructions */}
                            <div className="bg-amber-50 rounded-xl p-4 text-left">
                              <p className="text-sm font-semibold text-amber-700 mb-2">📌 วิธีอื่น:</p>
                              <ol className="text-sm text-amber-600 space-y-1 pl-4">
                                <li>กดปุ่ม <b>⋮</b> หรือ <b>...</b> ที่มุมขวาบน</li>
                                <li>เลือก <b>&quot;เปิดใน Browser&quot;</b></li>
                              </ol>
                            </div>
                          </div>
                        ) : (
                          /* Normal Desktop/Mobile Preview */
                          <>
                            {/* Main Icon */}
                            {config.main_icon_type !== 'none' && (
                              <div className="text-center mb-4">
                                {config.main_icon_type === 'emoji' || !config.main_icon_type ? (
                                  <span style={{ fontSize: `${config.main_icon_size || 48}px` }}>
                                    {config.main_icon_emoji || '🔔'}
                                  </span>
                                ) : config.main_icon_type === 'image' && config.main_icon_image_url ? (
                                  <img 
                                    src={config.main_icon_image_url} 
                                    alt="Icon"
                                    style={{ width: config.main_icon_size || 48, height: config.main_icon_size || 48 }}
                                    className="mx-auto object-contain"
                                  />
                                ) : null}
                              </div>
                            )}

                            {/* Subscribe Content */}
                            <div className="text-center mb-6">
                              <h2 className="text-xl font-bold text-gray-800 mb-2">
                                {config.subscribe_title || 'รับการแจ้งเตือน'}
                              </h2>
                              <p className="text-gray-600">
                                {config.subscribe_description || 'สมัครรับการแจ้งเตือนเพื่อไม่พลาดข่าวสาร'}
                              </p>
                            </div>

                            {/* Hero Image */}
                            {Boolean(config.show_hero_image) && config.hero_image_url && (
                              <div className="mb-4">
                                <img 
                                  src={config.hero_image_url} 
                                  alt="Hero"
                                  className="w-full"
                                  style={{ borderRadius: `${config.hero_image_radius || 12}px` }}
                                />
                              </div>
                            )}

                            {/* Button */}
                            <button
                              className="w-full py-3.5 px-6 font-semibold transition-all"
                              style={{
                                backgroundColor: config.button_bg_color || '#22C55E',
                                color: config.button_text_color || 'white',
                                borderRadius: `${config.button_border_radius || 12}px`,
                                boxShadow: config.button_shadow || '0 4px 14px rgba(34,197,94,0.4)'
                              }}
                            >
                              {config.button_text || '🔔 สมัครรับการแจ้งเตือน'}
                            </button>
                          </>
                        )}

                        {/* Features - show only in desktop/mobile mode */}
                        {(previewMode === 'desktop' || previewMode === 'mobile') && config.show_features !== false && config.show_features !== 0 && (
                          <div className="mt-8 pt-6 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-gray-800 mb-4 text-center">
                              {config.features_title || 'สิ่งที่คุณจะได้รับ'}
                            </h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                {config.feature_1_image_url ? (
                                  <img src={config.feature_1_image_url} alt="" className="w-8 h-8 mx-auto mb-1 object-contain" />
                                ) : (
                                  <div className="text-2xl mb-1">{config.feature_1_icon || '📰'}</div>
                                )}
                                <div className="text-xs text-gray-600">{config.feature_1_text || 'ข่าวสารล่าสุด'}</div>
                              </div>
                              <div>
                                {config.feature_2_image_url ? (
                                  <img src={config.feature_2_image_url} alt="" className="w-8 h-8 mx-auto mb-1 object-contain" />
                                ) : (
                                  <div className="text-2xl mb-1">{config.feature_2_icon || '🎁'}</div>
                                )}
                                <div className="text-xs text-gray-600">{config.feature_2_text || 'โปรโมชั่น'}</div>
                              </div>
                              <div>
                                {config.feature_3_image_url ? (
                                  <img src={config.feature_3_image_url} alt="" className="w-8 h-8 mx-auto mb-1 object-contain" />
                                ) : (
                                  <div className="text-2xl mb-1">{config.feature_3_icon || '⚡'}</div>
                                )}
                                <div className="text-xs text-gray-600">{config.feature_3_text || 'แจ้งเตือนทันที'}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      /* Subscribed State */
                      <div className="text-center">
                        {/* Success Icon */}
                        <div className="mb-4 flex justify-center">
                          {config.success_icon_type === 'emoji' ? (
                            <span style={{ fontSize: '48px' }}>
                              {config.success_icon_emoji || '✅'}
                            </span>
                          ) : config.success_icon_type === 'image' && config.success_icon_image_url ? (
                            <img 
                              src={config.success_icon_image_url} 
                              alt="Success"
                              className="w-16 h-16 object-contain"
                            />
                          ) : (
                            <CheckmarkIcon color={config.success_icon_color || '#22C55E'} />
                          )}
                        </div>

                        {/* Subscribed Content */}
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                          {config.subscribed_title || 'คุณกำลังรับการแจ้งเตือน'}
                        </h2>
                        <p className="text-gray-600 mb-4">
                          {config.subscribed_description || 'คุณจะได้รับข่าวสารอัพเดทล่าสุดจากเรา'}
                        </p>

                        {/* Success Action Button */}
                        {config.success_button_url && (
                          <a
                            href="#"
                            className="block w-full py-3.5 px-6 font-semibold text-center mb-4"
                            style={{
                              backgroundColor: config.button_bg_color || '#22C55E',
                              color: config.button_text_color || 'white',
                              borderRadius: `${config.button_border_radius || 12}px`,
                              boxShadow: config.button_shadow || '0 4px 14px rgba(34,197,94,0.4)',
                              textDecoration: 'none'
                            }}
                          >
                            {config.success_button_text || '🎁 รับสิทธิพิเศษ'}
                          </a>
                        )}

                        {/* Additional Message */}
                        <div 
                          className="rounded-lg p-4"
                          style={{ 
                            backgroundColor: config.success_icon_color ? `${config.success_icon_color}20` : '#f0fdf4'
                          }}
                        >
                          <p 
                            className="text-sm"
                            style={{ color: config.success_icon_color || '#15803d' }}
                          >
                            🔔 {config.subscribed_message || 'ระบบจะส่งการแจ้งเตือนให้คุณเมื่อมีข่าวสารใหม่'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {Boolean(config.show_footer) && config.footer_text && (
                    <div className="mt-4 text-center">
                      <p style={{ color: config.footer_text_color || 'rgba(255,255,255,0.6)' }} className="text-sm">
                        {config.footer_text}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}