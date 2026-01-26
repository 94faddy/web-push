'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Swal from 'sweetalert2';

interface PageSettings {
  button_hue: number;
  button_saturation: number;
  button_lightness: number;
  bg_type: 'solid' | 'gradient' | 'image';
  bg_hue: number;
  bg_saturation: number;
  bg_lightness: number;
  bg_gradient_hue2: number;
  bg_gradient_saturation2: number;
  bg_gradient_lightness2: number;
  bg_gradient_angle: number;
  bg_image_url: string;
  bg_image_overlay: boolean;
  bg_image_overlay_opacity: number;
  logo_url: string;
  logo_width: number;
  page_title: string;
  page_subtitle: string;
}

const defaultSettings: PageSettings = {
  button_hue: 142,
  button_saturation: 71,
  button_lightness: 45,
  bg_type: 'gradient',
  bg_hue: 142,
  bg_saturation: 71,
  bg_lightness: 45,
  bg_gradient_hue2: 142,
  bg_gradient_saturation2: 76,
  bg_gradient_lightness2: 36,
  bg_gradient_angle: 135,
  bg_image_url: '',
  bg_image_overlay: true,
  bg_image_overlay_opacity: 40,
  logo_url: '',
  logo_width: 120,
  page_title: 'Web Push Notifications',
  page_subtitle: 'รับการแจ้งเตือนข่าวสารล่าสุดจากเรา'
};

// Icons
const Icons = {
  palette: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  image: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  text: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
  ),
  eye: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  save: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
    </svg>
  ),
  reset: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  upload: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  ),
  trash: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  spinner: (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
};

export default function PageSettingsPage() {
  const [settings, setSettings] = useState<PageSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [token, setToken] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/page-settings');
      const data = await response.json();
      if (data.success && data.data) {
        setSettings({ ...defaultSettings, ...data.data });
      }

      // Get token for preview
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      if (userData.success) {
        setToken(userData.data.token);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Upload file handler
  const handleUpload = async (file: File, type: 'logo' | 'background') => {
    if (type === 'logo') setUploadingLogo(true);
    else setUploadingBg(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        if (type === 'logo') {
          updateSetting('logo_url', data.data.url);
        } else {
          updateSetting('bg_image_url', data.data.url);
        }
        Swal.fire({
          icon: 'success',
          title: 'อัพโหลดสำเร็จ!',
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
        text: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#22C55E'
      });
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingBg(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'background') => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file, type);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/page-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ!',
          timer: 1500,
          showConfirmButton: false
        });
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

  const handleReset = () => {
    Swal.fire({
      title: 'รีเซ็ตการตั้งค่า?',
      text: 'จะกลับไปใช้ค่าเริ่มต้น',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'รีเซ็ต',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      if (result.isConfirmed) {
        setSettings(defaultSettings);
      }
    });
  };

  const updateSetting = <K extends keyof PageSettings>(key: K, value: PageSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Generate preview styles
  const getBackgroundStyle = (): React.CSSProperties => {
    const { bg_type, bg_hue, bg_saturation, bg_lightness, 
            bg_gradient_hue2, bg_gradient_saturation2, bg_gradient_lightness2, 
            bg_gradient_angle, bg_image_url, bg_image_overlay, bg_image_overlay_opacity } = settings;

    if (bg_type === 'image' && bg_image_url) {
      if (bg_image_overlay) {
        return {
          backgroundImage: `linear-gradient(rgba(0,0,0,${bg_image_overlay_opacity / 100}), rgba(0,0,0,${bg_image_overlay_opacity / 100})), url(${bg_image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      }
      return {
        backgroundImage: `url(${bg_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      };
    }

    if (bg_type === 'gradient') {
      const color1 = `hsl(${bg_hue}, ${bg_saturation}%, ${bg_lightness}%)`;
      const color2 = `hsl(${bg_gradient_hue2}, ${bg_gradient_saturation2}%, ${bg_gradient_lightness2}%)`;
      return { background: `linear-gradient(${bg_gradient_angle}deg, ${color1}, ${color2})` };
    }

    return { background: `hsl(${bg_hue}, ${bg_saturation}%, ${bg_lightness}%)` };
  };

  const getButtonGradient = () => {
    const { button_hue, button_saturation, button_lightness } = settings;
    const darkerLightness = Math.max(button_lightness - 10, 10);
    return `linear-gradient(135deg, hsl(${button_hue}, ${button_saturation}%, ${button_lightness}%) 0%, hsl(${button_hue}, ${button_saturation + 5}%, ${darkerLightness}%) 100%)`;
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
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">ตั้งค่าหน้าเว็บ</h1>
          <p className="text-gray-500">ปรับแต่งหน้าลงทะเบียนรับการแจ้งเตือน</p>
        </div>
        <div className="flex gap-3">
          {token && (
            <button
              onClick={() => window.open(`/s/${token}`, '_blank')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              {Icons.eye}
              <span>ดูตัวอย่าง</span>
            </button>
          )}
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
          >
            {Icons.reset}
            <span>รีเซ็ต</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? Icons.spinner : Icons.save}
            <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึก'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Button Color */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              {Icons.palette}
              <h3 className="text-lg font-semibold text-gray-800">สีปุ่ม</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hue (สี): {settings.button_hue}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={settings.button_hue}
                  onChange={(e) => updateSetting('button_hue', parseInt(e.target.value))}
                  className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: 'linear-gradient(to right, hsl(0,70%,50%), hsl(60,70%,50%), hsl(120,70%,50%), hsl(180,70%,50%), hsl(240,70%,50%), hsl(300,70%,50%), hsl(360,70%,50%))'
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Saturation (ความอิ่มตัว): {settings.button_saturation}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.button_saturation}
                  onChange={(e) => updateSetting('button_saturation', parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lightness (ความสว่าง): {settings.button_lightness}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={settings.button_lightness}
                  onChange={(e) => updateSetting('button_lightness', parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-4 pt-2">
                <span className="text-sm text-gray-600">ตัวอย่าง:</span>
                <div 
                  className="px-6 py-2 rounded-lg text-white font-medium shadow-lg"
                  style={{ background: getButtonGradient() }}
                >
                  🔔 สมัครรับการแจ้งเตือน
                </div>
              </div>
            </div>
          </div>

          {/* Background Settings */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              {Icons.image}
              <h3 className="text-lg font-semibold text-gray-800">พื้นหลัง</h3>
            </div>

            {/* Background Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทพื้นหลัง</label>
              <div className="grid grid-cols-3 gap-3">
                {(['solid', 'gradient', 'image'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => updateSetting('bg_type', type)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      settings.bg_type === type 
                        ? 'border-green-500 bg-green-50 text-green-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {type === 'solid' && 'สีเดียว'}
                    {type === 'gradient' && 'Gradient'}
                    {type === 'image' && 'รูปภาพ'}
                  </button>
                ))}
              </div>
            </div>

            {/* Solid / Gradient Color 1 */}
            {(settings.bg_type === 'solid' || settings.bg_type === 'gradient') && (
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-gray-700">
                  {settings.bg_type === 'gradient' ? 'สีที่ 1' : 'สีพื้นหลัง'}
                </h4>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Hue: {settings.bg_hue}°</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={settings.bg_hue}
                    onChange={(e) => updateSetting('bg_hue', parseInt(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: 'linear-gradient(to right, hsl(0,70%,50%), hsl(60,70%,50%), hsl(120,70%,50%), hsl(180,70%,50%), hsl(240,70%,50%), hsl(300,70%,50%), hsl(360,70%,50%))'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Saturation: {settings.bg_saturation}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.bg_saturation}
                    onChange={(e) => updateSetting('bg_saturation', parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Lightness: {settings.bg_lightness}%</label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={settings.bg_lightness}
                    onChange={(e) => updateSetting('bg_lightness', parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Gradient Color 2 */}
            {settings.bg_type === 'gradient' && (
              <div className="space-y-4 mb-6 pt-4 border-t border-gray-100">
                <h4 className="font-medium text-gray-700">สีที่ 2</h4>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Hue: {settings.bg_gradient_hue2}°</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={settings.bg_gradient_hue2}
                    onChange={(e) => updateSetting('bg_gradient_hue2', parseInt(e.target.value))}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: 'linear-gradient(to right, hsl(0,70%,50%), hsl(60,70%,50%), hsl(120,70%,50%), hsl(180,70%,50%), hsl(240,70%,50%), hsl(300,70%,50%), hsl(360,70%,50%))'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Saturation: {settings.bg_gradient_saturation2}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.bg_gradient_saturation2}
                    onChange={(e) => updateSetting('bg_gradient_saturation2', parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">Lightness: {settings.bg_gradient_lightness2}%</label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={settings.bg_gradient_lightness2}
                    onChange={(e) => updateSetting('bg_gradient_lightness2', parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-2">มุม Gradient: {settings.bg_gradient_angle}°</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={settings.bg_gradient_angle}
                    onChange={(e) => updateSetting('bg_gradient_angle', parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Image Upload */}
            {settings.bg_type === 'image' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">รูปภาพพื้นหลัง</label>
                  
                  {/* Upload Button */}
                  <input
                    ref={bgInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'background')}
                    className="hidden"
                  />
                  
                  <div className="flex gap-3 mb-3">
                    <button
                      onClick={() => bgInputRef.current?.click()}
                      disabled={uploadingBg}
                      className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-green-600"
                    >
                      {uploadingBg ? Icons.spinner : Icons.upload}
                      <span>{uploadingBg ? 'กำลังอัพโหลด...' : 'อัพโหลดรูปภาพ'}</span>
                    </button>
                    {settings.bg_image_url && (
                      <button
                        onClick={() => updateSetting('bg_image_url', '')}
                        className="px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        {Icons.trash}
                      </button>
                    )}
                  </div>

                  {/* URL Input */}
                  <div className="relative">
                    <input
                      type="url"
                      value={settings.bg_image_url}
                      onChange={(e) => updateSetting('bg_image_url', e.target.value)}
                      placeholder="หรือวาง URL รูปภาพ"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Preview */}
                  {settings.bg_image_url && (
                    <div className="mt-3 relative rounded-lg overflow-hidden h-32">
                      <img 
                        src={settings.bg_image_url} 
                        alt="Background preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="bg_image_overlay"
                    checked={settings.bg_image_overlay}
                    onChange={(e) => updateSetting('bg_image_overlay', e.target.checked)}
                    className="w-5 h-5 text-green-500 rounded focus:ring-green-500"
                  />
                  <label htmlFor="bg_image_overlay" className="text-sm text-gray-700">
                    เพิ่ม Overlay สีดำ (ทำให้ตัวหนังสือชัดขึ้น)
                  </label>
                </div>
                {settings.bg_image_overlay && (
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">
                      ความทึบของ Overlay: {settings.bg_image_overlay_opacity}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={settings.bg_image_overlay_opacity}
                      onChange={(e) => updateSetting('bg_image_overlay_opacity', parseInt(e.target.value))}
                      className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logo & Text */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              {Icons.text}
              <h3 className="text-lg font-semibold text-gray-800">โลโก้และข้อความ</h3>
            </div>
            <div className="space-y-4">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">โลโก้</label>
                
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'logo')}
                  className="hidden"
                />
                
                <div className="flex gap-3 mb-3">
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all flex items-center justify-center gap-2 text-gray-600 hover:text-green-600"
                  >
                    {uploadingLogo ? Icons.spinner : Icons.upload}
                    <span>{uploadingLogo ? 'กำลังอัพโหลด...' : 'อัพโหลดโลโก้'}</span>
                  </button>
                  {settings.logo_url && (
                    <button
                      onClick={() => updateSetting('logo_url', '')}
                      className="px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      {Icons.trash}
                    </button>
                  )}
                </div>

                {/* URL Input */}
                <input
                  type="url"
                  value={settings.logo_url}
                  onChange={(e) => updateSetting('logo_url', e.target.value)}
                  placeholder="หรือวาง URL โลโก้"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />

                {/* Preview */}
                {settings.logo_url && (
                  <div className="mt-3 flex items-center gap-4">
                    <img 
                      src={settings.logo_url} 
                      alt="Logo preview" 
                      style={{ width: settings.logo_width, height: 'auto' }}
                      className="max-h-20 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              {settings.logo_url && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ขนาดโลโก้: {settings.logo_width}px
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="300"
                    value={settings.logo_width}
                    onChange={(e) => updateSetting('logo_width', parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">หัวข้อหน้าเว็บ</label>
                <input
                  type="text"
                  value={settings.page_title}
                  onChange={(e) => updateSetting('page_title', e.target.value)}
                  placeholder="Web Push Notifications"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบาย</label>
                <input
                  type="text"
                  value={settings.page_subtitle}
                  onChange={(e) => updateSetting('page_subtitle', e.target.value)}
                  placeholder="รับการแจ้งเตือนข่าวสารล่าสุดจากเรา"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="xl:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ตัวอย่าง</h3>
            <div 
              className="rounded-xl overflow-hidden shadow-2xl"
              style={{ 
                ...getBackgroundStyle(),
                minHeight: '500px',
                padding: '24px 16px'
              }}
            >
              {/* Logo Preview */}
              {settings.logo_url && (
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <img 
                    src={settings.logo_url} 
                    alt="Logo" 
                    style={{ width: settings.logo_width, height: 'auto', maxWidth: '100%' }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
              
              {/* Header Preview */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: 'white', marginBottom: '6px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  {settings.page_title || 'Web Push Notifications'}
                </h1>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
                  {settings.page_subtitle || 'รับการแจ้งเตือนข่าวสารล่าสุดจากเรา'}
                </p>
              </div>

              {/* Card Preview */}
              <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    fontSize: '28px'
                  }}>
                    🔔
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#1f2937', marginBottom: '6px' }}>
                    รับการแจ้งเตือน
                  </h2>
                  <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '12px' }}>
                    สมัครรับการแจ้งเตือนเพื่อไม่พลาดข่าวสาร
                  </p>
                  <button style={{
                    width: '100%',
                    padding: '10px 16px',
                    background: getButtonGradient(),
                    color: 'white',
                    fontWeight: '600',
                    borderRadius: '10px',
                    border: 'none',
                    fontSize: '14px',
                    boxShadow: `0 4px 14px hsla(${settings.button_hue}, ${settings.button_saturation}%, ${settings.button_lightness}%, 0.4)`
                  }}>
                    🔔 สมัครรับการแจ้งเตือน
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}