'use client';

import { useState } from 'react';
import InstructionModal from './InstructionModal';
import type { BrowserInfo } from '@/hooks/usePushNotification';

// =====================================================
// Settings Interface
// =====================================================
export interface PermissionDeniedSettings {
  iconColor?: string;
  tipIconColor?: string;
  icon?: string;
  iconBg?: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  tipIcon?: string;
  tipText?: string;
  buttonHue?: number;
  buttonSaturation?: number;
  buttonLightness?: number;
}

const defaultSettings: Required<PermissionDeniedSettings> = {
  icon: 'mdi:bell-off',
  iconBg: 'linear-gradient(135deg, #fecaca 0%, #fca5a5 100%)',
  iconColor: '#dc2626',
  tipIconColor: '#ca8a04',
  title: 'การแจ้งเตือนถูกบล็อก',
  subtitle: 'กรุณาเปิดใช้งานในการตั้งค่าเบราว์เซอร์',
  buttonText: '⚙️ วิธีตั้งค่า',
  tipIcon: 'mdi:lightbulb',
  tipText: 'หลังจากเปิดใช้งานแล้ว กรุณารีเฟรชหน้านี้เพื่อสมัครรับการแจ้งเตือน',
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
interface PermissionDeniedProps {
  browserInfo: BrowserInfo;
  settings?: PermissionDeniedSettings;
}

export default function PermissionDenied({ browserInfo, settings }: PermissionDeniedProps) {
  const [showModal, setShowModal] = useState(false);
  
  // Merge settings with defaults
  const s = { ...defaultSettings, ...settings };

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

      {/* ปุ่มดูวิธีตั้งค่า */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: `linear-gradient(135deg, hsl(${s.buttonHue}, ${s.buttonSaturation}%, ${s.buttonLightness}%) 0%, hsl(${s.buttonHue}, ${s.buttonSaturation}%, ${s.buttonLightness - 10}%) 100%)`,
          color: 'white',
          fontWeight: '600',
          borderRadius: '12px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          boxShadow: `0 4px 14px hsla(${s.buttonHue}, ${s.buttonSaturation}%, ${s.buttonLightness}%, 0.4)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}
      >
        {s.buttonText}
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
          <span style={{ flexShrink: 0 }}><IconDisplay icon={s.tipIcon} color={s.tipIconColor} size={18} /></span>
          <span>
            {s.tipText}
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