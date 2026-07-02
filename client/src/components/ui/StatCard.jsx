export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendDirection = 'up',
  color = 'indigo',
  className = ''
}) {
  const colors = {
    indigo: 'bg-paper-white text-deep-indigo',
    cyan: 'bg-pale-cyan/25 text-forest-teal',
    green: 'bg-success-light/50 text-success',
    orange: 'bg-warning-light/50 text-warning',
    red: 'bg-danger-light/50 text-danger',
  };

  return (
    <div className={`relative overflow-hidden bg-card-white rounded-lg border border-mist p-5 shadow-sm hover-lift ${className}`}>

      {/* Icon */}
      {Icon && (
        <div className={`relative w-10 h-10 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
          <Icon className="w-5 h-5" />
        </div>
      )}

      {/* Value */}
      <div className="relative">
        <p className="text-3xl font-light text-deep-ink tracking-tight mb-1">
          {value}
        </p>
        <p className="text-sm text-slate">{label}</p>
      </div>

      {/* Trend indicator */}
      {trend && (
        <div className={`absolute top-4 right-4 flex items-center gap-1 text-xs font-medium ${
          trendDirection === 'up' ? 'text-success' : 'text-danger'
        }`}>
          <span>{trendDirection === 'up' ? '↑' : '↓'}</span>
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
