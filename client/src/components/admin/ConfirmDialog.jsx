import { AlertTriangle } from 'lucide-react';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  loading = false,
  onCancel,
  onConfirm,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="space-y-5">
        <div className="flex gap-3 rounded-2xl border border-warning/20 bg-warning/5 p-4 text-sm text-carbon">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <p className="leading-6">{message}</p>
        </div>
        <div className="flex justify-end gap-2 border-t border-mist pt-4">
          <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
        </div>
      </div>
    </Modal>
  );
}
