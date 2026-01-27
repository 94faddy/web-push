'use client';

import { useState, useEffect } from 'react';

// =====================================================
// Settings Interface
// =====================================================
export interface AndroidUnsupportedSettings {
  iconColor?: string;
  icon?: string;
  iconBg?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  loadingText?: string;
  copySuccess?: string;
  copyHint?: string;
  buttonHue?: number;
  buttonSaturation?: number;
  buttonLightness?: number;
}

const defaultSettings: Required<AndroidUnsupportedSettings> = {
  icon: 'mdi:alert',
  iconBg: 'linear-gradient(135deg, hsl(45, 85%, 88%) 0%, hsl(45, 75%, 78%) 100%)',
  iconColor: '#f59e0b',
  title: 'Browser ไม่รองรับ',
  subtitle: 'กรุณาเปิดใน Browser ที่รองรับ\nเพื่อสมัครรับการแจ้งเตือน',
  buttonText: '🚀 เปิด Browser ที่รองรับ',
  loadingText: '⏳ กำลังเปิด...',
  copySuccess: 'คัดลอกลิงก์แล้ว!',
  copyHint: 'เปิดใน Chrome แล้ววางลิงก์',
  buttonHue: 142,
  buttonSaturation: 71,
  buttonLightness: 45
};

// Icon Display Helper - รองรับทั้ง emoji และ Iconify icons
function IconDisplay({ icon, color, size = 40 }: { icon: string; color: string; size?: number }) {
  if (!icon.includes(':')) return <span style={{ fontSize: size }}>{icon}</span>;
  const encodedColor = encodeURIComponent(color);
  return <img src={`https://api.iconify.design/${icon}.svg?color=${encodedColor}`} alt="" style={{ width: size, height: size }} />;
}

// =====================================================
// Component Props
// =====================================================
interface AndroidUnsupportedProps {
  currentUrl: string;
  settings?: AndroidUnsupportedSettings;
}

export default function AndroidUnsupported({ currentUrl, settings }: AndroidUnsupportedProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [inAppName, setInAppName] = useState<string>('');
  
  // Merge settings with defaults
  const s = { ...defaultSettings, ...settings };

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    
    // LINE - รองรับ openExternalBrowser=1
    if (/line\/[\d.]+/.test(ua) || ua.includes(' line ') || ua.includes('liff')) {
      setInAppName('LINE');
      return;
    }
    
    // Telegram
    if (ua.includes('telegram') || ua.includes('tgweb')) {
      setInAppName('Telegram');
      return;
    }
    
    // Facebook
    if (ua.includes('fbav/') || ua.includes('fban/') || ua.includes('fb_iab')) {
      setInAppName('Facebook');
      return;
    }
    
    // Messenger
    if (ua.includes('messenger/')) {
      setInAppName('Messenger');
      return;
    }
    
    // Instagram
    if (ua.includes('instagram')) {
      setInAppName('Instagram');
      return;
    }
    
    // TikTok
    if (ua.includes('tiktok') || ua.includes('bytedance')) {
      setInAppName('TikTok');
      return;
    }
    
    // Twitter
    if (ua.includes('twitter')) {
      setInAppName('Twitter');
      return;
    }
    
    setInAppName('Other');
  }, []);

  // สร้าง clean URL
  const getCleanUrl = () => {
    try {
      const url = new URL(currentUrl);
      url.searchParams.delete('t');
      url.searchParams.delete('openExternalBrowser');
      return url.toString();
    } catch {
      return currentUrl;
    }
  };

  // ฟังก์ชันเปิดใน Browser ที่รองรับ
  const openSupportedBrowser = async () => {
    setIsOpening(true);
    
    const cleanUrl = getCleanUrl();
    
    // สร้าง URL พร้อม openExternalBrowser param
    const url = new URL(cleanUrl);
    url.searchParams.set('openExternalBrowser', '1');
    const externalUrl = url.toString();
    
    // === LINE รองรับ openExternalBrowser=1 ===
    if (inAppName === 'LINE') {
      window.location.href = externalUrl;
      return;
    }
    
    // === Telegram ใช้ Telegram WebApp API ===
    if (inAppName === 'Telegram') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const win = window as any;
      
      // ลองใช้ Telegram WebApp API
      if (win.Telegram?.WebApp?.openLink) {
        try {
          win.Telegram.WebApp.openLink(externalUrl, { try_browser: 'chrome' });
          return;
        } catch {
          // ถ้าไม่ได้ ลอง openExternalBrowser=1
        }
      }
      
      // Fallback: ลอง openExternalBrowser=1
      window.location.href = externalUrl;
      
      // รอ 1.5 วินาที ถ้ายังอยู่หน้าเดิม → ลอง Intent URL
      setTimeout(async () => {
        const urlWithoutScheme = cleanUrl.replace('https://', '').replace('http://', '');
        const intentUrl = `intent://${urlWithoutScheme}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(cleanUrl)};end`;
        window.location.href = intentUrl;
        
        // รออีก 1.5 วินาที ถ้ายังไม่ได้ → Copy URL
        setTimeout(async () => {
          try {
            await navigator.clipboard.writeText(cleanUrl);
            setShowCopySuccess(true);
          } catch {
            alert(`กรุณาเปิด Chrome แล้วไปที่:\n\n${cleanUrl}`);
          }
          setIsOpening(false);
        }, 1500);
      }, 1500);
      return;
    }
    
    // === Facebook, Messenger, Instagram, TikTok และอื่นๆ ลอง Intent URL ===
    const urlWithoutScheme = cleanUrl.replace('https://', '').replace('http://', '');
    const intentUrl = `intent://${urlWithoutScheme}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(cleanUrl)};end`;
    
    window.location.href = intentUrl;
    
    // รอ 2 วินาที ถ้ายังอยู่หน้าเดิม → Copy URL
    setTimeout(async () => {
      try {
        await navigator.clipboard.writeText(cleanUrl);
        setShowCopySuccess(true);
      } catch {
        alert(`กรุณาเปิด Chrome แล้วไปที่:\n\n${cleanUrl}`);
      }
      setIsOpening(false);
    }, 2000);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Icon */}
      <div 
        style={{ 
          width: '80px', 
          height: '80px', 
          background: s.iconBg,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}
      >
        <IconDisplay icon={s.icon} color={s.iconColor} />
      </div>

      {/* Title */}
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: 'bold', 
        color: '#1f2937', 
        marginBottom: '8px' 
      }}>
        {s.title}
      </h2>
      
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '24px', 
        fontSize: '14px',
        lineHeight: '1.5'
      }}
        dangerouslySetInnerHTML={{ __html: s.subtitle.replace(/\n/g, '<br/>') }}
      />

      {/* แสดง success message หลัง copy */}
      {showCopySuccess ? (
        <div style={{
          background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
          borderRadius: '12px',
          padding: '20px',
          border: '2px solid #22c55e'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>✅</div>
          <p style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: '#166534',
            marginBottom: '4px'
          }}>
            {s.copySuccess}
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#15803d',
            margin: 0
          }}>
            {s.copyHint}
          </p>
        </div>
      ) : (
        <button
          onClick={openSupportedBrowser}
          disabled={isOpening}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: isOpening 
              ? '#9ca3af'
              : `linear-gradient(135deg, hsl(${s.buttonHue}, ${s.buttonSaturation}%, ${s.buttonLightness}%) 0%, hsl(${s.buttonHue}, ${s.buttonSaturation}%, ${s.buttonLightness - 10}%) 100%)`,
            color: 'white',
            fontWeight: '600',
            borderRadius: '12px',
            border: 'none',
            cursor: isOpening ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            boxShadow: isOpening ? 'none' : `0 4px 14px hsla(${s.buttonHue}, ${s.buttonSaturation}%, ${s.buttonLightness}%, 0.4)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          {isOpening ? (
            <span dangerouslySetInnerHTML={{ __html: s.loadingText }} />
          ) : (
            <span dangerouslySetInnerHTML={{ __html: s.buttonText }} />
          )}
        </button>
      )}

      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}