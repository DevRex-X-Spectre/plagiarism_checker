import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section style={{
        padding: 'var(--spacing-96) 0 var(--spacing-80)',
      }}>
        <div className="container" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--spacing-64)',
          alignItems: 'center',
        }}>
          <div>
            <Badge style={{ marginBottom: 'var(--spacing-24)' }}>
              Faculty Project Archive
            </Badge>
            <h1 style={{
              fontFamily: 'var(--font-suisseintl)',
              fontSize: 'var(--text-heading-lg)',
              fontWeight: 'var(--font-weight-light)',
              lineHeight: 'var(--leading-heading-lg)',
              letterSpacing: 'var(--tracking-heading-lg)',
              color: 'var(--color-deep-ink)',
              marginBottom: 'var(--spacing-24)',
            }}>
              Know what's been<br />
              <span style={{ color: 'var(--color-fog)' }}>researched before.</span>
            </h1>
            <p style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-slate)',
              lineHeight: 'var(--leading-body-lg)',
              marginBottom: 'var(--spacing-40)',
              maxWidth: 480,
            }}>
              Upload student projects and check new topics for semantic overlap.
              Built for Nigerian university faculties — detects conceptual duplication
              that tools like Turnitin miss.
            </p>
            <div style={{ display: 'flex', gap: 'var(--spacing-16)', flexWrap: 'wrap' }}>
              {isAuthenticated ? (
                <>
                  <Link to="/similarity-check">
                    <Button variant="primary" size="lg">Check a topic →</Button>
                  </Link>
                  <Link to="/upload">
                    <Button variant="ghost" size="lg">Upload project</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button variant="primary" size="lg">Get started →</Button>
                  </Link>
                  <Link to="/browse">
                    <Button variant="ghost" size="lg">Browse archive</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero visual — Financial data card mockup */}
          <div>
            <Card shadow="xl" padding={32} style={{ maxWidth: 400, margin: '0 auto' }}>
              <div style={{
                fontFamily: 'var(--font-suisseintl)',
                fontSize: '14px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--color-deep-ink)',
                marginBottom: 'var(--spacing-8)',
              }}>
                Similarity Check
              </div>
              <div style={{
                fontFamily: 'var(--font-suisseintl)',
                fontSize: '28px',
                fontWeight: 'var(--font-weight-light)',
                color: 'var(--color-deep-ink)',
                letterSpacing: '-0.56px',
                marginBottom: 'var(--spacing-4)',
              }}>
                Topic Analysis
              </div>
              <div style={{
                fontFamily: 'var(--font-suisseintlmono)',
                fontSize: '11px',
                color: 'var(--color-slate)',
                marginBottom: 'var(--spacing-24)',
              }}>
                SEMANTIC SIMILARITY ENGINE
              </div>
              <div style={{
                borderTop: '1px solid var(--color-mist)',
                paddingTop: 'var(--spacing-16)',
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-12)' }}>
                  {[
                    { title: 'AI-Based Attendance System using Face Recognition', score: 87 },
                    { title: 'Automated Attendance Tracking with CNN', score: 71 },
                    { title: 'Library Management System', score: 12 },
                  ].map((item, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 'var(--spacing-12)',
                    }}>
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--color-carbon)',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {item.title}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        fontFamily: 'var(--font-suisseintlmono)',
                        fontWeight: 'var(--font-weight-medium)',
                        color: item.score >= 80 ? '#dc2626' : item.score >= 50 ? '#d97706' : 'var(--color-mint)',
                        minWidth: 36,
                        textAlign: 'right',
                      }}>
                        {item.score}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{
        padding: 'var(--spacing-80) 0',
        background: 'var(--surface-card)',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-64)' }}>
            <Badge style={{ marginBottom: 'var(--spacing-16)' }}>How it works</Badge>
            <h2 style={{
              fontFamily: 'var(--font-suisseintl)',
              fontSize: 'var(--text-heading-lg)',
              fontWeight: 'var(--font-weight-light)',
              color: 'var(--color-deep-ink)',
            }}>
              Three steps to smarter research
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 'var(--spacing-32)',
          }}>
            {[
              {
                step: '01',
                title: 'Upload your project',
                desc: 'Drop a DOCX or PDF. We extract the title, abstract, author, department, and year automatically. No form filling.',
              },
              {
                step: '02',
                title: 'Check your topic',
                desc: 'Type your proposed project title. Sentence-BERT converts it to a meaning-based vector and compares it against every stored project.',
              },
              {
                step: '03',
                title: 'Get ranked results',
                desc: 'Results appear ranked by cosine similarity score. Above 80%? Too close. Below 50%? Clear to proceed.',
              },
            ].map((f) => (
              <div key={f.step}>
                <div style={{
                  fontFamily: 'var(--font-suisseintlmono)',
                  fontSize: '40px',
                  fontWeight: 'var(--font-weight-light)',
                  color: 'var(--color-mist)',
                  marginBottom: 'var(--spacing-16)',
                }}>
                  {f.step}
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-suisseintl)',
                  fontSize: 'var(--text-heading-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-deep-ink)',
                  marginBottom: 'var(--spacing-12)',
                }}>
                  {f.title}
                </h3>
                <p style={{
                  fontSize: 'var(--text-body)',
                  color: 'var(--color-slate)',
                  lineHeight: 'var(--leading-body)',
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'var(--spacing-80) 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{
            fontFamily: 'var(--font-suisseintl)',
            fontSize: 'var(--text-heading-lg)',
            fontWeight: 'var(--font-weight-light)',
            color: 'var(--color-deep-ink)',
            marginBottom: 'var(--spacing-24)',
          }}>
            Start building a smarter archive today
          </h2>
          <p style={{
            fontSize: 'var(--text-body)',
            color: 'var(--color-slate)',
            marginBottom: 'var(--spacing-40)',
          }}>
            Free for faculties. No admin setup. Just register and start.
          </p>
          {!isAuthenticated && (
            <Link to="/register">
              <Button variant="primary" size="lg">Create your account →</Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
