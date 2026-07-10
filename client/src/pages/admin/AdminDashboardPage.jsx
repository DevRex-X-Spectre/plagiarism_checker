import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service.js';
import { Users, FileText, Activity, Building2, ArrowRight, Shield } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import AdminNav from '../../components/admin/AdminNav.jsx';
import AdminNotice from '../../components/admin/AdminNotice.jsx';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.stats()
      .then(r => setStats(r.data.stats))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-32 text-center"><div className="w-8 h-8 border-2 border-mist border-t-deep-indigo rounded-full animate-spin mx-auto" /></div>;

  const navs = stats ? [
    { label: 'Users', desc: `${stats.totalUsers}`, href: '/admin/users', icon: Users },
    { label: 'Projects', desc: `${stats.totalProjects}`, href: '/admin/projects', icon: FileText },
    { label: 'Logs', desc: `${stats.totalSimilarityChecks}`, href: '/admin/logs', icon: Activity },
    { label: 'Departments', desc: `${stats.projectsByDepartment.length}`, href: '/admin/departments', icon: Building2 },
  ] : [];

  return (
    <div className="py-8 lg:py-12">
      <div className="container max-w-5xl">
        <div className="mb-8">
          <Badge className="inline-flex items-center gap-1.5 mb-3"><Shield className="w-3.5 h-3.5" /> Admin</Badge>
          <h1 className="text-3xl lg:text-4xl font-medium text-deep-ink tracking-tight">Admin dashboard</h1>
          <p className="mt-2 text-slate">Manage projects, users, departments, and similarity review logs.</p>
        </div>

        <AdminNav />
        <AdminNotice>{error}</AdminNotice>
        {!stats ? null : (
          <>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {navs.map((n, i) => (
            <Link key={n.label} to={n.href} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <Card padding={16} hover className="h-full">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-2xl font-medium text-deep-ink">{n.desc}</p>
                    <p className="text-sm text-slate">{n.label}</p>
                  </div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-deep-indigo/6 text-deep-indigo">
                    <n.icon className="w-5 h-5" />
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card padding={20}>
            <h2 className="text-base font-semibold text-deep-ink mb-4">Management</h2>
            <div className="grid gap-2">
              {navs.map(n => (
                <Link key={n.href} to={n.href} className="group flex items-center gap-3 rounded-2xl border border-transparent p-3 transition-colors hover:border-mist hover:bg-white/70">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-deep-indigo/6 text-deep-indigo">
                    <n.icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-deep-ink">{n.label}</span>
                    <span className="block text-xs text-slate">{getAdminActionText(n.label)}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-fog transition-transform group-hover:translate-x-1 group-hover:text-deep-indigo" />
                </Link>
              ))}
            </div>
          </Card>

          <Card padding={20}>
            <h2 className="text-base font-medium text-deep-ink mb-4">Top searched topics</h2>
            {stats.topSearchedTopics.length === 0 ? (
              <p className="text-sm text-slate">No data yet</p>
            ) : (
              <div className="space-y-2">
                {stats.topSearchedTopics.slice(0, 5).map((t, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-mist last:border-0">
                    <span className="text-sm text-carbon truncate mr-4">{t.query_text}</span>
                    <span className="text-xs font-mono text-slate flex-shrink-0">{t.count}x</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card padding={20} className="lg:col-span-2">
            <h2 className="text-base font-medium text-deep-ink mb-4">Projects by department</h2>
            {stats.projectsByDepartment.length === 0 ? (
              <p className="text-sm text-slate">No data yet</p>
            ) : (
              <div className="space-y-2">
                {stats.projectsByDepartment.map((d, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-mist last:border-0">
                    <span className="text-sm text-carbon">{d.name}</span>
                    <span className="text-xs font-mono text-slate">{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

function getAdminActionText(label) {
  const copy = {
    Users: 'Review accounts, roles, and access.',
    Projects: 'Browse uploads and remove bad records.',
    Logs: 'Audit similarity searches.',
    Departments: 'Create, edit, and deactivate departments.',
  };
  return copy[label] || 'Open admin section.';
}
