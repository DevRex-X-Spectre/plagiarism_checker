import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchProjects = (page = 1) => {
    setLoading(true);
    adminService.projects({ page, limit: 20 })
      .then(r => {
        setProjects(r.data.projects);
        setPagination({ total: r.data.total, page: r.data.page, totalPages: r.data.totalPages });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await adminService.deleteProject(id);
      fetchProjects(pagination.page);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-48) 0' }}>
      <div className="container">
        <h1 style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 'var(--text-heading-lg)', fontWeight: 'var(--font-weight-light)', color: 'var(--color-deep-ink)', marginBottom: 'var(--spacing-8)' }}>
          All projects
        </h1>
        <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)', marginBottom: 'var(--spacing-32)' }}>
          {pagination.total} total projects (including deleted)
        </p>

        <Card padding={0}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-mist)' }}>
                {['Title', 'Author', 'Department', 'Year', 'Status', ''].map(h => (
                  <th key={h} style={{ padding: 'var(--spacing-12) var(--card-padding)', textAlign: 'left', fontFamily: 'var(--font-suisseintlmono)', fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'var(--font-weight-regular)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 'var(--spacing-24)', textAlign: 'center', color: 'var(--color-slate)' }}>Loading...</td></tr>
              ) : projects.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-mist)' }}>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)' }}>
                    <Link to={`/projects/${p.id}`} style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-deep-ink)', fontWeight: 'var(--font-weight-medium)', textDecoration: 'none' }}>
                      {p.title}
                    </Link>
                  </td>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)', fontSize: 'var(--text-body-sm)', color: 'var(--color-carbon)' }}>{p.author_name}</td>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)' }}><Badge variant="muted">{p.department_name}</Badge></td>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)', fontSize: 'var(--text-body-sm)', color: 'var(--color-carbon)' }}>{p.year}</td>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)' }}>
                    {p.is_deleted
                      ? <Badge variant="danger">Deleted</Badge>
                      : <Badge variant="success">Active</Badge>
                    }
                  </td>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)', textAlign: 'right' }}>
                    {!p.is_deleted && (
                      <Button size="sm" variant="secondary" onClick={() => handleDelete(p.id)}>Delete</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}