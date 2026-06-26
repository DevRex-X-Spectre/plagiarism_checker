import { useState } from 'react';
import { Link } from 'react-router-dom';
import { similarityService } from '../services/project.service.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function SimilarityCheckPage() {
  const [form, setForm] = useState({ title: '', abstract: '', threshold: 0.5 });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!form.title || form.title.length < 5) {
      setError('Please enter a topic title (at least 5 characters)');
      return;
    }
    setError('');
    setLoading(true);
    setResults(null);
    try {
      const res = await similarityService.check({
        title: form.title,
        abstract: form.abstract || undefined,
        threshold: form.threshold,
      });
      setResults(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 0.8) return '#dc2626';
    if (score >= 0.5) return '#d97706';
    return 'var(--color-mint)';
  };

  const scoreLabel = (score) => {
    if (score >= 0.8) return 'High';
    if (score >= 0.5) return 'Moderate';
    return 'Low';
  };

  return (
    <div style={{ padding: 'var(--spacing-48) 0' }}>
      <div className="container" style={{ maxWidth: 880 }}>
        <Badge style={{ marginBottom: 'var(--spacing-16)' }}>Semantic Similarity Check</Badge>
        <h1 style={{
          fontFamily: 'var(--font-suisseintl)',
          fontSize: 'var(--text-heading-lg)',
          fontWeight: 'var(--font-weight-light)',
          color: 'var(--color-deep-ink)',
          marginBottom: 'var(--spacing-8)',
        }}>
          Check your topic
        </h1>
        <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)', marginBottom: 'var(--spacing-40)' }}>
          Enter your proposed project title and we'll find conceptually similar projects in the archive.
        </p>

        {/* Form */}
        <Card style={{ marginBottom: 'var(--spacing-40)' }}>
          <form onSubmit={handleCheck} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
            <Input
              label="Project topic title"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. AI-Based Attendance Management System"
              required
            />
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-body-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-carbon)',
                marginBottom: 'var(--spacing-8)',
              }}>
                Abstract (optional — improves accuracy)
              </label>
              <textarea
                value={form.abstract}
                onChange={e => setForm({ ...form, abstract: e.target.value })}
                placeholder="A brief description of what your project does..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: 'var(--text-body)',
                  fontFamily: 'var(--font-suisseintl)',
                  color: 'var(--color-deep-ink)',
                  background: 'var(--surface-card)',
                  border: '1px solid var(--color-mist)',
                  borderRadius: 'var(--radius-inputs)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-8)',
              }}>
                <label style={{
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-carbon)',
                }}>
                  Similarity threshold
                </label>
                <span style={{
                  fontFamily: 'var(--font-suisseintlmono)',
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-deep-ink)',
                }}>
                  {Math.round(form.threshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.9"
                step="0.05"
                value={form.threshold}
                onChange={e => setForm({ ...form, threshold: parseFloat(e.target.value) })}
                style={{ width: '100%', accentColor: 'var(--color-deep-indigo)' }}
              />
              <p style={{ fontSize: 'var(--text-caption)', color: 'var(--color-slate)', marginTop: 'var(--spacing-4)' }}>
                Only show projects above this similarity score.
              </p>
            </div>

            {error && (
              <div style={{ padding: 'var(--spacing-12)', background: '#fee2e2', borderRadius: 'var(--radius-lg)', color: '#991b1b', fontSize: 'var(--text-body-sm)' }}>
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} style={{ width: '100%' }}>
              Run similarity check →
            </Button>
          </form>
        </Card>

        {/* Results */}
        {loading && (
          <Card style={{ textAlign: 'center', padding: 'var(--spacing-48) 0' }}>
            <p style={{ color: 'var(--color-slate)' }}>Analyzing similarity across all stored projects...</p>
          </Card>
        )}

        {results && !loading && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-20)',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-suisseintl)',
                fontSize: 'var(--text-heading-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-deep-ink)',
              }}>
                Results
              </h2>
              <span style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-slate)' }}>
                {results.totalResults} {results.totalResults === 1 ? 'match' : 'matches'} above {Math.round(results.threshold * 100)}%
              </span>
            </div>

            {results.totalResults === 0 ? (
              <Card style={{ textAlign: 'center', padding: 'var(--spacing-40) 0' }}>
                <p style={{ fontSize: 'var(--text-body-lg)', color: 'var(--color-deep-ink)', marginBottom: 'var(--spacing-8)' }}>
                  Clear to proceed
                </p>
                <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-slate)' }}>
                  No projects found above {Math.round(results.threshold * 100)}% similarity.
                </p>
              </Card>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12)' }}>
                {results.results.map((r, i) => (
                  <Link key={r.projectId} to={`/projects/${r.projectId}`} style={{ textDecoration: 'none' }}>
                    <Card style={{ cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--spacing-16)' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', gap: 'var(--spacing-8)', marginBottom: 'var(--spacing-8)' }}>
                            <span style={{
                              fontFamily: 'var(--font-suisseintlmono)',
                              fontSize: 'var(--text-caption)',
                              color: 'var(--color-fog)',
                            }}>
                              #{i + 1}
                            </span>
                            <Badge variant={r.level === 'high' ? 'danger' : r.level === 'moderate' ? 'warning' : 'success'}>
                              {scoreLabel(r.score)}
                            </Badge>
                          </div>
                          <h4 style={{
                            fontFamily: 'var(--font-suisseintl)',
                            fontSize: 'var(--text-body-lg)',
                            fontWeight: 'var(--font-weight-medium)',
                            color: 'var(--color-deep-ink)',
                            marginBottom: 'var(--spacing-8)',
                          }}>
                            {r.title}
                          </h4>
                          <div style={{ display: 'flex', gap: 'var(--spacing-8)', flexWrap: 'wrap' }}>
                            <Badge variant="muted">{r.departmentName}</Badge>
                            <Badge variant="muted">{r.authorName}</Badge>
                            <Badge variant="muted">{r.year}</Badge>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{
                            fontFamily: 'var(--font-suisseintl)',
                            fontSize: '32px',
                            fontWeight: 'var(--font-weight-light)',
                            color: scoreColor(r.score),
                            lineHeight: 1,
                          }}>
                            {Math.round(r.score * 100)}%
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-suisseintlmono)',
                            fontSize: 'var(--text-caption)',
                            color: 'var(--color-slate)',
                            marginTop: 'var(--spacing-4)',
                          }}>
                            SIMILARITY
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
