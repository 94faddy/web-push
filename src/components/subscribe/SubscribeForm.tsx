'use client';

import { useState } from 'react';
import InstructionModal from './InstructionModal';
import type { BrowserInfo } from '@/hooks/usePushNotification';

interface SubscribeFormProps {
  onSubscribe: () => void;
  isLoading: boolean;
  browserInfo: BrowserInfo;
}

export default function SubscribeForm({ onSubscribe, isLoading, browserInfo }: SubscribeFormProps) {
  const [showBraveModal, setShowBraveModal] = useState(false);
  const [showEdgeModal, setShowEdgeModal] = useState(false);

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Bell Icon */}
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
          fontSize: '40px',
          animation: 'bellShake 2s ease-in-out infinite'
        }}
      >
        🔔
      </div>

      {/* Title */}
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: 'bold', 
        color: '#1f2937', 
        marginBottom: '8px' 
      }}>
        รับการแจ้งเตือน
      </h2>
      
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '24px', 
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        สมัครรับการแจ้งเตือนเพื่อไม่พลาดข่าวสาร
      </p>

      {/* Subscribe Button */}
      <button
        onClick={onSubscribe}
        disabled={isLoading}
        style={{
          width: '100%',
          padding: '14px 24px',
          background: isLoading 
            ? '#9ca3af' 
            : 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
          color: 'white',
          fontWeight: '600',
          borderRadius: '12px',
          border: 'none',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '16px',
          boxShadow: isLoading ? 'none' : '0 4px 14px rgba(34,197,94,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '12px',
          transition: 'all 0.2s'
        }}
      >
        {isLoading ? (
          <>
            <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
            กำลังดำเนินการ...
          </>
        ) : (
          <>
            🔔 สมัครรับการแจ้งเตือน
          </>
        )}
      </button>

      {/* Brave Helper Button */}
      {browserInfo.isBrave && (
        <button
          onClick={() => setShowBraveModal(true)}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: 'transparent',
            color: '#FB542B',
            fontWeight: '500',
            borderRadius: '10px',
            border: '2px solid #FB542B',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🦁 วิธีเปิด Push ใน Brave
        </button>
      )}

      {/* Edge Helper Button */}
      {browserInfo.isEdge && (
        <button
          onClick={() => setShowEdgeModal(true)}
          style={{
            width: '100%',
            padding: '12px 24px',
            background: 'transparent',
            color: '#0078D7',
            fontWeight: '500',
            borderRadius: '10px',
            border: '2px solid #0078D7',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🔷 วิธีเปิด Notifications ใน Edge
        </button>
      )}

      {/* Brave Modal */}
      <InstructionModal
        isOpen={showBraveModal}
        onClose={() => setShowBraveModal(false)}
        title="🦁 วิธีเปิด Push ใน Brave"
      >
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
              marginBottom: '12px'
            }}>
              Brave ต้องเปิดใช้งาน Push Messaging ก่อน:
            </p>
            <ol style={{ 
              paddingLeft: '20px', 
              fontSize: '13px', 
              color: '#7c2d12',
              margin: 0,
              lineHeight: '2'
            }}>
              <li>พิมพ์ <b>brave://settings/privacy</b> ในแถบ URL</li>
              <li>เลื่อนหา <b>&quot;Use Google Services for Push Messaging&quot;</b></li>
              <li>เปิดใช้งาน (Toggle On)</li>
              <li>รีเฟรชหน้านี้แล้วลองใหม่</li>
            </ol>
          </div>

          <div style={{ 
            background: '#fef3c7', 
            borderRadius: '8px', 
            padding: '12px'
          }}>
            <p style={{ 
              fontSize: '12px', 
              color: '#92400e',
              margin: 0,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '6px'
            }}>
              <span>💡</span>
              <span>การตั้งค่านี้จำเป็นสำหรับ Brave เพื่อให้สามารถรับ Push Notification ได้</span>
            </p>
          </div>
        </div>
      </InstructionModal>

      {/* Edge Modal */}
      <InstructionModal
        isOpen={showEdgeModal}
        onClose={() => setShowEdgeModal(false)}
        title="🔷 วิธีเปิด Notifications ใน Edge"
      >
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
              marginBottom: '12px'
            }}>
              กรุณาเปิดใช้งาน Notifications ใน Edge:
            </p>
            <ol style={{ 
              paddingLeft: '20px', 
              fontSize: '13px', 
              color: '#1e3a8a',
              margin: 0,
              lineHeight: '2'
            }}>
              <li>คลิกที่ไอคอน <b>🔒</b> ในแถบ URL</li>
              <li>คลิก <b>&quot;Site permissions&quot;</b></li>
              <li>หา <b>&quot;Notifications&quot;</b></li>
              <li>เปลี่ยนเป็น <b>&quot;Allow&quot;</b></li>
              <li>รีเฟรชหน้านี้แล้วลองใหม่</li>
            </ol>
          </div>
        </div>
      </InstructionModal>

      {/* Animations */}
      <style jsx global>{`
        @keyframes bellShake {
          0%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(-10deg); }
          20%, 40% { transform: rotate(10deg); }
          50%, 60%, 70%, 80%, 90% { transform: rotate(0deg); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}