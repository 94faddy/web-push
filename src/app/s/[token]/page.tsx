'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { usePushNotification } from '@/hooks/usePushNotification';
import {
  AndroidUnsupported,
  IOSUnsupported,
  IOSAddToHomeScreen,
  IOSChromeAddToHomeScreen,
  PermissionDenied,
  SubscribeSuccess,
  SubscribeForm
} from '@/components/subscribe';

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
  bg_image_url?: string;
  bg_image_overlay: boolean;
  bg_image_overlay_opacity: number;
  logo_url?: string;
  logo_width: number;
  page_title: string;
  page_subtitle: string;
  // Subscribe Form
  subscribe_icon?: string;
  subscribe_icon_bg?: string;
  subscribe_icon_color?: string;
  subscribe_title?: string;
  subscribe_subtitle?: string;
  subscribe_button_text?: string;
  subscribe_loading_text?: string;
  subscribe_button_hue?: number;
  subscribe_button_saturation?: number;
  subscribe_button_lightness?: number;
  // Success
  success_icon?: string;
  success_icon_bg?: string;
  success_icon_color?: string;
  success_title?: string;
  success_title_existing?: string;
  success_subtitle?: string;
  success_box_icon?: string;
  success_box_icon_color?: string;
  success_box_title?: string;
  success_box_subtitle?: string;
  success_button_hue?: number;
  success_button_saturation?: number;
  success_button_lightness?: number;
  // Blocked/Denied
  blocked_icon?: string;
  blocked_icon_bg?: string;
  blocked_icon_color?: string;
  blocked_title?: string;
  blocked_subtitle?: string;
  blocked_button_text?: string;
  blocked_tip_icon?: string;
  blocked_tip_icon_color?: string;
  blocked_tip_text?: string;
  blocked_button_hue?: number;
  blocked_button_saturation?: number;
  blocked_button_lightness?: number;
  // iOS Safari
  ios_safari_icon?: string;
  ios_safari_icon_bg?: string;
  ios_safari_icon_color?: string;
  ios_safari_title?: string;
  ios_safari_subtitle?: string;
  ios_safari_button_text?: string;
  ios_safari_button_hue?: number;
  ios_safari_button_saturation?: number;
  ios_safari_button_lightness?: number;
  // iOS Chrome
  ios_chrome_icon?: string;
  ios_chrome_icon_bg?: string;
  ios_chrome_icon_color?: string;
  ios_chrome_title?: string;
  ios_chrome_subtitle?: string;
  ios_chrome_button_text?: string;
  ios_chrome_button_hue?: number;
  ios_chrome_button_saturation?: number;
  ios_chrome_button_lightness?: number;
  // iOS Unsupported
  ios_unsupported_icon?: string;
  ios_unsupported_icon_bg?: string;
  ios_unsupported_icon_color?: string;
  ios_unsupported_title?: string;
  ios_unsupported_subtitle?: string;
  ios_unsupported_button_text?: string;
  ios_unsupported_copy_success?: string;
  ios_unsupported_copy_hint?: string;
  ios_unsupported_button_hue?: number;
  ios_unsupported_button_saturation?: number;
  ios_unsupported_button_lightness?: number;
  // Android Unsupported
  android_unsupported_icon?: string;
  android_unsupported_icon_bg?: string;
  android_unsupported_icon_color?: string;
  android_unsupported_title?: string;
  android_unsupported_subtitle?: string;
  android_unsupported_button_text?: string;
  android_unsupported_loading_text?: string;
  android_unsupported_copy_success?: string;
  android_unsupported_copy_hint?: string;
  android_unsupported_button_hue?: number;
  android_unsupported_button_saturation?: number;
  android_unsupported_button_lightness?: number;
  // Footer
  footer_title?: string;
  footer_item1_icon?: string;
  footer_item1_icon_color?: string;
  footer_item1_text?: string;
  footer_item2_icon?: string;
  footer_item2_icon_color?: string;
  footer_item2_text?: string;
  footer_item3_icon?: string;
  footer_item3_icon_color?: string;
  footer_item3_text?: string;
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
  bg_image_overlay: true,
  bg_image_overlay_opacity: 40,
  logo_width: 120,
  page_title: 'Web Push Notifications',
  page_subtitle: 'รับการแจ้งเตือนข่าวสารล่าสุดจากเรา'
};

// FooterIcon component - รองรับทั้ง emoji และ Iconify icons
function FooterIcon({ icon, color, fallback }: { icon?: string; color?: string; fallback: string }) {
  const iconValue = icon || fallback;
  const iconColor = color || '#3b82f6';
  
  // ถ้าเป็น Iconify icon (มี :)
  if (iconValue.includes(':')) {
    return (
      <img 
        src={`https://api.iconify.design/${iconValue}.svg?color=${encodeURIComponent(iconColor)}`}
        alt=""
        style={{ width: 28, height: 28 }}
      />
    );
  }
  
  // ถ้าเป็น emoji
  return <span>{iconValue}</span>;
}

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
  const [currentUrl, setCurrentUrl] = useState('');
  const [justSubscribed, setJustSubscribed] = useState(false);
  const [settings, setSettings] = useState<PageSettings>(defaultSettings);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [pushSettings, setPushSettings] = useState<{ sender_name: string; sender_icon: string | null }>({
    sender_name: 'Web Push',
    sender_icon: null
  });

  // Fetch page settings
  useEffect(() => {
    const fetchSettings = async () => {
      if (!token || token.trim() === '') {
        setSettingsLoaded(true);
        return;
      }

      try {
        const timestamp = Date.now();
        const response = await fetch(`/api/page-settings?token=${encodeURIComponent(token)}&_t=${timestamp}`, {
          method: 'GET',
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) {
          setSettingsLoaded(true);
          return;
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          setSettings(prev => ({ ...prev, ...data.data }));
        }
      } catch {
        // Silent fail - use default settings
      } finally {
        setSettingsLoaded(true);
      }
    };

    if (token && token.trim() !== '') {
      fetchSettings();
    }
  }, [token]);

  useEffect(() => {
    setMounted(true);
    setCurrentUrl(window.location.href);
    
    if (token && typeof document !== 'undefined') {
      // Set manifest link with cache busting
      const timestamp = Date.now();
      const manifestUrl = `/api/manifest/${token}?_t=${timestamp}`;
      let link = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (link) {
        link.href = manifestUrl;
      } else {
        link = document.createElement('link');
        link.rel = 'manifest';
        link.href = manifestUrl;
        document.head.appendChild(link);
      }
      
      // Fetch push settings for iOS meta tags
      const fetchPushSettings = async () => {
        try {
          const response = await fetch(`/api/push-settings?token=${encodeURIComponent(token)}&_t=${timestamp}`, {
            method: 'GET',
            cache: 'no-store'
          });
          const data = await response.json();
          
          if (data.success && data.data) {
            const senderName = data.data.sender_name || 'Web Push';
            const senderIcon = data.data.sender_icon || null;
            
            setPushSettings({ sender_name: senderName, sender_icon: senderIcon });
            
            // Update document title
            document.title = senderName;
            
            // Set/Update apple-mobile-web-app-title meta tag
            let appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement;
            if (appleTitleMeta) {
              appleTitleMeta.content = senderName;
            } else {
              appleTitleMeta = document.createElement('meta');
              appleTitleMeta.name = 'apple-mobile-web-app-title';
              appleTitleMeta.content = senderName;
              document.head.appendChild(appleTitleMeta);
            }
            
            // Set/Update application-name meta tag
            let appNameMeta = document.querySelector('meta[name="application-name"]') as HTMLMetaElement;
            if (appNameMeta) {
              appNameMeta.content = senderName;
            } else {
              appNameMeta = document.createElement('meta');
              appNameMeta.name = 'application-name';
              appNameMeta.content = senderName;
              document.head.appendChild(appNameMeta);
            }
            
            // Set apple-touch-icon if sender_icon exists
            if (senderIcon) {
              let appleIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
              if (appleIcon) {
                appleIcon.href = senderIcon;
              } else {
                appleIcon = document.createElement('link');
                appleIcon.rel = 'apple-touch-icon';
                appleIcon.href = senderIcon;
                document.head.appendChild(appleIcon);
              }
              
              // Also set apple-touch-icon-precomposed
              let appleIconPre = document.querySelector('link[rel="apple-touch-icon-precomposed"]') as HTMLLinkElement;
              if (appleIconPre) {
                appleIconPre.href = senderIcon;
              } else {
                appleIconPre = document.createElement('link');
                appleIconPre.rel = 'apple-touch-icon-precomposed';
                appleIconPre.href = senderIcon;
                document.head.appendChild(appleIconPre);
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch push settings:', err);
        }
      };
      
      fetchPushSettings();
    }
  }, [token]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error,
        confirmButtonColor: `hsl(${settings.button_hue}, ${settings.button_saturation}%, ${settings.button_lightness}%)`
      });
    }
  }, [error, settings]);

  // Handle Subscribe
  const handleSubscribe = async () => {
    await subscribe();
    if (!error) {
      setJustSubscribed(true);
      Swal.fire({
        icon: 'success',
        title: 'สมัครสำเร็จ!',
        text: 'คุณจะได้รับการแจ้งเตือนเมื่อมีข่าวสารใหม่',
        timer: 2000,
        showConfirmButton: false
      });
    }
  };

  // Generate background style
  const getBackgroundStyle = (): React.CSSProperties => {
    const { bg_type, bg_hue, bg_saturation, bg_lightness, 
            bg_gradient_hue2, bg_gradient_saturation2, bg_gradient_lightness2, 
            bg_gradient_angle, bg_image_url, bg_image_overlay, bg_image_overlay_opacity } = settings;

    if (bg_type === 'image' && bg_image_url) {
      if (bg_image_overlay) {
        return {
          backgroundImage: `linear-gradient(rgba(0,0,0,${bg_image_overlay_opacity / 100}), rgba(0,0,0,${bg_image_overlay_opacity / 100})), url(${bg_image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      }
      return {
        backgroundImage: `url(${bg_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      };
    }

    if (bg_type === 'gradient') {
      const color1 = `hsl(${bg_hue}, ${bg_saturation}%, ${bg_lightness}%)`;
      const color2 = `hsl(${bg_gradient_hue2}, ${bg_gradient_saturation2}%, ${bg_gradient_lightness2}%)`;
      return {
        background: `linear-gradient(${bg_gradient_angle}deg, ${color1}, ${color2})`
      };
    }

    // Solid
    return {
      background: `hsl(${bg_hue}, ${bg_saturation}%, ${bg_lightness}%)`
    };
  };

  // Loading screen - ใช้สี neutral เพื่อไม่ให้ flash สีเขียว
  if (!mounted || !settingsLoaded) {
    return (
      <main style={{ 
        minHeight: '100vh', 
        background: '#f3f4f6',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </main>
    );
  }

  // Render Content based on state - ใช้ components เดิมทั้งหมด ไม่เปลี่ยน logic
  const renderContent = () => {
    // iOS - ต้องเปิดใน Safari (browser ที่ไม่ใช่ Safari หรือ Chrome)
    if (browserInfo.needsSafari) {
      return (
        <IOSUnsupported
          currentUrl={currentUrl}
          settings={{
            icon: settings.ios_unsupported_icon,
            iconBg: settings.ios_unsupported_icon_bg,
            iconColor: settings.ios_unsupported_icon_color,
            title: settings.ios_unsupported_title,
            subtitle: settings.ios_unsupported_subtitle,
            buttonText: settings.ios_unsupported_button_text,
            copySuccess: settings.ios_unsupported_copy_success,
            copyHint: settings.ios_unsupported_copy_hint,
            buttonHue: settings.ios_unsupported_button_hue ?? settings.button_hue,
            buttonSaturation: settings.ios_unsupported_button_saturation ?? settings.button_saturation,
            buttonLightness: settings.ios_unsupported_button_lightness ?? settings.button_lightness
          }}
        />
      );
    }

    // iOS Safari - ต้อง Add to Home Screen (ปุ่ม Share ด้านล่าง)
    if (needsInstall && browserInfo.isIOSSafari) {
      return (
        <IOSAddToHomeScreen 
          settings={{
            icon: settings.ios_safari_icon,
            iconBg: settings.ios_safari_icon_bg,
            iconColor: settings.ios_safari_icon_color,
            title: settings.ios_safari_title,
            subtitle: settings.ios_safari_subtitle,
            buttonText: settings.ios_safari_button_text,
            buttonHue: settings.ios_safari_button_hue ?? settings.button_hue,
            buttonSaturation: settings.ios_safari_button_saturation ?? settings.button_saturation,
            buttonLightness: settings.ios_safari_button_lightness ?? settings.button_lightness
          }}
        />
      );
    }

    // iOS Chrome - ต้อง Add to Home Screen (ปุ่ม Share มุมขวาบน)
    if (needsInstall && browserInfo.isIOSChrome) {
      return (
        <IOSChromeAddToHomeScreen 
          settings={{
            icon: settings.ios_chrome_icon,
            iconBg: settings.ios_chrome_icon_bg,
            iconColor: settings.ios_chrome_icon_color,
            title: settings.ios_chrome_title,
            subtitle: settings.ios_chrome_subtitle,
            buttonText: settings.ios_chrome_button_text,
            buttonHue: settings.ios_chrome_button_hue ?? settings.button_hue,
            buttonSaturation: settings.ios_chrome_button_saturation ?? settings.button_saturation,
            buttonLightness: settings.ios_chrome_button_lightness ?? settings.button_lightness
          }}
        />
      );
    }

    // Android - Browser ไม่รองรับ หรือ In-App Browser
    if (browserInfo.platform === 'android' && (!browserInfo.isSupported || browserInfo.isInApp)) {
      return (
        <AndroidUnsupported
          currentUrl={currentUrl}
          settings={{
            icon: settings.android_unsupported_icon,
            iconBg: settings.android_unsupported_icon_bg,
            iconColor: settings.android_unsupported_icon_color,
            title: settings.android_unsupported_title,
            subtitle: settings.android_unsupported_subtitle,
            buttonText: settings.android_unsupported_button_text,
            loadingText: settings.android_unsupported_loading_text,
            copySuccess: settings.android_unsupported_copy_success,
            copyHint: settings.android_unsupported_copy_hint,
            buttonHue: settings.android_unsupported_button_hue ?? settings.button_hue,
            buttonSaturation: settings.android_unsupported_button_saturation ?? settings.button_saturation,
            buttonLightness: settings.android_unsupported_button_lightness ?? settings.button_lightness
          }}
        />
      );
    }

    // Desktop/Other - Browser ไม่รองรับ
    if (!browserInfo.isSupported) {
      return (
        <AndroidUnsupported
          currentUrl={currentUrl}
          settings={{
            icon: settings.android_unsupported_icon,
            iconBg: settings.android_unsupported_icon_bg,
            iconColor: settings.android_unsupported_icon_color,
            title: settings.android_unsupported_title,
            subtitle: settings.android_unsupported_subtitle,
            buttonText: settings.android_unsupported_button_text,
            loadingText: settings.android_unsupported_loading_text,
            copySuccess: settings.android_unsupported_copy_success,
            copyHint: settings.android_unsupported_copy_hint,
            buttonHue: settings.android_unsupported_button_hue ?? settings.button_hue,
            buttonSaturation: settings.android_unsupported_button_saturation ?? settings.button_saturation,
            buttonLightness: settings.android_unsupported_button_lightness ?? settings.button_lightness
          }}
        />
      );
    }

    // Permission Denied
    if (permission === 'denied') {
      return (
        <PermissionDenied 
          browserInfo={browserInfo}
          settings={{
            icon: settings.blocked_icon,
            iconBg: settings.blocked_icon_bg,
            iconColor: settings.blocked_icon_color,
            title: settings.blocked_title,
            subtitle: settings.blocked_subtitle,
            buttonText: settings.blocked_button_text,
            tipIcon: settings.blocked_tip_icon,
            tipIconColor: settings.blocked_tip_icon_color,
            tipText: settings.blocked_tip_text,
            buttonHue: settings.blocked_button_hue ?? settings.button_hue,
            buttonSaturation: settings.blocked_button_saturation ?? settings.button_saturation,
            buttonLightness: settings.blocked_button_lightness ?? settings.button_lightness
          }}
        />
      );
    }

    // Already Subscribed
    if (isSubscribed) {
      return (
        <SubscribeSuccess 
          justSubscribed={justSubscribed}
          settings={{
            icon: settings.success_icon,
            iconBg: settings.success_icon_bg,
            iconColor: settings.success_icon_color,
            title: settings.success_title,
            titleExisting: settings.success_title_existing,
            subtitle: settings.success_subtitle,
            boxIcon: settings.success_box_icon,
            boxIconColor: settings.success_box_icon_color,
            boxTitle: settings.success_box_title,
            boxSubtitle: settings.success_box_subtitle
          }}
        />
      );
    }

    // Normal Subscribe Form
    return (
      <SubscribeForm
        onSubscribe={handleSubscribe}
        isLoading={isLoading}
        browserInfo={browserInfo}
        settings={{
          icon: settings.subscribe_icon,
          iconBg: settings.subscribe_icon_bg,
          iconColor: settings.subscribe_icon_color,
          title: settings.subscribe_title,
          subtitle: settings.subscribe_subtitle,
          buttonText: settings.subscribe_button_text,
          loadingText: settings.subscribe_loading_text,
          buttonHue: settings.subscribe_button_hue ?? settings.button_hue,
          buttonSaturation: settings.subscribe_button_saturation ?? settings.button_saturation,
          buttonLightness: settings.subscribe_button_lightness ?? settings.button_lightness
        }}
      />
    );
  };

  return (
    <main style={{ minHeight: '100vh', ...getBackgroundStyle(), padding: '40px 16px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        
        {/* Logo - แสดงตรงกลาง */}
        {settings.logo_url && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <img 
              src={settings.logo_url} 
              alt="Logo" 
              style={{ 
                width: settings.logo_width, 
                height: 'auto',
                maxWidth: '100%',
                display: 'inline-block'
              }} 
            />
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            {settings.page_title}
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
            {settings.page_subtitle}
          </p>
        </div>

        {/* Content Card */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          
          {renderContent()}

          {/* Footer - What you'll get */}
          <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '24px', marginBottom: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '32px' }}>
                  <FooterIcon icon={settings.footer_item1_icon} color={settings.footer_item1_icon_color} fallback="📰" />
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{settings.footer_item1_text || 'ข่าวสารล่าสุด'}</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', marginBottom: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '32px' }}>
                  <FooterIcon icon={settings.footer_item2_icon} color={settings.footer_item2_icon_color} fallback="🎁" />
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{settings.footer_item2_text || 'โปรโมชั่น'}</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', marginBottom: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '32px' }}>
                  <FooterIcon icon={settings.footer_item3_icon} color={settings.footer_item3_icon_color} fallback="⚡" />
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>{settings.footer_item3_text || 'แจ้งเตือนทันที'}</div>
              </div>
            </div>
          </div>
          
          {/* Browser Info */}
          <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
            <span>Browser: {browserInfo.displayName}</span>
          </div>
        </div>

      </div>
    </main>
  );
}