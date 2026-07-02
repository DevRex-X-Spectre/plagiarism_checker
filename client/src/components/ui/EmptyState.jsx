import { FileQuestion, Search, Upload, AlertCircle } from 'lucide-react';
import Button from './Button.jsx';

const icons = {
  search: Search,
  upload: Upload,
  question: FileQuestion,
  alert: AlertCircle,
};

export default function EmptyState({
  icon = 'question',
  title,
  description,
  action,
  actionLabel,
  actionIcon,
  className = ''
}) {
  const Icon = icons[icon] || icons.question;

  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="relative mb-6">
        <div className="relative w-16 h-16 rounded-2xl bg-pale-cyan/30 flex items-center justify-center">
          <Icon className="w-8 h-8 text-forest-teal" />
        </div>
      </div>

      <h3 className="text-lg font-medium text-deep-ink mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-slate max-w-sm mb-6">
          {description}
        </p>
      )}

      {action && (
        <Button
          onClick={action}
          icon={actionIcon}
          variant="primary"
          size="md"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
