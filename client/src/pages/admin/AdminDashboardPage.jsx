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
        <div className="mb-10">
          <Badge className="inline-flex items-center gap-1.5 mb-3"><Shield className="w-3.5 h-3.5" /> Admin</Badge>
          <h1 className="text-3xl lg:text-4xl font-light text-deep-ink tracking-tight">System overview</h1>
        </div>

        <AdminNav />
        <AdminNotice>{error}</AdminNotice>
        {!stats ? null : (
          <>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {navs.map((n, i) => (
            <Link key={n.label} to={n.href} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
              <Card padding={20} hover className="text-center">
                <n.icon className="w-6 h-6 text-deep-indigo mx-auto mb-2" />
                <p className="text-2xl font-light text-deep-ink">{n.desc}</p>
                <p className="text-sm text-slate">{n.label}</p>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
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

          <Card padding={20}>
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
