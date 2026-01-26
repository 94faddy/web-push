'use client';

interface SubscribeSuccessProps {
  justSubscribed?: boolean;
}

export default function SubscribeSuccess({ justSubscribed }: SubscribeSuccessProps) {
  return (
    <div style={{ textAlign: 'center' }}>
      {/* Icon with animation */}
      <div 
        style={{ 
          width: '80px', 
          height: '80px', 
          background: 'linear-gradient(135deg, #bbf7d0 0%, #86efac 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '40px',
          animation: justSubscribed ? 'successBounce 0.6s ease-out' : 'none'
        }}
      >
        ✅
      </div>

      {/* Title */}
      <h2 style={{ 
        fontSize: '20px', 
        fontWeight: 'bold', 
        color: '#1f2937', 
        marginBottom: '8px' 
      }}>
        {justSubscribed ? 'สมัครสำเร็จ!' : 'คุณกำลังรับการแจ้งเตือน'}
      </h2>
      
      <p style={{ 
        color: '#6b7280', 
        marginBottom: '24px', 
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        คุณจะได้รับข่าวสารอัพเดทล่าสุดจากเรา
      </p>

      {/* Success Box */}
      <div style={{ 
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', 
        borderRadius: '12px', 
        padding: '20px',
        border: '1px solid #bbf7d0'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>🔔</span>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            color: '#15803d' 
          }}>
            ระบบพร้อมแจ้งเตือน
          </span>
        </div>
        <p style={{ 
          fontSize: '13px', 
          color: '#166534',
          margin: 0
        }}>
          เมื่อมีข่าวสารใหม่ คุณจะได้รับการแจ้งเตือนทันที
        </p>
      </div>

      {/* Animation */}
      <style jsx global>{`
        @keyframes successBounce {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}