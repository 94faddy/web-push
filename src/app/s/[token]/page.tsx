'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { usePushNotification } from '@/hooks/usePushNotification';

export default function SubscribePage() {
  const params = useParams();
  const token = params.token as string;
  
  const {
    permission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    needsInstall,
    browserInfo
  } = usePushNotification(token);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Update manifest for iOS PWA
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

  const handleSubscribe = async () => {
    const result = await Swal.fire({
      title: 'รับการแจ้งเตือน',
      text: 'คุณต้องการรับการแจ้งเตือนจากเราหรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#22C55E',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'ใช่, รับการแจ้งเตือน',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      await subscribe();
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: 'คุณได้สมัครรับการแจ้งเตือนเรียบร้อยแล้ว',
        confirmButtonColor: '#22C55E'
      });
    }
  };

  const handleUnsubscribe = async () => {
    const result = await Swal.fire({
      title: 'ยกเลิกการแจ้งเตือน',
      text: 'คุณต้องการยกเลิกการรับแจ้งเตือนหรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'ใช่, ยกเลิก',
      cancelButtonText: 'ไม่'
    });

    if (result.isConfirmed) {
      await unsubscribe();
      Swal.fire({
        icon: 'success',
        title: 'ยกเลิกแล้ว',
        text: 'คุณได้ยกเลิกการรับแจ้งเตือนแล้ว',
        confirmButtonColor: '#22C55E'
      });
    }
  };

  const showIOSInstallGuide = () => {
    Swal.fire({
      title: 'เพิ่มไปยังหน้าจอหลัก',
      html: `
        <div style="text-align:left">
          <p style="margin-bottom:16px">iPhone/iPad ต้องเพิ่มเว็บไซต์ไปยังหน้าจอหลักก่อน</p>
          <ol style="padding-left:20px">
            <li>กดปุ่ม <b>Share</b> (ไอคอนสี่เหลี่ยมมีลูกศร)</li>
            <li>เลือก <b>"เพิ่มไปยังหน้าจอหลัก"</b></li>
            <li>กด <b>"เพิ่ม"</b></li>
            <li>เปิดแอปจากหน้าจอหลัก</li>
          </ol>
          <p style="margin-top:16px;font-size:12px;color:#666">* ต้องใช้ iOS 16.4+ และ Safari เท่านั้น</p>
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#22C55E'
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    Swal.fire({
      icon: 'success',
      title: 'คัดลอกลิงก์แล้ว',
      timer: 1500,
      showConfirmButton: false
    });
  };

  if (!mounted) {
    return (
      <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#22C55E,#16A34A)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{color:'white',fontSize:'20px'}}>Loading...</div>
      </div>
    );
  }

  return (
    <main style={{minHeight:'100vh',background:'linear-gradient(135deg,#22C55E,#16A34A)',padding:'40px 16px'}}>
      <div style={{maxWidth:'480px',margin:'0 auto'}}>
        
        {/* Header */}
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <h1 style={{fontSize:'28px',fontWeight:'bold',color:'white',marginBottom:'8px'}}>
            Web Push Notifications
          </h1>
          <p style={{fontSize:'16px',color:'rgba(255,255,255,0.8)'}}>
            รับการแจ้งเตือนข่าวสารล่าสุดจากเรา
          </p>
        </div>

        {/* Main Card */}
        <div style={{background:'white',borderRadius:'16px',padding:'32px',boxShadow:'0 10px 40px rgba(0,0,0,0.2)'}}>
          
          {/* In-App Browser */}
          {browserInfo.isInApp ? (
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'48px',marginBottom:'16px'}}>📱</div>
              <h2 style={{fontSize:'20px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>
                เปิดใน Browser
              </h2>
              <p style={{color:'#6b7280',marginBottom:'16px',fontSize:'14px'}}>
                {browserInfo.message || `${browserInfo.name} ไม่รองรับ Push Notification`}
              </p>
              <button
                onClick={copyLink}
                style={{width:'100%',padding:'12px 24px',background:'#22C55E',color:'white',fontWeight:'600',borderRadius:'12px',border:'none',cursor:'pointer'}}
              >
                📋 คัดลอกลิงก์
              </button>
              <p style={{marginTop:'12px',fontSize:'12px',color:'#9ca3af'}}>
                แล้ววางใน Chrome หรือ Safari
              </p>
            </div>
          
          /* Browser ไม่รองรับ */
          ) : !browserInfo.isSupported && !needsInstall ? (
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'48px',marginBottom:'16px'}}>😢</div>
              <h2 style={{fontSize:'20px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>
                {browserInfo.name} ไม่รองรับ
              </h2>
              <p style={{color:'#6b7280',marginBottom:'16px',fontSize:'14px'}}>
                {browserInfo.message || 'เบราว์เซอร์นี้ไม่รองรับ Push Notification'}
              </p>
              <button
                onClick={copyLink}
                style={{width:'100%',padding:'12px 24px',background:'#22C55E',color:'white',fontWeight:'600',borderRadius:'12px',border:'none',cursor:'pointer'}}
              >
                📋 คัดลอกลิงก์
              </button>
            </div>
          
          /* iOS Add to Home Screen */
          ) : needsInstall ? (
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'48px',marginBottom:'16px'}}>📱</div>
              <h2 style={{fontSize:'20px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>
                เพิ่มไปยังหน้าจอหลัก
              </h2>
              <p style={{color:'#6b7280',marginBottom:'24px',fontSize:'14px'}}>
                iPhone/iPad ต้องเพิ่มเว็บไซต์ไปยังหน้าจอหลักก่อน
              </p>
              <button
                onClick={showIOSInstallGuide}
                style={{width:'100%',padding:'12px 24px',background:'#22C55E',color:'white',fontWeight:'600',borderRadius:'12px',border:'none',cursor:'pointer'}}
              >
                📖 ดูวิธีทำ
              </button>
              <div style={{marginTop:'24px',padding:'16px',background:'#f0fdf4',borderRadius:'8px',textAlign:'left'}}>
                <ol style={{paddingLeft:'20px',fontSize:'14px',color:'#15803d'}}>
                  <li>กดปุ่ม Share</li>
                  <li>เลือก &quot;เพิ่มไปยังหน้าจอหลัก&quot;</li>
                  <li>กด &quot;เพิ่ม&quot;</li>
                  <li>เปิดแอปจากหน้าจอหลัก</li>
                </ol>
              </div>
            </div>
          
          /* Permission Denied */
          ) : permission === 'denied' ? (
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'48px',marginBottom:'16px'}}>🚫</div>
              <h2 style={{fontSize:'20px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>
                การแจ้งเตือนถูกบล็อก
              </h2>
              <p style={{color:'#6b7280',marginBottom:'16px',fontSize:'14px'}}>
                กรุณาเปิดใช้งานในการตั้งค่า
              </p>
            </div>
          
          /* Normal Subscribe */
          ) : (
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:'48px',marginBottom:'16px'}}>
                {isSubscribed ? '✅' : '🔔'}
              </div>
              <h2 style={{fontSize:'20px',fontWeight:'bold',color:'#1f2937',marginBottom:'8px'}}>
                {isSubscribed ? 'คุณกำลังรับการแจ้งเตือน' : 'รับการแจ้งเตือน'}
              </h2>
              <p style={{color:'#6b7280',marginBottom:'24px',fontSize:'14px'}}>
                {isSubscribed 
                  ? 'คุณจะได้รับข่าวสารอัพเดทล่าสุดจากเรา'
                  : 'สมัครรับการแจ้งเตือนเพื่อไม่พลาดข่าวสาร'}
              </p>

              {isSubscribed ? (
                <button
                  onClick={handleUnsubscribe}
                  disabled={isLoading}
                  style={{width:'100%',padding:'12px 24px',background:'#ef4444',color:'white',fontWeight:'600',borderRadius:'12px',border:'none',cursor:'pointer',opacity:isLoading?0.5:1}}
                >
                  {isLoading ? 'กำลังดำเนินการ...' : '🔕 ยกเลิกการรับแจ้งเตือน'}
                </button>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  style={{width:'100%',padding:'12px 24px',background:'#22C55E',color:'white',fontWeight:'600',borderRadius:'12px',border:'none',cursor:'pointer',opacity:isLoading?0.5:1,boxShadow:'0 4px 14px rgba(34,197,94,0.4)'}}
                >
                  {isLoading ? 'กำลังดำเนินการ...' : '🔔 สมัครรับการแจ้งเตือน'}
                </button>
              )}
            </div>
          )}

          {/* Features */}
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
          
          {/* Browser Info */}
          <div style={{marginTop:'16px',textAlign:'center',fontSize:'12px',color:'#9ca3af'}}>
            Browser: {browserInfo.name}
          </div>
        </div>

      </div>
    </main>
  );
}