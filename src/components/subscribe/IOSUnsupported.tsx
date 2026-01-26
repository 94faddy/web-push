'use client';

import { useState, useEffect } from 'react';

interface IOSUnsupportedProps {
  currentUrl: string;
}

export default function IOSUnsupported({ currentUrl }: IOSUnsupportedProps) {
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inAppName, setInAppName] = useState<string>('');

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any;
    
    // LINE - รองรับ openExternalBrowser=1
    if (/line\/[\d.]+/.test(ua) || ua.includes(' line ') || ua.includes('liff') || win.liff) {
      setInAppName('LINE');
      return;
    }
    
    // Telegram - ตรวจจาก window object
    if (win.TelegramWebviewProxy || win.Telegram || win.TelegramWebview || 
        ua.includes('telegram') || ua.includes('tgweb')) {
      setInAppName('Telegram');
      return;
    }
    
    // Facebook
    if (ua.includes('fbav/') || ua.includes('fban/') || ua.includes('fb_iab') || 
        ua.includes('[fban') || ua.includes('[fbav') || win.FACEBOOK_WEBVIEW) {
      setInAppName('Facebook');
      return;
    }
    
    // Messenger
    if (ua.includes('messenger/') || /\[fb.*messenger\]/.test(ua)) {
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
    
    // ตรวจสอบว่าเป็น iOS WebView ที่ไม่รู้จัก (ไม่มี window.safari)
    // ถ้าไม่มี window.safari และไม่ใช่ Chrome/Firefox/Edge iOS → น่าจะเป็น Telegram หรือ app อื่น
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isThirdPartyBrowser = ua.includes('crios') || ua.includes('fxios') || ua.includes('edgios');
    
    if (isIOS && !win.safari && !isThirdPartyBrowser) {
      // น่าจะเป็น Telegram หรือ WebView อื่นที่ไม่มี UA pattern
      // ตรวจสอบ referrer หรือ URL ว่ามาจาก Telegram หรือไม่
      const referrer = document.referrer.toLowerCase();
      if (referrer.includes('telegram') || referrer.includes('t.me')) {
        setInAppName('Telegram');
        return;
      }
      
      // ถ้าไม่แน่ใจ ให้เป็น Unknown WebView
      setInAppName('UnknownWebView');
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

  // LINE - ใช้ openExternalBrowser=1 ได้
  const openInSafariForLINE = () => {
    const cleanUrl = getCleanUrl();
    const url = new URL(cleanUrl);
    url.searchParams.set('openExternalBrowser', '1');
    window.location.href = url.toString();
  };

  // Copy URL สำหรับ app อื่นๆ
  const copyUrl = async () => {
    const cleanUrl = getCleanUrl();
    try {
      await navigator.clipboard.writeText(cleanUrl);
      setShowCopySuccess(true);
    } catch {
      alert(`กรุณาเปิด Safari แล้วไปที่:\n\n${cleanUrl}`);
    }
  };

  // ========== Telegram - ปุ่ม "วิธีทำ" + Modal ==========
  if (inAppName === 'Telegram') {
    return (
      <div style={{ textAlign: 'center' }}>
        {/* Safari Icon */}
        <div 
          style={{ 
            width: '80px', 
            height: '80px', 
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '40px'
          }}
        >
          🧭
        </div>

        {/* Title */}
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '8px' 
        }}>
          กรุณาเปิดใน Safari
        </h2>
        
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '24px', 
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          iOS รองรับ Push Notification<br/>เฉพาะใน Safari เท่านั้น
        </p>

        {/* ปุ่ม วิธีทำ */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            fontWeight: '600',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          📖 วิธีทำ
        </button>

        {/* Modal วิธีทำ */}
        {showModal && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '20px'
            }}
            onClick={() => setShowModal(false)}
          >
            <div 
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                maxWidth: '340px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#1f2937',
                  margin: 0
                }}>
                  วิธีเปิดใน Safari
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  style={{
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Step 1 */}
              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '12px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    background: '#f59e0b',
                    color: 'white',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>1</span>
                  <span style={{ 
                    fontWeight: '600', 
                    color: '#92400e',
                    fontSize: '15px'
                  }}>
                    ดูที่แถบด้านล่างของหน้าจอ
                  </span>
                </div>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#78350f',
                  margin: 0,
                  paddingLeft: '40px'
                }}>
                  จะเห็นแถบเครื่องมือของ Telegram
                </p>
              </div>

              {/* Step 2 */}
              <div style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  marginBottom: '8px'
                }}>
                  <span style={{
                    background: '#3b82f6',
                    color: 'white',
                    borderRadius: '50%',
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>2</span>
                  <span style={{ 
                    fontWeight: '600', 
                    color: '#1e40af',
                    fontSize: '15px'
                  }}>
                    กดปุ่ม Safari ที่มุมขวาล่าง
                  </span>
                </div>
                <p style={{ 
                  fontSize: '13px', 
                  color: '#1e3a8a',
                  margin: 0,
                  paddingLeft: '40px'
                }}>
                  ปุ่มรูป 🧭 (เข็มทิศ)
                </p>
              </div>

              {/* แสดงภาพจำลอง Navigation Bar */}
              <div style={{
                background: '#f3f4f6',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '20px'
              }}>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  marginBottom: '8px',
                  textAlign: 'center'
                }}>
                  ตัวอย่างแถบเครื่องมือ:
                </p>
                <div style={{
                  background: 'white',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}>
                  <span style={{ fontSize: '20px', color: '#9ca3af' }}>‹</span>
                  <span style={{ fontSize: '20px', color: '#9ca3af' }}>›</span>
                  <span style={{ fontSize: '18px', color: '#9ca3af' }}>⬆️</span>
                  <span style={{ fontSize: '18px', color: '#9ca3af' }}>🔖</span>
                  <span style={{ 
                    fontSize: '22px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}>🧭</span>
                </div>
                <p style={{ 
                  fontSize: '11px', 
                  color: '#9ca3af',
                  marginTop: '8px',
                  textAlign: 'center'
                }}>
                  👆 กดปุ่มนี้
                </p>
              </div>

              {/* ปุ่มปิด */}
              <button
                onClick={() => setShowModal(false)}
                style={{
                  width: '100%',
                  padding: '14px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                  color: 'white',
                  fontWeight: '600',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '15px'
                }}
              >
                เข้าใจแล้ว
              </button>
            </div>
          </div>
        )}

        <style jsx global>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }
        `}</style>
      </div>
    );
  }

  // ========== LINE - ใช้ openExternalBrowser=1 ==========
  if (inAppName === 'LINE') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div 
          style={{ 
            width: '80px', 
            height: '80px', 
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '40px'
          }}
        >
          🧭
        </div>

        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '8px' 
        }}>
          กรุณาเปิดใน Safari
        </h2>
        
        <p style={{ 
          color: '#6b7280', 
          marginBottom: '24px', 
          fontSize: '14px',
          lineHeight: '1.5'
        }}>
          iOS รองรับ Push Notification<br/>เฉพาะใน Safari เท่านั้น
        </p>

        <button
          onClick={openInSafariForLINE}
          style={{
            width: '100%',
            padding: '16px 24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            fontWeight: '600',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🧭 เปิดใน Safari
        </button>
      </div>
    );
  }

  // ========== Facebook, Instagram, TikTok และอื่นๆ - แสดงคำแนะนำ ==========
  return (
    <div style={{ textAlign: 'center' }}>
      <div 
        style={{ 
          width: '80px', 
          height: '80px', 
          background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '40px'
        }}
      >
        🧭
      </div>

      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: 'bold', 
        color: '#1f2937', 
        marginBottom: '8px' 
      }}>
        กรุณาเปิดใน Safari
      </h2>
      
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '24px', 
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        iOS รองรับ Push Notification<br/>เฉพาะใน Safari เท่านั้น
      </p>

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
            เปิด Safari แล้ววางลิงก์
          </p>
        </div>
      ) : (
        <>
          {/* คำแนะนำสำหรับ Facebook, Instagram, etc. */}
          <div style={{
            background: '#f3f4f6',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            textAlign: 'left'
          }}>
            <p style={{ 
              fontSize: '14px', 
              color: '#4b5563',
              margin: 0,
              lineHeight: '1.6'
            }}>
              <strong>วิธีเปิดใน Safari:</strong><br/>
              1. กดปุ่ม <strong>⋯</strong> หรือ <strong>⋮</strong> (ถ้ามี)<br/>
              2. เลือก &quot;เปิดใน Safari&quot; หรือ &quot;Open in Safari&quot;<br/>
              3. หรือคัดลอกลิงก์แล้วเปิด Safari เอง
            </p>
          </div>

          <button
            onClick={copyUrl}
            style={{
              width: '100%',
              padding: '16px 24px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              fontWeight: '600',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            📋 คัดลอกลิงก์
          </button>
        </>
      )}
    </div>
  );
}