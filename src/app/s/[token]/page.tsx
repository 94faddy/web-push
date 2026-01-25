'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { usePushNotification } from '@/hooks/usePushNotification';
import { LandingPageConfig, defaultLandingPageConfig } from '@/types';

// Browser icons mapping
const browserIcons: Record<string, string> = {
  'Chrome': '🌐',
  'Chrome (iOS)': '🌐',
  'Safari': '🧭',
  'Safari (iOS)': '🧭',
  'Firefox': '🦊',
  'Firefox (iOS)': '🦊',
  'Brave': '🦁',
  'Edge': '🔷',
  'Edge (iOS)': '🔷',
  'Opera': '🔴',
  'Opera (iOS)': '🔴',
  'Browser (iOS)': '📱',
  'Samsung Internet': '🌐',
  'LINE': '💬',
  'Facebook': '📘',
  'Instagram': '📷',
  'Twitter/X': '🐦',
  'TikTok': '🎵',
  'Snapchat': '👻',
  'WebView': '📱',
  'UC Browser': '🟣',
  'Mi Browser': '🟠',
  'Vivo Browser': '🔵',
  'Oppo Browser': '🟢',
  'Huawei Browser': '🔴',
  'Unknown': '🌐',
  'unknown': '🌐'
};

// iOS Share Icon Component (SVG)
const ShareIcon = () => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

// Checkmark SVG Component
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

// ตรวจสอบ Platform
function getPlatform(): 'android' | 'ios' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  return 'desktop';
}

// สร้าง URL สำหรับเปิด Browser ต่างๆ
function getBrowserOpenUrl(browserName: string, targetUrl: string): { url: string; fallbackUrl: string } {
  const platform = getPlatform();
  
  switch (browserName) {
    case 'chrome':
      if (platform === 'android') {
        return {
          url: `intent://${targetUrl.replace('https://', '').replace('http://', '')}#Intent;scheme=https;package=com.android.chrome;end`,
          fallbackUrl: 'https://play.google.com/store/apps/details?id=com.android.chrome'
        };
      }
      return { url: targetUrl, fallbackUrl: targetUrl };
      
    case 'firefox':
      if (platform === 'android') {
        return {
          url: `intent://${targetUrl.replace('https://', '').replace('http://', '')}#Intent;scheme=https;package=org.mozilla.firefox;end`,
          fallbackUrl: 'https://play.google.com/store/apps/details?id=org.mozilla.firefox'
        };
      }
      return { url: targetUrl, fallbackUrl: targetUrl };
      
    case 'brave':
      if (platform === 'android') {
        return {
          url: `intent://${targetUrl.replace('https://', '').replace('http://', '')}#Intent;scheme=https;package=com.brave.browser;end`,
          fallbackUrl: 'https://play.google.com/store/apps/details?id=com.brave.browser'
        };
      }
      return { url: targetUrl, fallbackUrl: targetUrl };
      
    case 'edge':
      if (platform === 'android') {
        return {
          url: `intent://${targetUrl.replace('https://', '').replace('http://', '')}#Intent;scheme=https;package=com.microsoft.emmx;end`,
          fallbackUrl: 'https://play.google.com/store/apps/details?id=com.microsoft.emmx'
        };
      }
      return { url: targetUrl, fallbackUrl: targetUrl };
      
    case 'samsung':
      if (platform === 'android') {
        return {
          url: `intent://${targetUrl.replace('https://', '').replace('http://', '')}#Intent;scheme=https;package=com.sec.android.app.sbrowser;end`,
          fallbackUrl: 'https://play.google.com/store/apps/details?id=com.sec.android.app.sbrowser'
        };
      }
      return { url: targetUrl, fallbackUrl: targetUrl };
      
    default:
      return { url: targetUrl, fallbackUrl: targetUrl };
  }
}

// ฟังก์ชันเปิด Browser
function openInBrowser(browserName: string, targetUrl: string) {
  const { url } = getBrowserOpenUrl(browserName, targetUrl);
  
  const newWindow = window.open(url, '_blank');
  
  if (!newWindow || newWindow.closed) {
    window.location.href = url;
  }
}

// รายชื่อ Browser ที่รองรับสำหรับ Android
const supportedBrowsers = [
  { id: 'chrome', name: 'Chrome', icon: '🌐', color: '#4285F4' },
  { id: 'brave', name: 'Brave', icon: '🦁', color: '#FB542B' },
  { id: 'firefox', name: 'Firefox', icon: '🦊', color: '#FF7139' },
  { id: 'edge', name: 'Edge', icon: '🔷', color: '#0078D7' },
  { id: 'samsung', name: 'Samsung', icon: '🌐', color: '#1428A0', androidOnly: true },
];

export default function SubscribePage() {
  const params = useParams();
  const token = params.token as string;
  
  const {
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    needsInstall,
    browserInfo
  } = usePushNotification(token);

  const [mounted, setMounted] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');
  const [currentUrl, setCurrentUrl] = useState('');
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [config, setConfig] = useState<Partial<LandingPageConfig>>(defaultLandingPageConfig);
  const [configLoaded, setConfigLoaded] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  // Get browser icon
  const getBrowserIcon = (browserName: string): string => {
    return browserIcons[browserName] || '🌐';
  };

  // Fetch landing page config
  useEffect(() => {
    if (token) {
      fetch(`/api/landing-config/public/${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data) {
            setConfig(data.data);
          }
        })
        .catch(err => {
          console.error('Failed to fetch landing config:', err);
        })
        .finally(() => {
          setConfigLoaded(true);
        });
    }
  }, [token]);

  useEffect(() => {
    setMounted(true);
    setPlatform(getPlatform());
    setCurrentUrl(window.location.href);
    
    if (token && typeof document !== 'undefined') {
      const manifestUrl = `/api/manifest/${token}`;
      let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (link) {
        link.href = manifestUrl;
      } else {
        link = document.createElement('link');
        link.rel = 'manifest';
        link.href = manifestUrl;
        document.head.appendChild(link);
      }
    }
  }, [token]);

  useEffect(() => {
    if (error) {
      if (browserInfo.isBrave && error.includes('Brave')) {
        Swal.fire({
          icon: 'warning',
          title: '🦁 Brave Browser',
          html: `
            <div style="text-align:left">
              <p style="margin-bottom:16px">Brave ต้องเปิดใช้งาน Push Messaging ก่อน:</p>
              <ol style="padding-left:20px">
                <li>พิมพ์ <b>brave://settings/privacy</b> ในแถบ URL</li>
                <li>เลื่อนหา <b>"Use Google Services for Push Messaging"</b></li>
                <li>เปิดใช้งาน (Toggle On)</li>
                <li>รีเฟรชหน้านี้แล้วลองใหม่</li>
              </ol>
            </div>
          `,
          confirmButtonColor: config.button_bg_color || '#22C55E',
          confirmButtonText: 'เข้าใจแล้ว'
        });
      } else if (browserInfo.isEdge && error.includes('Edge')) {
        Swal.fire({
          icon: 'warning',
          title: '🔷 Edge Browser',
          html: `
            <div style="text-align:left">
              <p style="margin-bottom:16px">กรุณาเปิดใช้งาน Notifications ใน Edge:</p>
              <ol style="padding-left:20px">
                <li>คลิกที่ไอคอน <b>🔒</b> ในแถบ URL</li>
                <li>คลิก <b>"Site permissions"</b></li>
                <li>หา <b>"Notifications"</b></li>
                <li>เปลี่ยนเป็น <b>"Allow"</b></li>
                <li>รีเฟรชหน้านี้แล้วลองใหม่</li>
              </ol>
            </div>
          `,
          confirmButtonColor: config.button_bg_color || '#22C55E',
          confirmButtonText: 'เข้าใจแล้ว'
        });
      }
    }
  }, [error, browserInfo.isBrave, browserInfo.isEdge, config.button_bg_color]);

  const browserIcon = getBrowserIcon(browserInfo.name);

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      setJustSubscribed(true);
      Swal.fire({
        icon: 'success',
        title: 'สมัครสำเร็จ!',
        text: 'คุณจะได้รับการแจ้งเตือนจากเราแล้ว',
        confirmButtonColor: config.button_bg_color || '#22C55E'
      });
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    Swal.fire({
      icon: 'success',
      title: 'คัดลอกลิงก์แล้ว!',
      text: 'วางลิงก์นี้ในเบราว์เซอร์ที่รองรับ',
      timer: 2000,
      showConfirmButton: false
    });
  };

  const showBraveGuide = () => {
    Swal.fire({
      icon: 'info',
      title: '🦁 วิธีเปิด Push ใน Brave',
      html: `
        <div style="text-align:left;font-size:14px">
          <ol style="padding-left:20px">
            <li style="margin-bottom:8px">เปิดแท็บใหม่ พิมพ์ <b>brave://settings/privacy</b></li>
            <li style="margin-bottom:8px">เลื่อนหา <b>"Use Google Services for Push Messaging"</b></li>
            <li style="margin-bottom:8px">เปิดใช้งาน (Toggle On)</li>
            <li>กลับมาหน้านี้แล้วรีเฟรช</li>
          </ol>
        </div>
      `,
      confirmButtonColor: config.button_bg_color || '#22C55E',
      confirmButtonText: 'เข้าใจแล้ว'
    });
  };

  const showEdgeGuide = () => {
    Swal.fire({
      icon: 'info',
      title: '🔷 วิธีเปิด Notifications ใน Edge',
      html: `
        <div style="text-align:left;font-size:14px">
          <ol style="padding-left:20px">
            <li style="margin-bottom:8px">คลิกไอคอน 🔒 ที่แถบ URL</li>
            <li style="margin-bottom:8px">เลือก <b>"Site permissions"</b></li>
            <li style="margin-bottom:8px">หา <b>"Notifications"</b></li>
            <li style="margin-bottom:8px">เปลี่ยนเป็น <b>"Allow"</b></li>
            <li>รีเฟรชหน้านี้</li>
          </ol>
        </div>
      `,
      confirmButtonColor: config.button_bg_color || '#22C55E',
      confirmButtonText: 'เข้าใจแล้ว'
    });
  };

  const handleOpenInBrowser = (browserId: string) => {
    openInBrowser(browserId, currentUrl);
  };

  const availableBrowsers = supportedBrowsers.filter(b => {
    if (b.androidOnly && platform !== 'android') return false;
    return true;
  });

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
        background: `linear-gradient(${config.bg_gradient_direction || '135deg'}, ${config.bg_gradient_start || '#22C55E'}, ${config.bg_gradient_end || '#16A34A'})`
      };
    }
    return { backgroundColor: config.bg_color || '#22C55E' };
  };

  // Render main icon
  const renderMainIcon = () => {
    if (config.main_icon_type === 'none') return null;
    
    if (config.main_icon_type === 'image' && config.main_icon_image_url) {
      return (
        <img 
          src={config.main_icon_image_url} 
          alt="Icon"
          style={{ 
            width: config.main_icon_size || 48, 
            height: config.main_icon_size || 48,
            objectFit: 'contain',
            margin: '0 auto 16px'
          }}
        />
      );
    }
    
    return (
      <div style={{ fontSize: `${config.main_icon_size || 48}px`, marginBottom: '16px' }}>
        {config.main_icon_emoji || '🔔'}
      </div>
    );
  };

  // Render success icon
  const renderSuccessIcon = () => {
    if (config.success_icon_type === 'emoji') {
      return (
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>
          {config.success_icon_emoji || '✅'}
        </div>
      );
    }
    
    if (config.success_icon_type === 'image' && config.success_icon_image_url) {
      return (
        <img 
          src={config.success_icon_image_url} 
          alt="Success"
          style={{ 
            width: 64, 
            height: 64,
            objectFit: 'contain',
            margin: '0 auto 16px'
          }}
        />
      );
    }
    
    // Default checkmark
    return (
      <div style={{ marginBottom: '16px' }}>
        <CheckmarkIcon color={config.success_icon_color || '#22C55E'} />
      </div>
    );
  };

  // Render feature item
  const renderFeatureItem = (icon: string, text: string, imageUrl?: string) => (
    <div style={{ textAlign: 'center' }}>
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="" 
          style={{ width: 32, height: 32, margin: '0 auto 4px', objectFit: 'contain' }}
        />
      ) : (
        <div style={{ fontSize: '24px', marginBottom: '4px' }}>{icon}</div>
      )}
      <div style={{ fontSize: '12px', color: '#6b7280' }}>{text}</div>
    </div>
  );

  if (!mounted || !configLoaded) {
    return (
      <main style={{ minHeight: '100vh', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            border: '4px solid #22C55E',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <span style={{ color: '#666' }}>กำลังโหลด...</span>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </main>
    );
  }

  // Render Hero Image Component (shared)
  const renderHeroImage = () => {
    if (!Boolean(config.show_hero_image) || !config.hero_image_url) return null;
    return (
      <div style={{ marginBottom: '16px' }}>
        {config.hero_image_link ? (
          <a href={config.hero_image_link} target="_blank" rel="noopener noreferrer">
            <img 
              src={config.hero_image_url} 
              alt="Hero"
              style={{ 
                width: '100%', 
                borderRadius: `${config.hero_image_radius || 12}px`,
                cursor: 'pointer'
              }}
            />
          </a>
        ) : (
          <img 
            src={config.hero_image_url} 
            alt="Hero"
            style={{ 
              width: '100%', 
              borderRadius: `${config.hero_image_radius || 12}px`
            }}
          />
        )}
      </div>
    );
  };

  const renderContent = () => {
    // iOS needs install
    if (platform === 'ios' && needsInstall) {
      return (
        <div style={{ textAlign: 'center' }}>
          {renderMainIcon()}
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            {config.subscribe_title || 'เพิ่มไปยังหน้าจอโฮม'}
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
            {config.subscribe_description || 'กรุณาเพิ่มแอปนี้ไปยังหน้าจอโฮมก่อน'}
          </p>
          
          {/* Hero Image */}
          {renderHeroImage()}
          
          <div style={{ background: '#f0fdf4', borderRadius: '12px', padding: '16px', textAlign: 'left', marginBottom: '16px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#15803d', marginBottom: '12px' }}>📌 วิธีติดตั้ง:</p>
            <ol style={{ paddingLeft: '20px', fontSize: '13px', color: '#166534', margin: 0 }}>
              <li style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                กดปุ่ม <ShareIcon /> ที่ด้านล่าง
              </li>
              <li style={{ marginBottom: '8px' }}>เลื่อนหาและกด <b>&quot;เพิ่มไปยังหน้าจอโฮม&quot;</b></li>
              <li>เปิดแอปจากหน้าจอโฮม แล้วสมัครรับการแจ้งเตือน</li>
            </ol>
          </div>
        </div>
      );
    }

    // In-App Browser
    if (browserInfo.isInApp) {
      return (
        <div style={{ textAlign: 'center' }}>
          {renderMainIcon()}
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            {config.subscribe_title || 'เปิดใน Browser'}
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
            {config.subscribe_description || 'กรุณาเปิดใน Browser เพื่อรับการแจ้งเตือน'}
          </p>
          
          {/* Hero Image */}
          {renderHeroImage()}
          
          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              📲 เลือก Browser:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
              {availableBrowsers.slice(0, 4).map(browser => (
                <button
                  key={browser.id}
                  onClick={() => handleOpenInBrowser(browser.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '12px 16px',
                    background: 'white',
                    border: `2px solid ${browser.color}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: browser.color,
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{browser.icon}</span>
                  <span>{browser.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: '#fef3c7', borderRadius: '10px', padding: '12px', marginBottom: '16px', textAlign: 'left' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '6px' }}>📌 วิธีอื่น:</p>
            <ol style={{ paddingLeft: '18px', fontSize: '12px', color: '#78350f', margin: 0 }}>
              <li>กดปุ่ม <b>⋮</b> หรือ <b>...</b> ที่มุมขวาบน</li>
              <li>เลือก <b>&quot;เปิดใน Browser&quot;</b></li>
            </ol>
          </div>

          <button
            onClick={copyLink}
            style={{ width: '100%', padding: '12px 24px', background: '#6b7280', color: 'white', fontWeight: '600', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px' }}
          >
            📋 คัดลอกลิงก์
          </button>
        </div>
      );
    }

    // Browser ไม่รองรับ (Android)
    if (!browserInfo.isSupported) {
      return (
        <div style={{ textAlign: 'center' }}>
          {renderMainIcon()}
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            {browserInfo.name} ไม่รองรับ
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
            {browserInfo.message || 'เบราว์เซอร์นี้ไม่รองรับ Push Notification'}
          </p>

          {/* Hero Image */}
          {renderHeroImage()}

          <div style={{ marginBottom: '20px' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
              📲 เปิดใน Browser ที่รองรับ:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
              {availableBrowsers.slice(0, 4).map(browser => (
                <button
                  key={browser.id}
                  onClick={() => handleOpenInBrowser(browser.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '12px 16px',
                    background: 'white',
                    border: `2px solid ${browser.color}`,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: browser.color,
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{browser.icon}</span>
                  <span>{browser.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={copyLink}
            style={{ width: '100%', padding: '12px 24px', background: '#6b7280', color: 'white', fontWeight: '600', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px' }}
          >
            📋 คัดลอกลิงก์
          </button>
        </div>
      );
    }

    // Permission Denied
    if (permission === 'denied') {
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            การแจ้งเตือนถูกบล็อก
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
            กรุณาเปิดใช้งานในการตั้งค่าเบราว์เซอร์
          </p>
          <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '16px', textAlign: 'left' }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>📌 วิธีเปิดใช้งาน:</p>
            <ol style={{ paddingLeft: '20px', fontSize: '13px', color: '#78350f', margin: 0 }}>
              <li>กดไอคอน 🔒 ที่แถบ URL</li>
              <li>หา &quot;Notifications&quot; หรือ &quot;การแจ้งเตือน&quot;</li>
              <li>เปลี่ยนเป็น &quot;Allow&quot; หรือ &quot;อนุญาต&quot;</li>
              <li>รีเฟรชหน้านี้</li>
            </ol>
          </div>
        </div>
      );
    }

    // Already Subscribed
    if (isSubscribed) {
      return (
        <div style={{ textAlign: 'center' }}>
          {renderSuccessIcon()}
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            {config.subscribed_title || 'คุณกำลังรับการแจ้งเตือน'}
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
            {config.subscribed_description || 'คุณจะได้รับข่าวสารอัพเดทล่าสุดจากเรา'}
          </p>
          
          {/* Success Action Button */}
          {config.success_button_url && (
            <a
              href={config.success_button_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                width: '100%',
                padding: '14px 24px',
                background: config.button_bg_color || '#22C55E',
                color: config.button_text_color || 'white',
                fontWeight: '600',
                borderRadius: `${config.button_border_radius || 12}px`,
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'none',
                marginBottom: '16px',
                fontSize: '16px',
                textAlign: 'center',
                boxShadow: config.button_shadow || '0 4px 14px rgba(34,197,94,0.4)'
              }}
            >
              {config.success_button_text || '🎁 รับสิทธิพิเศษ'}
            </a>
          )}
          
          <div style={{ 
            background: config.success_icon_color ? `${config.success_icon_color}20` : '#f0fdf4', 
            borderRadius: '12px', 
            padding: '16px' 
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: config.success_icon_color || '#15803d', 
              margin: 0 
            }}>
              🔔 {config.subscribed_message || 'ระบบจะส่งการแจ้งเตือนให้คุณเมื่อมีข่าวสารใหม่'}
            </p>
          </div>
        </div>
      );
    }

    // Normal Subscribe
    return (
      <div style={{ textAlign: 'center' }}>
        {renderMainIcon()}
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
          {config.subscribe_title || 'รับการแจ้งเตือน'}
        </h2>
        <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
          {config.subscribe_description || 'สมัครรับการแจ้งเตือนเพื่อไม่พลาดข่าวสาร'}
        </p>

        {/* Hero Image - Before Button */}
        {Boolean(config.show_hero_image) && config.hero_image_url && (
          <div style={{ marginBottom: '16px' }}>
            {config.hero_image_link ? (
              <a href={config.hero_image_link} target="_blank" rel="noopener noreferrer">
                <img 
                  src={config.hero_image_url} 
                  alt="Hero"
                  style={{ 
                    width: '100%', 
                    borderRadius: `${config.hero_image_radius || 12}px`,
                    cursor: 'pointer'
                  }}
                />
              </a>
            ) : (
              <img 
                src={config.hero_image_url} 
                alt="Hero"
                style={{ 
                  width: '100%', 
                  borderRadius: `${config.hero_image_radius || 12}px`
                }}
              />
            )}
          </div>
        )}

        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          onMouseEnter={() => setIsHoveringButton(true)}
          onMouseLeave={() => setIsHoveringButton(false)}
          style={{
            width: '100%',
            padding: '14px 24px',
            background: isHoveringButton ? (config.button_hover_color || '#16A34A') : (config.button_bg_color || '#22C55E'),
            color: config.button_text_color || 'white',
            fontWeight: '600',
            borderRadius: `${config.button_border_radius || 12}px`,
            border: 'none',
            cursor: 'pointer',
            opacity: isLoading ? 0.5 : 1,
            boxShadow: config.button_shadow || '0 4px 14px rgba(34,197,94,0.4)',
            fontSize: '16px',
            transition: 'all 0.2s'
          }}
        >
          {isLoading ? (config.button_loading_text || 'กำลังดำเนินการ...') : (config.button_text || '🔔 สมัครรับการแจ้งเตือน')}
        </button>
        
        {/* Brave Helper Button */}
        {browserInfo.isBrave && (
          <button
            onClick={showBraveGuide}
            style={{ width: '100%', marginTop: '12px', padding: '10px 24px', background: 'transparent', color: '#f97316', fontWeight: '500', borderRadius: '12px', border: '2px solid #f97316', cursor: 'pointer', fontSize: '14px' }}
          >
            🦁 วิธีเปิด Push ใน Brave
          </button>
        )}
        
        {/* Edge Helper Button */}
        {browserInfo.isEdge && (
          <button
            onClick={showEdgeGuide}
            style={{ width: '100%', marginTop: '12px', padding: '10px 24px', background: 'transparent', color: '#0078D7', fontWeight: '500', borderRadius: '12px', border: '2px solid #0078D7', cursor: 'pointer', fontSize: '14px' }}
          >
            🔷 วิธีเปิด Notifications ใน Edge
          </button>
        )}
      </div>
    );
  };

  return (
    <main style={{ minHeight: '100vh', padding: '40px 16px', ...getBackgroundStyle() }}>
      {/* Background overlay for image */}
      {config.bg_type === 'image' && config.bg_image_url && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: config.bg_overlay_color || 'rgba(0,0,0,0.3)',
            zIndex: 0
          }} 
        />
      )}
      
      <div style={{ maxWidth: '480px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Logo */}
        {Boolean(config.show_logo) && config.logo_url && (
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img 
              src={config.logo_url} 
              alt="Logo"
              style={{ 
                width: config.logo_width || 120, 
                height: config.logo_height || 40,
                objectFit: 'contain',
                margin: '0 auto'
              }}
            />
          </div>
        )}

        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            {config.page_title || 'Web Push Notifications'}
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>
            {config.page_subtitle || 'รับการแจ้งเตือนข่าวสารล่าสุดจากเรา'}
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: config.card_bg_color || 'white',
          borderRadius: `${config.card_border_radius || 16}px`,
          padding: '32px',
          boxShadow: config.card_shadow || '0 10px 40px rgba(0,0,0,0.2)'
        }}>
          
          {renderContent()}

          {/* Features Section */}
          {config.show_features !== false && config.show_features !== 0 && (
            <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '16px', textAlign: 'center' }}>
                {config.features_title || 'สิ่งที่คุณจะได้รับ'}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', textAlign: 'center' }}>
                {renderFeatureItem(
                  config.feature_1_icon || '📰',
                  config.feature_1_text || 'ข่าวสารล่าสุด',
                  config.feature_1_image_url
                )}
                {renderFeatureItem(
                  config.feature_2_icon || '🎁',
                  config.feature_2_text || 'โปรโมชั่น',
                  config.feature_2_image_url
                )}
                {renderFeatureItem(
                  config.feature_3_icon || '⚡',
                  config.feature_3_text || 'แจ้งเตือนทันที',
                  config.feature_3_image_url
                )}
              </div>
            </div>
          )}
          
          {/* Browser Info */}
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <span>{browserIcon}</span>
            <span>Browser: {browserInfo.name}</span>
          </div>
        </div>

        {/* Footer */}
        {Boolean(config.show_footer) && config.footer_text && (
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            {config.footer_link ? (
              <a 
                href={config.footer_link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: config.footer_text_color || 'rgba(255,255,255,0.6)', fontSize: '12px', textDecoration: 'none' }}
              >
                {config.footer_text}
              </a>
            ) : (
              <p style={{ color: config.footer_text_color || 'rgba(255,255,255,0.6)', fontSize: '12px', margin: 0 }}>
                {config.footer_text}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Custom CSS */}
      {config.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: config.custom_css }} />
      )}
    </main>
  );
}