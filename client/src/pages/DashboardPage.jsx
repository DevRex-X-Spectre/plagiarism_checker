import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { projectService } from '../services/project.service.js';
import { similarityService } from '../services/project.service.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [myProjects, setMyProjects] = useState([]);
  const [checkHistory, setCheckHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      projectService.getMine(),
      similarityService.history(),
    ])
      .then(([p, h]) => {
        setMyProjects(p.data.projects || []);
        setCheckHistory(h.data.checks || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 'var(--spacing-48) 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 'var(--spacing-40)' }}>
          <h1 style={{
            fontFamily: 'var(--font-suisseintl)',
            fontSize: 'var(--text-heading-lg)',
            fontWeight: 'var(--font-weight-light)',
            color: 'var(--color-deep-ink)',
            marginBottom: 'var(--spacing-8)',
          }}>
            Welcome back, {user?.fullName?.split(' ')[0]}
          </h1>
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)' }}>
            {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} · {user?.email}
          </p>
        </div>

        {/* Quick actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--spacing-16)',
          marginBottom: 'var(--spacing-48)',
        }}>
          {[
            { label: 'Check similarity', desc: 'See if your topic overlaps with existing projects', href: '/similarity-check', icon: '🔍', variant: 'primary' },
            { label: 'Upload project', desc: 'Add a new project to the archive', href: '/upload', icon: '↑', variant: 'secondary' },
            { label: 'Browse archive', desc: 'Explore all submitted projects', href: '/browse', icon: '📚', variant: 'ghost' },
          ].map((action, i) => (
            <Link key={i} to={action.href} style={{ textDecoration: 'none' }}>
              <Card shadow="subtle" style={{ height: '100%' }}>
                <div style={{
                  fontSize: 24,
                  marginBottom: 'var(--spacing-12)',
                  color: action.variant === 'primary' ? 'var(--color-deep-indigo)' : 'var(--color-carbon)',
                }}>
                  {action.icon}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-suisseintl)',
                  fontSize: 'var(--text-body-lg)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-deep-ink)',
                  marginBottom: 'var(--spacing-8)',
                }}>
                  {action.label}
                </h3>
                <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-slate)' }}>
                  {action.desc}
                </p>
              </Card>
            </Link>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-40)' }}>
          {/* My projects */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-20)' }}>
              <h2 style={{
                fontFamily: 'var(--font-suisseintl)',
                fontSize: 'var(--text-heading-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-deep-ink)',
              }}>
                My uploads
              </h2>
              <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-slate)' }}>
                {myProjects.length} {myProjects.length === 1 ? 'project' : 'projects'}
              </span>
            </div>

            {loading ? (
              <Card>Loading...</Card>
            ) : myProjects.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 'var(--spacing-40) 0' }}>
                <p style={{ color: 'var(--color-slate)', marginBottom: 'var(--spacing-16)' }}>
                  You haven't uploaded any projects yet.
                </p>
                <Link to="/upload">
                  <Button variant="primary" size="sm">Upload your first project</Button>
                </Link>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12)' }}>
                {myProjects.slice(0, 5).map(p => (
                  <Card key={p.id} padding={16}>
                    <Link to={`/projects/${p.id}`} style={{ textDecoration: 'none' }}>
                      <h4 style={{
                        fontFamily: 'var(--font-suisseintl)',
                        fontSize: 'var(--text-body-sm)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: 'var(--color-deep-ink)',
                        marginBottom: 'var(--spacing-4)',
                      }}>
                        {p.title}
                      </h4>
                      <div style={{ display: 'flex', gap: 'var(--spacing-8)', flexWrap: 'wrap' }}>
                        <Badge variant="muted">{p.department_name}</Badge>
                        <Badge variant="muted">{p.year}</Badge>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Similarity check history */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-20)' }}>
              <h2 style={{
                fontFamily: 'var(--font-suisseintl)',
                fontSize: 'var(--text-heading-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-deep-ink)',
              }}>
                Recent checks
              </h2>
              <Link to="/similarity-check">
                <Button variant="ghost" size="sm">New check</Button>
              </Link>
            </div>

            {loading ? (
              <Card>Loading...</Card>
            ) : checkHistory.length === 0 ? (
              <Card style={{ textAlign: 'center', padding: 'var(--spacing-40) 0' }}>
                <p style={{ color: 'var(--color-slate)', marginBottom: 'var(--spacing-16)' }}>
                  No similarity checks yet.
                </p>
                <Link to="/similarity-check">
                  <Button variant="primary" size="sm">Run your first check</Button>
                </Link>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12)' }}>
                {checkHistory.slice(0, 5).map(c => (
                  <Card key={c.id} padding={16}>
                    <div style={{
                      fontFamily: 'var(--font-suisseintl)',
                      fontSize: 'var(--text-body-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      color: 'var(--color-deep-ink)',
                      marginBottom: 'var(--spacing-4)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      "{c.query_text}"
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 'var(--text-caption)', color: 'var(--color-slate)' }}>
                        {new Date(c.created_at).toLocaleDateString()} · {c.result_count} results
                      </span>
                      <Badge variant="muted">{Math.round(c.threshold * 100)}%+</Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
