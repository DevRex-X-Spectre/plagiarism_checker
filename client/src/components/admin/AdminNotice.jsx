import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function AdminNotice({ type = 'error', children, className = '' }) {
  if (!children) return null;

  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  const styles = type === 'success'
    ? 'border-success/20 bg-success/5 text-success'
    : 'border-danger/20 bg-danger/5 text-danger';

  return (
    <div className={`mb-5 flex items-start gap-2 rounded-2xl border p-3 text-sm ${styles} ${className}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}
