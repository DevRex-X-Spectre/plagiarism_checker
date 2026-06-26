import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { projectService } from '../services/project.service.js';
import { departmentService } from '../services/project.service.js';
import { useDebounce } from '../hooks/useDebounce.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Button from '../components/ui/Button.jsx';

export default function BrowsePage() {
  const [params, setParams] = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  const q = params.get('q') || '';
  const department = params.get('department') || '';
  const year = params.get('year') || '';
  const page = parseInt(params.get('page') || '1', 10);

  const debouncedQ = useDebounce(q, 400);

  useEffect(() => {
    departmentService.listActive().then(r => setDepartments(r.data.departments)).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    projectService.list({ q: debouncedQ, department, year, page, limit: 20 })
      .then(r => {
        setProjects(r.data.projects);
        setPagination({ total: r.data.total, page: r.data.page, totalPages: r.data.totalPages });
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, [debouncedQ, department, year, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setParams(next);
  };

  const years = Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => new Date().getFullYear() - i);

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
            Project Repository
          </h1>
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)' }}>
            {pagination.total.toLocaleString()} {pagination.total === 1 ? 'project' : 'projects'} in the archive
          </p>
        </div>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto auto',
          gap: 'var(--spacing-16)',
          marginBottom: 'var(--spacing-40)',
          alignItems: 'end',
        }}>
          <Input
            placeholder="Search by title or abstract..."
            value={q}
            onChange={e => updateParam('q', e.target.value)}
          />
          <Select
            value={department}
            onChange={e => updateParam('department', e.target.value)}
            options={departments.map(d => ({ value: d.id, label: d.name }))}
            placeholder="All departments"
            style={{ minWidth: 200 }}
          />
          <Select
            value={year}
            onChange={e => updateParam('year', e.target.value)}
            options={years.map(y => ({ value: y, label: y }))}
            placeholder="All years"
            style={{ minWidth: 120 }}
          />
          {(q || department || year) && (
            <Button variant="secondary" onClick={() => setParams({})}>
              Clear
            </Button>
          )}
        </div>

        {/* Project list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-80) 0', color: 'var(--color-slate)' }}>
            Loading...
          </div>
        ) : projects.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 'var(--spacing-64) 0' }}>
            <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)', marginBottom: 'var(--spacing-16)' }}>
              No projects found matching your filters.
            </p>
            <Button variant="ghost" onClick={() => setParams({})}>Clear filters</Button>
          </Card>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-16)' }}>
              {projects.map(project => (
                <Link key={project.id} to={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                  <Card style={{ cursor: 'pointer', transition: 'box-shadow 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = 'var(--shadow-sm)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--shadow-subtle)'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-24)', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{
                          fontFamily: 'var(--font-suisseintl)',
                          fontSize: 'var(--text-body-lg)',
                          fontWeight: 'var(--font-weight-medium)',
                          color: 'var(--color-deep-ink)',
                          marginBottom: 'var(--spacing-8)',
                          lineHeight: 'var(--leading-body-lg)',
                        }}>
                          {project.title}
                        </h3>
                        <p style={{
                          fontSize: 'var(--text-body-sm)',
                          color: 'var(--color-slate)',
                          marginBottom: 'var(--spacing-12)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {project.abstract}
                        </p>
                        <div style={{ display: 'flex', gap: 'var(--spacing-12)', flexWrap: 'wrap' }}>
                          <Badge>{project.department_name}</Badge>
                          <Badge variant="muted">{project.author_name}</Badge>
                          <Badge variant="muted">{project.year}</Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'var(--spacing-8)',
                marginTop: 'var(--spacing-40)',
              }}>
                {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      onClick={() => updateParam('page', p.toString())}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 'var(--radius-lg)',
                        border: `1px solid ${p === page ? 'var(--color-deep-indigo)' : 'var(--color-mist)'}`,
                        background: p === page ? 'var(--color-deep-indigo)' : 'transparent',
                        color: p === page ? '#fff' : 'var(--color-carbon)',
                        fontFamily: 'var(--font-suisseintl)',
                        fontSize: 'var(--text-body-sm)',
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
