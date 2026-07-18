import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 520 }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      style={{ background: 'rgba(11, 16, 46, 0.58)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="relative w-full bg-card-white rounded-2xl shadow-xl animate-scale-in"
        style={{ maxWidth, maxHeight: '90vh', overflow: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className="relative flex items-center justify-between p-6 border-b border-mist">
            <h2 className="text-lg font-semibold text-deep-ink">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate hover:text-deep-ink hover:bg-mist/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="relative p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
