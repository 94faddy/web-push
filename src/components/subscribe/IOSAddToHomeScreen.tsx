'use client';

import { useState } from 'react';
import InstructionModal from './InstructionModal';

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

export default function IOSAddToHomeScreen() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Share Icon */}
      <div 
        style={{ 
          width: '80px', 
          height: '80px', 
          background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          color: 'white'
        }}
      >
        <ShareIcon />
      </div>

      {/* Title */}
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: 'bold', 
        color: '#1f2937', 
        marginBottom: '8px' 
      }}>
        เพิ่มไปยังหน้าจอโฮม
      </h2>
      
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '24px', 
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        กดปุ่ม Share แล้วเลือก<br/>&quot;เพิ่มไปยังหน้าจอโฮม&quot;
      </p>

      {/* ปุ่มดูวิธีทำ */}
      <button
        onClick={() => setShowModal(true)}
        style={{
          width: '100%',
          padding: '14px 24px',
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
        <ShareIcon />
        ดูวิธีทำ
      </button>

      {/* Modal วิธีทำ */}
      <InstructionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="📖 วิธีเพิ่มไปยังหน้าจอโฮม"
      >
        <div style={{ textAlign: 'left' }}>
          {/* ขั้นตอนที่ 1 */}
          <div style={{ 
            background: '#eff6ff', 
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
                width: '28px',
                height: '28px',
                background: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>1</span>
              <p style={{ 
                fontSize: '15px', 
                fontWeight: '600', 
                color: '#1e40af',
                margin: 0
              }}>
                กดปุ่ม Share
              </p>
            </div>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              paddingLeft: '40px'
            }}>
              <div style={{ 
                width: '40px',
                height: '40px',
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#3b82f6',
                border: '1px solid #dbeafe'
              }}>
                <ShareIcon />
              </div>
              <p style={{ fontSize: '13px', color: '#1e3a8a', margin: 0 }}>
                อยู่ด้านล่างของหน้าจอ
              </p>
            </div>
          </div>

          {/* ขั้นตอนที่ 2 */}
          <div style={{ 
            background: '#f0fdf4', 
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
                width: '28px',
                height: '28px',
                background: '#22C55E',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>2</span>
              <p style={{ 
                fontSize: '15px', 
                fontWeight: '600', 
                color: '#15803d',
                margin: 0
              }}>
                เลือก &quot;เพิ่มไปยังหน้าจอโฮม&quot;
              </p>
            </div>
            <p style={{ 
              fontSize: '13px', 
              color: '#166534', 
              margin: 0,
              paddingLeft: '40px'
            }}>
              เลื่อนหาและกดที่ตัวเลือกนี้
            </p>
          </div>

          {/* ขั้นตอนที่ 3 */}
          <div style={{ 
            background: '#fef3c7', 
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
                width: '28px',
                height: '28px',
                background: '#f59e0b',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>3</span>
              <p style={{ 
                fontSize: '15px', 
                fontWeight: '600', 
                color: '#92400e',
                margin: 0
              }}>
                กด &quot;เพิ่ม&quot;
              </p>
            </div>
            <p style={{ 
              fontSize: '13px', 
              color: '#78350f', 
              margin: 0,
              paddingLeft: '40px'
            }}>
              กดปุ่มที่มุมขวาบน
            </p>
          </div>

          {/* ขั้นตอนที่ 4 */}
          <div style={{ 
            background: '#fdf4ff', 
            borderRadius: '12px', 
            padding: '16px'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '8px'
            }}>
              <span style={{ 
                width: '28px',
                height: '28px',
                background: '#a855f7',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>4</span>
              <p style={{ 
                fontSize: '15px', 
                fontWeight: '600', 
                color: '#7e22ce',
                margin: 0
              }}>
                เปิดแอปแล้วกดสมัคร
              </p>
            </div>
            <p style={{ 
              fontSize: '13px', 
              color: '#6b21a8', 
              margin: 0,
              paddingLeft: '40px'
            }}>
              เปิดแอปจากหน้าจอโฮมแล้วกดสมัครรับการแจ้งเตือน
            </p>
          </div>
        </div>
      </InstructionModal>
    </div>
  );
}