import { NavLink } from 'react-router-dom';
import { Activity, Building2, FileText, LayoutDashboard, Users } from 'lucide-react';

const items = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: FileText },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/departments', label: 'Departments', icon: Building2 },
];

export default function AdminNav() {
  return (
    <nav className="mb-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors sm:justify-start sm:rounded-full sm:px-4 ${
              isActive
                ? 'border-deep-indigo bg-deep-indigo text-midnight-teal'
                : 'border-mist bg-card-white text-carbon hover:border-deep-indigo/60 hover:bg-pale-cyan'
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
