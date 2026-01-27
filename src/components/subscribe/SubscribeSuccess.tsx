'use client';

// =====================================================
// Settings Interface
// =====================================================
export interface SubscribeSuccessSettings {
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  title?: string;
  titleExisting?: string;
  subtitle?: string;
  boxIcon?: string;
  boxIconColor?: string;
  boxTitle?: string;
  boxSubtitle?: string;
}

const defaultSettings: Required<SubscribeSuccessSettings> = {
  icon: '✅',
  iconBg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  iconColor: '#ffffff',
  title: 'สมัครสำเร็จแล้ว!',
  titleExisting: 'คุณเป็นสมาชิกอยู่แล้ว',
  subtitle: 'คุณจะได้รับการแจ้งเตือนเมื่อมีข่าวสารใหม่',
  boxIcon: '🔔',
  boxIconColor: '#16a34a',
  boxTitle: 'การแจ้งเตือนเปิดใช้งานแล้ว',
  boxSubtitle: 'ท่านจะได้รับแจ้งเตือนผ่านเบราว์เซอร์ทันที'
};

// Icon Display Helper
function IconDisplay({ icon, color, size = 40 }: { icon: string; color: string; size?: number }) {
  if (!icon.includes(':')) return <span style={{ fontSize: size }}>{icon}</span>;
  const encodedColor = encodeURIComponent(color);
  return <img src={`https://api.iconify.design/${icon}.svg?color=${encodedColor}`} alt="" style={{ width: size, height: size }} />;
}

// =====================================================
// Component Props
// =====================================================
interface SubscribeSuccessProps {
  justSubscribed?: boolean;
  settings?: SubscribeSuccessSettings;
}

// =====================================================
// SubscribeSuccess Component
// =====================================================
export default function SubscribeSuccess({ 
  justSubscribed = false,
  settings 
}: SubscribeSuccessProps) {
  // Merge settings with defaults
  const s = { ...defaultSettings, ...settings };
  
  return (
    <div style={{ textAlign: 'center' }}>
      {/* Icon */}
      <div style={{ 
        width: '80px', 
        height: '80px', 
        background: s.iconBg, 
        borderRadius: '50%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        margin: '0 auto 24px',
        animation: justSubscribed ? 'successPop 0.5s ease-out' : undefined
      }}>
        <IconDisplay icon={s.icon} color={s.iconColor} />
      </div>

      {/* Animation Keyframes */}
      {justSubscribed && (
        <style>{`
          @keyframes successPop {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      )}

      {/* Title */}
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: 'bold', 
        color: '#1f2937', 
        marginBottom: '8px' 
      }}>
        {justSubscribed ? s.title : s.titleExisting}
      </h2>

      {/* Subtitle */}
      <p style={{ 
        fontSize: '14px', 
        color: '#6b7280', 
        marginBottom: '24px',
        lineHeight: '1.5'
      }}
        dangerouslySetInnerHTML={{ __html: s.subtitle.replace(/\n/g, '<br/>') }}
      />

      {/* Info Box */}
      <div style={{
        background: '#f0fdf4',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #bbf7d0'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '12px'
        }}>
          <IconDisplay icon={s.boxIcon} color={s.boxIconColor} size={24} />
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: '600', color: '#166534', fontSize: '14px' }}>
              {s.boxTitle}
            </div>
            <div style={{ fontSize: '12px', color: '#16a34a' }}>
              {s.boxSubtitle}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}