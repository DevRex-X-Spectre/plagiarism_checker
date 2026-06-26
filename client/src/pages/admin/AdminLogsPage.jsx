import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';

export default function AdminLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
  const [filters, setFilters] = useState({ query: '', userId: '' });
  const [loading, setLoading] = useState(true);

  const fetchLogs = (page = 1) => {
    setLoading(true);
    const params = { page };
    if (filters.query) params.query = filters.query;
    if (filters.userId) params.userId = filters.userId;

    adminService.similarityLogs(params)
      .then(r => {
        setLogs(r.data.checks);
        setPagination({ total: r.data.total, page: r.data.page, totalPages: r.data.totalPages });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, []);

  return (
    <div style={{ padding: 'var(--spacing-48) 0' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 'var(--text-heading-lg)', fontWeight: 'var(--font-weight-light)', color: 'var(--color-deep-ink)', marginBottom: 'var(--spacing-8)' }}>
          Similarity check logs
        </h1>
        <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)', marginBottom: 'var(--spacing-32)' }}>
          Every similarity check ever run on the platform
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-16)', marginBottom: 'var(--spacing-32)' }}>
          <Input
            placeholder="Search by topic..."
            value={filters.query}
            onChange={e => setFilters({ ...filters, query: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && fetchLogs(1)}
          />
          <Select
            value={filters.userId}
            onChange={e => setFilters({ ...filters, userId: e.target.value })}
            placeholder="Filter by user (optional)"
            options={[]}
          />
        </div>

        <Card padding={0}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-mist)' }}>
                {['Topic searched', 'User', 'Threshold', 'Results', 'Date'].map(h => (
                  <th key={h} style={{ padding: 'var(--spacing-12) var(--card-padding)', textAlign: 'left', fontFamily: 'var(--font-suisseintlmono)', fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'var(--font-weight-regular)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 'var(--spacing-24)', textAlign: 'center', color: 'var(--color-slate)' }}>Loading...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 'var(--spacing-24)', textAlign: 'center', color: 'var(--color-slate)' }}>No checks recorded yet</td></tr>
              ) : logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--color-mist)' }}>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)', fontSize: 'var(--text-body-sm)', color: 'var(--color-deep-ink)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.query_text}</td>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)', fontSize: 'var(--text-body-sm)', color: 'var(--color-carbon)' }}>{log.user_name}<br/><span style={{ color: 'var(--color-slate)', fontSize: '12px' }}>{log.user_email}</span></td>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)', fontSize: 'var(--text-body-sm)', color: 'var(--color-carbon)' }}>{Math.round(log.threshold * 100)}%+</td>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)' }}><Badge variant="muted">{log.result_count}</Badge></td>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)', fontSize: 'var(--text-body-sm)', color: 'var(--color-slate)' }}>{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}