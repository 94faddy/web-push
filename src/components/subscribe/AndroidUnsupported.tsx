'use client';

import { useState, useEffect } from 'react';

interface AndroidUnsupportedProps {
  currentUrl: string;
}

export default function AndroidUnsupported({ currentUrl }: AndroidUnsupportedProps) {
  const [isOpening, setIsOpening] = useState(false);
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [inAppName, setInAppName] = useState<string>('');

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
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '40px'
        }}
      >
        ⚠️
      </div>

      {/* Title */}
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: 'bold', 
        color: '#1f2937', 
        marginBottom: '8px' 
      }}>
        Browser ไม่รองรับ
      </h2>
      
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '24px', 
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        กรุณาเปิดใน Browser ที่รองรับ<br/>เพื่อสมัครรับการแจ้งเตือน
      </p>

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
            คัดลอกลิงก์แล้ว!
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#15803d',
            margin: 0
          }}>
            เปิดใน Chrome แล้ววางลิงก์
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
              : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
            color: 'white',
            fontWeight: '600',
            borderRadius: '12px',
            border: 'none',
            cursor: isOpening ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            boxShadow: isOpening ? 'none' : '0 4px 14px rgba(34,197,94,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          {isOpening ? (
            <>
              <span style={{ 
                display: 'inline-block',
                animation: 'spin 1s linear infinite' 
              }}>⏳</span>
              กำลังเปิด...
            </>
          ) : (
            <>
              🚀 เปิด Browser ที่รองรับ
            </>
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