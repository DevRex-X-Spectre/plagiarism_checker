import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service.js';
import { Activity } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Select from '../../components/ui/Select.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import AdminNav from '../../components/admin/AdminNav.jsx';
import AdminNotice from '../../components/admin/AdminNotice.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
  const [filters, setFilters] = useState({ query: '', userId: '' });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const debouncedQuery = useDebounce(filters.query, 350);

  const fetchLogs = (page = 1) => {
    setLoading(true);
    setError('');
    const params = { page };
    if (filters.query) params.query = filters.query;
    if (filters.userId) params.userId = filters.userId;
    adminService.similarityLogs(params).then(r => {
      setLogs(r.data.checks);
      setPagination({ total: r.data.total, page: r.data.page, totalPages: r.data.totalPages });
    }).catch(err => setError(err.message)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, []);
  useEffect(() => {
    adminService.users({ limit: 100 }).then(r => setUsers(r.data.users || [])).catch(() => {});
  }, []);
  useEffect(() => { fetchLogs(1); }, [debouncedQuery, filters.userId]);

  return (
    <div className="py-8 lg:py-12">
      <div className="container max-w-5xl">
        <div className="mb-8">
          <Badge className="inline-flex items-center gap-1.5 mb-3"><Activity className="w-3.5 h-3.5" /> Logs</Badge>
          <h1 className="text-3xl lg:text-4xl font-light text-deep-ink tracking-tight">Similarity check logs</h1>
        </div>

        <AdminNav />
        <AdminNotice>{error}</AdminNotice>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <SearchInput value={filters.query} onChange={e => setFilters({ ...filters, query: e.target.value })} placeholder="Search topics..." />
          <Select value={filters.userId} onChange={e => setFilters({ ...filters, userId: e.target.value })} placeholder="All users" options={users.map(user => ({ value: user.id, label: user.full_name }))} />
        </div>

        <Card padding={0}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-mist bg-paper-white/50">
                {['Topic', 'User', 'Threshold', 'Results', 'Date'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-mono text-slate uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate">Loading...</td></tr> :
                 logs.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate">No logs yet</td></tr> :
                 logs.map(log => (
                  <tr key={log.id} className="border-b border-mist last:border-0 hover:bg-paper-white/30">
                    <td className="px-4 py-3 max-w-xs"><span className="text-sm text-deep-ink line-clamp-1">{log.query_text}</span></td>
                    <td className="px-4 py-3"><div><span className="text-sm text-slate block">{log.user_name}</span><span className="text-xs text-fog">{log.user_email}</span></div></td>
                    <td className="px-4 py-3"><Badge>{Math.round(log.threshold * 100)}%+</Badge></td>
                    <td className="px-4 py-3"><span className="text-sm text-slate">{log.result_count}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-slate">{new Date(log.created_at).toLocaleDateString()}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={fetchLogs} />
      </div>
    </div>
  );
}
