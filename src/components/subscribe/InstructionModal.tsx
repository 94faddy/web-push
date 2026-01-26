'use client';

import { useEffect } from 'react';

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function InstructionModal({ isOpen, onClose, title, children }: InstructionModalProps) {
  // ปิด modal เมื่อกด ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)'
        }}
      />
      
      {/* Modal Content */}
      <div 
        style={{
          position: 'relative',
          background: 'white',
          borderRadius: '16px',
          maxWidth: '400px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          animation: 'modalSlideIn 0.3s ease-out'
        }}
      >
        {/* Header */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            background: '#f9fafb'
          }}
        >
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            color: '#1f2937',
            margin: 0 
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '18px',
              color: '#6b7280',
              transition: 'all 0.2s'
            }}
          >
            ✕
          </button>
        </div>
        
        {/* Body */}
        <div 
          style={{
            padding: '20px',
            overflowY: 'auto',
            maxHeight: 'calc(80vh - 120px)'
          }}
        >
          {children}
        </div>
        
        {/* Footer */}
        <div 
          style={{
            padding: '16px 20px',
            borderTop: '1px solid #e5e7eb',
            background: '#f9fafb'
          }}
        >
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '12px 24px',
              background: '#22C55E',
              color: 'white',
              fontWeight: '600',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            เข้าใจแล้ว
          </button>
        </div>
      </div>
      
      {/* Animation styles */}
      <style jsx global>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}