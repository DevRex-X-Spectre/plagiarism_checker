import { useEffect } from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 560 }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(1, 24, 33, 0.4)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--spacing-24)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-cards)',
          boxShadow: 'var(--shadow-xl)',
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        {title && (
          <div style={{
            padding: 'var(--card-padding)',
            borderBottom: '1px solid var(--color-mist)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h2 style={{
              fontSize: 'var(--text-heading-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-deep-ink)',
            }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-slate)',
                fontSize: 20,
                lineHeight: 1,
                padding: 4,
              }}
            >
              &times;
            </button>
          </div>
        )}
        <div style={{ padding: 'var(--card-padding)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
