'use client';

import { useState } from 'react';
import InstructionModal from './InstructionModal';
import type { BrowserInfo } from '@/hooks/usePushNotification';

interface PermissionDeniedProps {
  browserInfo: BrowserInfo;
}

export default function PermissionDenied({ browserInfo }: PermissionDeniedProps) {
  const [showModal, setShowModal] = useState(false);

  // เนื้อหา modal ตาม browser
  const getInstructions = () => {
    if (browserInfo.name === 'Chrome' || browserInfo.name === 'Brave') {
      return (
        <div style={{ textAlign: 'left' }}>
          <div style={{ 
            background: '#fef2f2', 
            borderRadius: '12px', 
            padding: '16px',
            marginBottom: '16px'
          }}>
            <p style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#991b1b',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔒 วิธีเปิดการแจ้งเตือนใน {browserInfo.name}
            </p>
            <ol style={{ 
              paddingLeft: '20px', 
              fontSize: '13px', 
              color: '#7f1d1d',
              margin: 0,
              lineHeight: '2'
            }}>
              <li>กดไอคอน <b>🔒</b> ที่แถบ URL ด้านบน</li>
              <li>หา <b>&quot;Notifications&quot;</b> หรือ <b>&quot;การแจ้งเตือน&quot;</b></li>
              <li>เปลี่ยนจาก <b>&quot;Block&quot;</b> เป็น <b>&quot;Allow&quot;</b></li>
              <li>รีเฟรชหน้านี้</li>
            </ol>
          </div>

          {/* วิธีอื่น */}
          <div style={{ 
            background: '#f3f4f6', 
            borderRadius: '12px', 
            padding: '16px'
          }}>
            <p style={{ 
              fontSize: '13px', 
              fontWeight: '600', 
              color: '#374151',
              marginBottom: '8px'
            }}>
              หรือไปที่ Settings:
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
              Settings → Privacy and Security → Site Settings → Notifications → หาเว็บไซต์นี้แล้วเปลี่ยนเป็น Allow
            </p>
          </div>
        </div>
      );
    }

    if (browserInfo.isEdge) {
      return (
        <div style={{ textAlign: 'left' }}>
          <div style={{ 
            background: '#eff6ff', 
            borderRadius: '12px', 
            padding: '16px',
            marginBottom: '16px'
          }}>
            <p style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#1e40af',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🔷 วิธีเปิดการแจ้งเตือนใน Edge
            </p>
            <ol style={{ 
              paddingLeft: '20px', 
              fontSize: '13px', 
              color: '#1e3a8a',
              margin: 0,
              lineHeight: '2'
            }}>
              <li>กดไอคอน <b>🔒</b> ที่แถบ URL</li>
              <li>กด <b>&quot;Site permissions&quot;</b></li>
              <li>หา <b>&quot;Notifications&quot;</b></li>
              <li>เปลี่ยนเป็น <b>&quot;Allow&quot;</b></li>
              <li>รีเฟรชหน้านี้</li>
            </ol>
          </div>
        </div>
      );
    }

    if (browserInfo.name === 'Firefox') {
      return (
        <div style={{ textAlign: 'left' }}>
          <div style={{ 
            background: '#fff7ed', 
            borderRadius: '12px', 
            padding: '16px',
            marginBottom: '16px'
          }}>
            <p style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#9a3412',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🦊 วิธีเปิดการแจ้งเตือนใน Firefox
            </p>
            <ol style={{ 
              paddingLeft: '20px', 
              fontSize: '13px', 
              color: '#7c2d12',
              margin: 0,
              lineHeight: '2'
            }}>
              <li>กดไอคอน <b>🔒</b> ที่แถบ URL</li>
              <li>กด <b>&quot;Connection secure&quot;</b></li>
              <li>กด <b>&quot;More information&quot;</b></li>
              <li>ไปที่แท็บ <b>&quot;Permissions&quot;</b></li>
              <li>หา <b>&quot;Send Notifications&quot;</b> แล้วเปลี่ยนเป็น Allow</li>
              <li>รีเฟรชหน้านี้</li>
            </ol>
          </div>
        </div>
      );
    }

    if (browserInfo.name === 'Safari' || browserInfo.isIOSSafari) {
      return (
        <div style={{ textAlign: 'left' }}>
          <div style={{ 
            background: '#f0f9ff', 
            borderRadius: '12px', 
            padding: '16px',
            marginBottom: '16px'
          }}>
            <p style={{ 
              fontSize: '14px', 
              fontWeight: '600', 
              color: '#0369a1',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🧭 วิธีเปิดการแจ้งเตือนใน Safari
            </p>
            <ol style={{ 
              paddingLeft: '20px', 
              fontSize: '13px', 
              color: '#0c4a6e',
              margin: 0,
              lineHeight: '2'
            }}>
              <li>ไปที่ <b>Settings (ตั้งค่า)</b></li>
              <li>เลื่อนหา <b>Safari</b></li>
              <li>กด <b>&quot;Notifications&quot;</b></li>
              <li>หาเว็บไซต์นี้แล้วเปิดใช้งาน</li>
              <li>รีเฟรชหน้านี้</li>
            </ol>
          </div>
        </div>
      );
    }

    // Default
    return (
      <div style={{ textAlign: 'left' }}>
        <div style={{ 
          background: '#f3f4f6', 
          borderRadius: '12px', 
          padding: '16px'
        }}>
          <p style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '12px'
          }}>
            📌 วิธีเปิดการแจ้งเตือน
          </p>
          <ol style={{ 
            paddingLeft: '20px', 
            fontSize: '13px', 
            color: '#4b5563',
            margin: 0,
            lineHeight: '2'
          }}>
            <li>กดไอคอน <b>🔒</b> ที่แถบ URL</li>
            <li>หา <b>&quot;Notifications&quot;</b> หรือ <b>&quot;การแจ้งเตือน&quot;</b></li>
            <li>เปลี่ยนเป็น <b>&quot;Allow&quot;</b> หรือ <b>&quot;อนุญาต&quot;</b></li>
            <li>รีเฟรชหน้านี้</li>
          </ol>
        </div>
      </div>
    );
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Icon */}
      <div 
        style={{ 
          width: '80px', 
          height: '80px', 
          background: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '40px'
        }}
      >
        🚫
      </div>

      {/* Title */}
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: 'bold', 
        color: '#1f2937', 
        marginBottom: '8px' 
      }}>
        การแจ้งเตือนถูกบล็อก
      </h2>
      
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '24px', 
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        กรุณาเปิดใช้งานในการตั้งค่าเบราว์เซอร์
      </p>

      {/* ปุ่มดูวิธีตั้งค่า */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          fontWeight: '600',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}
      >
        ⚙️ วิธีตั้งค่า
      </button>

      {/* Quick Info */}
      <div style={{ 
        background: '#fef2f2', 
        borderRadius: '12px', 
        padding: '16px',
        textAlign: 'left'
      }}>
        <p style={{ 
          fontSize: '13px', 
          color: '#991b1b',
          margin: 0,
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <span>💡</span>
          <span>
            หลังจากเปิดใช้งานแล้ว กรุณารีเฟรชหน้านี้เพื่อสมัครรับการแจ้งเตือน
          </span>
        </p>
      </div>

      {/* Modal */}
      <InstructionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="⚙️ วิธีเปิดการแจ้งเตือน"
      >
        {getInstructions()}
      </InstructionModal>
    </div>
  );
}