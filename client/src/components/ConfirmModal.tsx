import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'primary';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  const variantColors = {
    danger: 'var(--danger)',
    warning: 'var(--warning)',
    primary: 'var(--primary)'
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div 
        className="glass-card animate-fade-in" 
        style={{ width: '100%', maxWidth: '400px', padding: '2rem', position: 'relative' }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onCancel}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            borderRadius: '12px', 
            background: `rgba(${variant === 'danger' ? '239, 68, 68' : '245, 158, 11'}, 0.1)`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '1.5rem'
          }}>
            <AlertTriangle size={24} color={variantColors[variant]} />
          </div>

          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem' }}>{title}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>{message}</p>

          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <button className="btn-glass" style={{ flex: 1 }} onClick={onCancel}>
              {cancelLabel}
            </button>
            <button 
              className="btn-modern" 
              style={{ flex: 1, background: variantColors[variant], boxShadow: `0 10px 15px -3px rgba(${variant === 'danger' ? '239, 68, 68' : '245, 158, 11'}, 0.3)` }} 
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
