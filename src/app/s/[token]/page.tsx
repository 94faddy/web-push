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

  useEffect(() => {
    setMounted(true);
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
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error,
        confirmButtonColor: '#22C55E'
      });
    }
  }, [error]);

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

  if (!mounted) {
    return (
      <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#22C55E,#16A34A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'white', fontSize: '18px' }}>กำลังโหลด...</div>
      </main>
    );
  }

  // Render Content based on state
  const renderContent = () => {
    // iOS - ต้องเปิดใน Safari (browser ที่ไม่ใช่ Safari หรือ Chrome)
    if (browserInfo.needsSafari) {
      return (
        <IOSUnsupported
          currentUrl={currentUrl}
        />
      );
    }

    // iOS Safari - ต้อง Add to Home Screen (ปุ่ม Share ด้านล่าง)
    if (needsInstall && browserInfo.isIOSSafari) {
      return <IOSAddToHomeScreen />;
    }

    // iOS Chrome - ต้อง Add to Home Screen (ปุ่ม Share มุมขวาบน)
    if (needsInstall && browserInfo.isIOSChrome) {
      return <IOSChromeAddToHomeScreen />;
    }

    // Android - Browser ไม่รองรับ หรือ In-App Browser
    if (browserInfo.platform === 'android' && (!browserInfo.isSupported || browserInfo.isInApp)) {
      return (
        <AndroidUnsupported
          currentUrl={currentUrl}
        />
      );
    }

    // Desktop/Other - Browser ไม่รองรับ
    if (!browserInfo.isSupported) {
      return (
        <AndroidUnsupported
          currentUrl={currentUrl}
        />
      );
    }

    // Permission Denied
    if (permission === 'denied') {
      return <PermissionDenied browserInfo={browserInfo} />;
    }

    // Already Subscribed
    if (isSubscribed) {
      return <SubscribeSuccess justSubscribed={justSubscribed} />;
    }

    // Normal Subscribe Form
    return (
      <SubscribeForm
        onSubscribe={handleSubscribe}
        isLoading={isLoading}
        browserInfo={browserInfo}
      />
    );
  };

  return (
    <main style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#22C55E,#16A34A)', padding: '40px 16px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
            Web Push Notifications
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)' }}>
            รับการแจ้งเตือนข่าวสารล่าสุดจากเรา
          </p>
        </div>

        {/* Content Card */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          
          {renderContent()}

          {/* Footer - What you'll get */}
          <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', marginBottom: '16px', textAlign: 'center' }}>
              สิ่งที่คุณจะได้รับ
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>📰</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>ข่าวสารล่าสุด</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>🎁</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>โปรโมชั่น</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>⚡</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>แจ้งเตือนทันที</div>
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