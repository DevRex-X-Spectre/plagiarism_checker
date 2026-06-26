import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.stats()
      .then(r => setStats(r.data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: 'var(--spacing-48) 0', textAlign: 'center' }}>Loading...</div>;
  }

  if (!stats) return null;

  const navCards = [
    { label: 'Users', desc: `${stats.totalUsers} registered`, href: '/admin/users' },
    { label: 'Projects', desc: `${stats.totalProjects} in archive`, href: '/admin/projects' },
    { label: 'Similarity logs', desc: `${stats.totalSimilarityChecks} checks run`, href: '/admin/logs' },
    { label: 'Departments', desc: 'Manage faculty departments', href: '/admin/departments' },
  ];

  return (
    <div style={{ padding: 'var(--spacing-48) 0' }}>
      <div className="container">
        <div style={{ marginBottom: 'var(--spacing-40)' }}>
          <Badge style={{ marginBottom: 'var(--spacing-16)' }}>Admin Console</Badge>
          <h1 style={{
            fontFamily: 'var(--font-suisseintl)',
            fontSize: 'var(--text-heading-lg)',
            fontWeight: 'var(--font-weight-light)',
            color: 'var(--color-deep-ink)',
          }}>
            System overview
          </h1>
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--spacing-16)',
          marginBottom: 'var(--spacing-48)',
        }}>
          {[
            { label: 'Users', value: stats.totalUsers },
            { label: 'Projects', value: stats.totalProjects },
            { label: 'Checks', value: stats.totalSimilarityChecks },
            { label: 'Departments', value: stats.projectsByDepartment.length },
          ].map(s => (
            <Card key={s.label} padding={20}>
              <div style={{
                fontFamily: 'var(--font-suisseintlmono)',
                fontSize: '11px',
                color: 'var(--color-slate)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 'var(--spacing-8)',
              }}>
                {s.label}
              </div>
              <div style={{
                fontFamily: 'var(--font-suisseintl)',
                fontSize: '32px',
                fontWeight: 'var(--font-weight-light)',
                color: 'var(--color-deep-ink)',
                lineHeight: 1,
              }}>
                {s.value}
              </div>
            </Card>
          ))}
        </div>

        {/* Navigation cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--spacing-16)',
          marginBottom: 'var(--spacing-48)',
        }}>
          {navCards.map(nav => (
            <Link key={nav.label} to={nav.href} style={{ textDecoration: 'none' }}>
              <Card style={{ height: '100%' }}>
                <h3 style={{
                  fontFamily: 'var(--font-suisseintl)',
                  fontSize: 'var(--text-body-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-deep-ink)',
                  marginBottom: 'var(--spacing-4)',
                }}>
                  {nav.label}
                </h3>
                <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-slate)' }}>{nav.desc}</p>
              </Card>
            </Link>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-40)' }}>
          {/* Top searched topics */}
          <div>
            <h2 style={{
              fontFamily: 'var(--font-suisseintl)',
              fontSize: 'var(--text-heading-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-deep-ink)',
              marginBottom: 'var(--spacing-20)',
            }}>
              Top searched topics
            </h2>
            {stats.topSearchedTopics.length === 0 ? (
              <Card>No checks yet</Card>
            ) : (
              <Card padding={0}>
                <div style={{ padding: 'var(--spacing-16) var(--card-padding)', borderBottom: '1px solid var(--color-mist)' }}>
                  {stats.topSearchedTopics.map((t, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-8) 0' }}>
                      <span style={{
                        fontSize: 'var(--text-body-sm)',
                        color: 'var(--color-carbon)',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {t.query_text}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-suisseintlmono)',
                        fontSize: 'var(--text-body-sm)',
                        color: 'var(--color-slate)',
                      }}>
                        {t.count}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Projects by department */}
          <div>
            <h2 style={{
              fontFamily: 'var(--font-suisseintl)',
              fontSize: 'var(--text-heading-sm)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-deep-ink)',
              marginBottom: 'var(--spacing-20)',
            }}>
              Projects by department
            </h2>
            {stats.projectsByDepartment.length === 0 ? (
              <Card>No data</Card>
            ) : (
              <Card padding={0}>
                <div style={{ padding: 'var(--spacing-16) var(--card-padding)' }}>
                  {stats.projectsByDepartment.map((d, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--spacing-8) 0' }}>
                      <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-carbon)' }}>
                        {d.name}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-suisseintlmono)',
                        fontSize: 'var(--text-body-sm)',
                        color: 'var(--color-slate)',
                      }}>
                        {d.count}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}