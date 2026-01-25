'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { usePushNotification } from '@/hooks/usePushNotification';

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

  // Get browser icon
  const getBrowserIcon = (browserName: string): string => {
    return browserIcons[browserName] || '🌐';
  };

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
          confirmButtonColor: '#22C55E',
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
          confirmButtonColor: '#22C55E',
          confirmButtonText: 'เข้าใจแล้ว'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error,
          confirmButtonColor: '#22C55E'
        });
      }
    }
  }, [error, browserInfo.isBrave, browserInfo.isEdge]);

  const handleSubscribe = async () => {
    // Edge - แสดงคำแนะนำพิเศษก่อน
    if (browserInfo.isEdge) {
      const preCheck = await Swal.fire({
        title: '🔷 Edge Browser',
        html: `
          <div style="text-align:left">
            <p style="margin-bottom:12px;font-weight:600;color:#0078D7">สำคัญ: กรุณาทำตามขั้นตอนนี้</p>
            <div style="background:#f0f9ff;padding:12px;border-radius:8px;margin-bottom:12px">
              <p style="margin:0;font-size:14px">เมื่อกด "ดำเนินการต่อ" จะมี <b>popup ขอสิทธิ์</b> ปรากฏ</p>
              <p style="margin:8px 0 0 0;font-size:14px">กรุณากด <b>"Allow"</b> หรือ <b>"อนุญาต"</b></p>
            </div>
            <p style="font-size:13px;color:#666">ถ้าไม่เห็น popup ให้คลิกที่ไอคอน 🔒 ในแถบ URL แล้วเปิด Notifications</p>
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#0078D7',
        cancelButtonColor: '#64748B',
        confirmButtonText: 'ดำเนินการต่อ',
        cancelButtonText: 'ยกเลิก'
      });

      if (!preCheck.isConfirmed) return;
    }
    // Brave - แสดงคำแนะนำพิเศษ
    else if (browserInfo.isBrave) {
      const preCheck = await Swal.fire({
        title: '🦁 Brave Browser',
        html: `
          <div style="text-align:left">
            <p style="margin-bottom:12px">ก่อนสมัคร กรุณาตรวจสอบว่าคุณได้เปิดใช้งาน Push Messaging แล้ว:</p>
            <div style="background:#f3f4f6;padding:12px;border-radius:8px;font-size:14px">
              <b>brave://settings/privacy</b><br/>
              → เปิด "Use Google Services for Push Messaging"
            </div>
            <p style="margin-top:12px;font-size:14px;color:#666">ถ้าเปิดแล้ว กดปุ่มด้านล่างเพื่อดำเนินการต่อ</p>
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#22C55E',
        cancelButtonColor: '#64748B',
        confirmButtonText: 'เปิดแล้ว, ดำเนินการต่อ',
        cancelButtonText: 'ยกเลิก'
      });

      if (!preCheck.isConfirmed) return;
    }
    // Browser อื่นๆ
    else {
      const result = await Swal.fire({
        title: 'รับการแจ้งเตือน',
        html: `
          <p style="margin-bottom:12px">คุณต้องการรับการแจ้งเตือนจากเราหรือไม่?</p>
          <p style="font-size:13px;color:#666">เมื่อกด "ใช่" จะมี popup ขอสิทธิ์ปรากฏ กรุณากด "Allow"</p>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#22C55E',
        cancelButtonColor: '#64748B',
        confirmButtonText: 'ใช่, รับการแจ้งเตือน',
        cancelButtonText: 'ยกเลิก'
      });

      if (!result.isConfirmed) return;
    }

    await subscribe();
    setJustSubscribed(true);
  };
  
  // แสดง success เฉพาะตอนเพิ่ง subscribe สำเร็จ (ไม่ใช่ตอน reload หน้า)
  useEffect(() => {
    if (isSubscribed && mounted && justSubscribed) {
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'คุณได้สมัครรับการแจ้งเตือนเรียบร้อยแล้ว',
        confirmButtonColor: '#22C55E'
      });
      setJustSubscribed(false);
    }
  }, [isSubscribed, mounted, justSubscribed]);

  const showIOSInstallGuide = () => {
    const isSafari = browserInfo.name === 'Safari (iOS)';
    const shareButtonLocation = isSafari ? 'ที่ด้านล่างของหน้าจอ' : 'ที่ด้านบนขวาของหน้าจอ';
    
    Swal.fire({
      title: 'เพิ่มไปยังหน้าจอโฮม',
      html: `
        <div style="text-align:left">
          <p style="margin-bottom:16px">ทำตามขั้นตอนง่ายๆ นี้:</p>
          <ol style="padding-left:20px;font-size:15px">
            <li style="margin-bottom:8px">กดปุ่ม <b>Share</b> (ไอคอนสี่เหลี่ยมมีลูกศรชี้ขึ้น) ${shareButtonLocation}</li>
            <li style="margin-bottom:8px">เลื่อนลงแล้วเลือก <b>"เพิ่มไปยังหน้าจอโฮม"</b> หรือ <b>"Add to Home Screen"</b></li>
            <li style="margin-bottom:8px">กด <b>"เพิ่ม"</b> หรือ <b>"Add"</b> ที่มุมขวาบน</li>
            <li>เปิดแอปจากหน้าจอโฮมแล้วกดสมัคร</li>
          </ol>
          <p style="margin-top:16px;font-size:12px;color:#666">* ต้องใช้ iOS 16.4 ขึ้นไป</p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#22C55E',
      confirmButtonText: 'เข้าใจแล้ว'
    });
  };

  const showBraveGuide = () => {
    Swal.fire({
      title: '🦁 Brave Browser Setup',
      html: `
        <div style="text-align:left">
          <p style="margin-bottom:16px">วิธีเปิดใช้งาน Push Notification ใน Brave:</p>
          <ol style="padding-left:20px">
            <li>เปิดแท็บใหม่ พิมพ์ <b style="color:#22C55E">brave://settings/privacy</b></li>
            <li>เลื่อนหา <b>"Use Google Services for Push Messaging"</b></li>
            <li>คลิกเพื่อเปิดใช้งาน</li>
            <li>กลับมาที่หน้านี้แล้วรีเฟรช</li>
            <li>กดสมัครรับการแจ้งเตือนอีกครั้ง</li>
          </ol>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#22C55E',
      confirmButtonText: 'เข้าใจแล้ว'
    });
  };

  const showEdgeGuide = () => {
    Swal.fire({
      title: '🔷 Edge Browser Setup',
      html: `
        <div style="text-align:left">
          <p style="margin-bottom:16px">วิธีเปิดใช้งาน Notifications ใน Edge:</p>
          <ol style="padding-left:20px">
            <li>คลิกที่ไอคอน <b>🔒</b> ในแถบ URL</li>
            <li>คลิก <b>"Permissions for this site"</b></li>
            <li>หา <b>"Notifications"</b></li>
            <li>เปลี่ยนเป็น <b>"Allow"</b></li>
            <li>รีเฟรชหน้านี้แล้วลองใหม่</li>
          </ol>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#0078D7',
      confirmButtonText: 'เข้าใจแล้ว'
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    Swal.fire({
      icon: 'success',
      title: 'คัดลอกลิงก์แล้ว',
      html: '<p style="color:#6b7280">วางใน Chrome, Brave หรือ Safari เพื่อสมัครรับการแจ้งเตือน</p>',
      timer: 2000,
      showConfirmButton: false
    });
  };

  // Handle open in specific browser
  const handleOpenInBrowser = (browserId: string) => {
    openInBrowser(browserId, currentUrl);
  };

  if (!mounted) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#22C55E,#16A34A)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{color:'white',fontSize:'20px'}}>Loading...</div>
      </div>
    );
  }

  const browserIcon = getBrowserIcon(browserInfo.name);

  // Filter browsers based on platform
  const availableBrowsers = supportedBrowsers.filter(b => {
    if (b.androidOnly && platform !== 'android') return false;
    return true;
  });

  const renderContent = () => {
    // *** iOS - ต้อง Add to Home Screen (ใช้ได้กับทุก browser) ***
    if (needsInstall) {
      // ตรวจสอบว่าเป็น Safari หรือ browser อื่น
      const isSafari = browserInfo.name === 'Safari (iOS)';
      const shareButtonLocation = isSafari ? 'ด้านล่างของหน้าจอ' : 'ด้านบนขวาของหน้าจอ';
      
      return (
        <div style={{textAlign:'center'}}>
          {/* Share Icon */}
          <div style={{
            width:'80px',
            height:'80px',
            margin:'0 auto 20px',
            background:'linear-gradient(135deg, #007AFF, #5856D6)',
            borderRadius:'20px',
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            boxShadow:'0 4px 14px rgba(0,122,255,0.3)'
          }}>
            <div style={{color:'white',transform:'scale(2)'}}>
              <ShareIcon />
            </div>
          </div>
          
          <h2 style={{fontSize:'22px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>
            เพิ่มไปยังหน้าจอโฮม
          </h2>
          <p style={{color:'#6b7280',marginBottom:'24px',fontSize:'14px'}}>
            กดปุ่ม Share แล้วเลือก<br/>&quot;เพิ่มไปยังหน้าจอโฮม&quot;
          </p>
          
          {/* ปุ่มดูวิธีทำ */}
          <button
            onClick={showIOSInstallGuide}
            style={{
              width:'100%',
              padding:'16px 24px',
              background:'linear-gradient(135deg, #007AFF, #5856D6)',
              color:'white',
              fontWeight:'600',
              borderRadius:'12px',
              border:'none',
              cursor:'pointer',
              fontSize:'16px',
              boxShadow:'0 4px 14px rgba(0,122,255,0.4)',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              gap:'10px'
            }}
          >
            <ShareIcon />
            <span>ดูวิธีทำ</span>
          </button>

          {/* ขั้นตอน */}
          <div style={{marginTop:'24px',padding:'16px',background:'#f0f9ff',borderRadius:'12px',textAlign:'left'}}>
            <ol style={{paddingLeft:'20px',fontSize:'14px',color:'#0369a1',margin:0}}>
              <li style={{marginBottom:'6px'}}>กดปุ่ม <b>Share</b> ({shareButtonLocation})</li>
              <li style={{marginBottom:'6px'}}>เลือก <b>&quot;เพิ่มไปยังหน้าจอโฮม&quot;</b></li>
              <li style={{marginBottom:'6px'}}>กด <b>&quot;เพิ่ม&quot;</b></li>
              <li>เปิดแอปจากหน้าจอโฮมแล้วกดสมัคร</li>
            </ol>
          </div>
        </div>
      );
    }

    // In-App Browser (LINE, Facebook, etc.)
    if (browserInfo.isInApp) {
      return (
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>{browserIcon}</div>
          <h2 style={{fontSize:'20px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>
            {browserInfo.name} ไม่รองรับ
          </h2>
          <p style={{color:'#6b7280',marginBottom:'20px',fontSize:'14px'}}>
            กรุณาเปิดในเบราว์เซอร์ที่รองรับ
          </p>

          {/* ปุ่มเปิด Browser ที่รองรับ */}
          <div style={{marginBottom:'20px'}}>
            <p style={{fontSize:'14px',fontWeight:'600',color:'#374151',marginBottom:'12px'}}>
              📲 เปิดใน Browser ที่รองรับ:
            </p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px'}}>
              {availableBrowsers.slice(0, 4).map(browser => (
                <button
                  key={browser.id}
                  onClick={() => handleOpenInBrowser(browser.id)}
                  style={{
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    gap:'6px',
                    padding:'12px 16px',
                    background:'white',
                    border:`2px solid ${browser.color}`,
                    borderRadius:'10px',
                    cursor:'pointer',
                    fontSize:'14px',
                    fontWeight:'500',
                    color: browser.color,
                    transition:'all 0.2s'
                  }}
                >
                  <span style={{fontSize:'20px'}}>{browser.icon}</span>
                  <span>{browser.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* คำแนะนำ In-App */}
          <div style={{background:'#fef3c7',borderRadius:'10px',padding:'12px',marginBottom:'16px',textAlign:'left'}}>
            <p style={{fontSize:'13px',fontWeight:'600',color:'#92400e',marginBottom:'6px'}}>📌 วิธีอื่น:</p>
            <ol style={{paddingLeft:'18px',fontSize:'12px',color:'#78350f',margin:0}}>
              <li>กดปุ่ม <b>⋮</b> หรือ <b>...</b> ที่มุมขวาบน</li>
              <li>เลือก <b>&quot;เปิดใน Browser&quot;</b></li>
            </ol>
          </div>

          {/* ปุ่มคัดลอกลิงก์ */}
          <button
            onClick={copyLink}
            style={{width:'100%',padding:'12px 24px',background:'#6b7280',color:'white',fontWeight:'600',borderRadius:'10px',border:'none',cursor:'pointer',fontSize:'14px'}}
          >
            📋 คัดลอกลิงก์
          </button>
        </div>
      );
    }

    // Browser ไม่รองรับ (Android)
    if (!browserInfo.isSupported) {
      return (
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>{browserIcon}</div>
          <h2 style={{fontSize:'20px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>
            {browserInfo.name} ไม่รองรับ
          </h2>
          <p style={{color:'#6b7280',marginBottom:'20px',fontSize:'14px'}}>
            {browserInfo.message || 'เบราว์เซอร์นี้ไม่รองรับ Push Notification'}
          </p>

          {/* ปุ่มเปิด Browser ที่รองรับ */}
          <div style={{marginBottom:'20px'}}>
            <p style={{fontSize:'14px',fontWeight:'600',color:'#374151',marginBottom:'12px'}}>
              📲 เปิดใน Browser ที่รองรับ:
            </p>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'8px'}}>
              {availableBrowsers.slice(0, 4).map(browser => (
                <button
                  key={browser.id}
                  onClick={() => handleOpenInBrowser(browser.id)}
                  style={{
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    gap:'6px',
                    padding:'12px 16px',
                    background:'white',
                    border:`2px solid ${browser.color}`,
                    borderRadius:'10px',
                    cursor:'pointer',
                    fontSize:'14px',
                    fontWeight:'500',
                    color: browser.color,
                    transition:'all 0.2s'
                  }}
                >
                  <span style={{fontSize:'20px'}}>{browser.icon}</span>
                  <span>{browser.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ปุ่มคัดลอกลิงก์ */}
          <button
            onClick={copyLink}
            style={{width:'100%',padding:'12px 24px',background:'#6b7280',color:'white',fontWeight:'600',borderRadius:'10px',border:'none',cursor:'pointer',fontSize:'14px'}}
          >
            📋 คัดลอกลิงก์
          </button>
        </div>
      );
    }

    // Permission Denied
    if (permission === 'denied') {
      return (
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>🚫</div>
          <h2 style={{fontSize:'20px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>
            การแจ้งเตือนถูกบล็อก
          </h2>
          <p style={{color:'#6b7280',marginBottom:'16px',fontSize:'14px'}}>
            กรุณาเปิดใช้งานในการตั้งค่าเบราว์เซอร์
          </p>
          <div style={{background:'#fef3c7',borderRadius:'12px',padding:'16px',textAlign:'left'}}>
            <p style={{fontSize:'14px',fontWeight:'600',color:'#92400e',marginBottom:'8px'}}>📌 วิธีเปิดใช้งาน:</p>
            <ol style={{paddingLeft:'20px',fontSize:'13px',color:'#78350f',margin:0}}>
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
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:'48px',marginBottom:'16px'}}>✅</div>
          <h2 style={{fontSize:'20px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>
            คุณกำลังรับการแจ้งเตือน
          </h2>
          <p style={{color:'#6b7280',marginBottom:'24px',fontSize:'14px'}}>
            คุณจะได้รับข่าวสารอัพเดทล่าสุดจากเรา
          </p>
          <div style={{background:'#f0fdf4',borderRadius:'12px',padding:'16px'}}>
            <p style={{fontSize:'14px',color:'#15803d',margin:0}}>
              🔔 ระบบจะส่งการแจ้งเตือนให้คุณเมื่อมีข่าวสารใหม่
            </p>
          </div>
        </div>
      );
    }

    // Normal Subscribe
    return (
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>🔔</div>
        <h2 style={{fontSize:'20px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>
          รับการแจ้งเตือน
        </h2>
        <p style={{color:'#6b7280',marginBottom:'24px',fontSize:'14px'}}>
          สมัครรับการแจ้งเตือนเพื่อไม่พลาดข่าวสาร
        </p>

        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          style={{width:'100%',padding:'14px 24px',background:'#22C55E',color:'white',fontWeight:'600',borderRadius:'12px',border:'none',cursor:'pointer',opacity:isLoading?0.5:1,boxShadow:'0 4px 14px rgba(34,197,94,0.4)',fontSize:'16px'}}
        >
          {isLoading ? 'กำลังดำเนินการ...' : '🔔 สมัครรับการแจ้งเตือน'}
        </button>
        
        {/* Brave Helper Button */}
        {browserInfo.isBrave && (
          <button
            onClick={showBraveGuide}
            style={{width:'100%',marginTop:'12px',padding:'10px 24px',background:'transparent',color:'#f97316',fontWeight:'500',borderRadius:'12px',border:'2px solid #f97316',cursor:'pointer',fontSize:'14px'}}
          >
            🦁 วิธีเปิด Push ใน Brave
          </button>
        )}
        
        {/* Edge Helper Button */}
        {browserInfo.isEdge && (
          <button
            onClick={showEdgeGuide}
            style={{width:'100%',marginTop:'12px',padding:'10px 24px',background:'transparent',color:'#0078D7',fontWeight:'500',borderRadius:'12px',border:'2px solid #0078D7',cursor:'pointer',fontSize:'14px'}}
          >
            🔷 วิธีเปิด Notifications ใน Edge
          </button>
        )}
      </div>
    );
  };

  return (
    <main style={{minHeight:'100vh',background:'linear-gradient(135deg,#22C55E,#16A34A)',padding:'40px 16px'}}>
      <div style={{maxWidth:'480px',margin:'0 auto'}}>
        
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <h1 style={{fontSize:'28px',fontWeight:'bold',color:'white',marginBottom:'8px'}}>
            Web Push Notifications
          </h1>
          <p style={{fontSize:'16px',color:'rgba(255,255,255,0.8)'}}>
            รับการแจ้งเตือนข่าวสารล่าสุดจากเรา
          </p>
        </div>

        <div style={{background:'white',borderRadius:'16px',padding:'32px',boxShadow:'0 10px 40px rgba(0,0,0,0.2)'}}>
          
          {renderContent()}

          <div style={{marginTop:'32px',paddingTop:'32px',borderTop:'1px solid #e5e7eb'}}>
            <h3 style={{fontSize:'14px',fontWeight:'600',color:'#1f2937',marginBottom:'16px',textAlign:'center'}}>
              สิ่งที่คุณจะได้รับ
            </h3>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',textAlign:'center'}}>
              <div>
                <div style={{fontSize:'24px',marginBottom:'4px'}}>📰</div>
                <div style={{fontSize:'12px',color:'#6b7280'}}>ข่าวสารล่าสุด</div>
              </div>
              <div>
                <div style={{fontSize:'24px',marginBottom:'4px'}}>🎁</div>
                <div style={{fontSize:'12px',color:'#6b7280'}}>โปรโมชั่น</div>
              </div>
              <div>
                <div style={{fontSize:'24px',marginBottom:'4px'}}>⚡</div>
                <div style={{fontSize:'12px',color:'#6b7280'}}>แจ้งเตือนทันที</div>
              </div>
            </div>
          </div>
          
          {/* Browser Info with Icon */}
          <div style={{marginTop:'16px',textAlign:'center',fontSize:'12px',color:'#9ca3af',display:'flex',alignItems:'center',justifyContent:'center',gap:'4px'}}>
            <span>{browserIcon}</span>
            <span>Browser: {browserInfo.name}</span>
          </div>
        </div>

      </div>
    </main>
  );
}