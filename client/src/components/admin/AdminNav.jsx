import { NavLink } from 'react-router-dom';
import { Activity, Building2, FileText, LayoutDashboard, Users } from 'lucide-react';

const items = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FileText },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/logs', label: 'Logs', icon: Activity },
  { to: '/admin/departments', label: 'Departments', icon: Building2 },
];

export default function AdminNav() {
  return (
    <nav className="mb-8 flex gap-2 overflow-x-auto pb-1">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'border-deep-indigo bg-deep-indigo text-white'
                : 'border-mist bg-white/70 text-carbon hover:border-fog hover:bg-white'
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
