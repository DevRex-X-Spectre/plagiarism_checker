import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../services/project.service.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    projectService.get(id)
      .then(r => setProject(r.data.project))
      .catch(() => setError('Project not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: 'var(--spacing-80) 0' }}>Loading...</div>;
  if (error) return (
    <div style={{ textAlign: 'center', padding: 'var(--spacing-80) 0' }}>
      <p style={{ color: 'var(--color-slate)', marginBottom: 'var(--spacing-24)' }}>{error}</p>
      <Link to="/browse"><Button variant="ghost">Back to browse</Button></Link>
    </div>
  );

  return (
    <div style={{ padding: 'var(--spacing-48) 0' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <Link to="/browse" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-8)', color: 'var(--color-slate)', fontSize: 'var(--text-body-sm)', marginBottom: 'var(--spacing-40)' }}>
          ← Back to repository
        </Link>

        <Card shadow="subtle">
          <div style={{ marginBottom: 'var(--spacing-24)' }}>
            <div style={{ display: 'flex', gap: 'var(--spacing-12)', flexWrap: 'wrap', marginBottom: 'var(--spacing-16)' }}>
              <Badge>{project.department_name}</Badge>
              <Badge variant="muted">{project.year}</Badge>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-suisseintl)',
              fontSize: 'var(--text-heading-lg)',
              fontWeight: 'var(--font-weight-light)',
              color: 'var(--color-deep-ink)',
              lineHeight: 'var(--leading-heading-lg)',
              letterSpacing: 'var(--tracking-heading-lg)',
              marginBottom: 'var(--spacing-16)',
            }}>
              {project.title}
            </h1>
            <p style={{
              fontFamily: 'var(--font-suisseintl)',
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-slate)',
            }}>
              By {project.author_name} · Uploaded by {project.uploader_name}
            </p>
          </div>

          <div style={{
            borderTop: '1px solid var(--color-mist)',
            paddingTop: 'var(--spacing-24)',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-suisseintl)',
              fontSize: 'var(--text-body-lg)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-deep-ink)',
              marginBottom: 'var(--spacing-12)',
            }}>
              Abstract
            </h2>
            <p style={{
              fontSize: 'var(--text-body)',
              color: 'var(--color-carbon)',
              lineHeight: 'var(--leading-body)',
              whiteSpace: 'pre-wrap',
            }}>
              {project.abstract}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
