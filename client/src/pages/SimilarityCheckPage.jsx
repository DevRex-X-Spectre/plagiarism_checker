import { useState } from 'react';
import { Link } from 'react-router-dom';
import { similarityService } from '../services/project.service.js';
import { Search, Brain, AlertCircle, CheckCircle2, Building, User, Calendar, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function SimilarityCheckPage() {
  const [form, setForm] = useState({ title: '', abstract: '', threshold: 0.5 });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!form.title || form.title.length < 5) {
      setError('Enter at least 5 characters');
      return;
    }
    setError('');
    setLoading(true);
    setResults(null);
    try {
      const res = await similarityService.check({ title: form.title, abstract: form.abstract || undefined, threshold: form.threshold });
      setResults(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => score >= 0.8 ? 'danger' : score >= 0.5 ? 'warning' : 'success';
  const scoreLabel = (score) => score >= 0.8 ? 'High' : score >= 0.5 ? 'Moderate' : 'Low';

  return (
    <div className="py-8 lg:py-12">
      <div className="container max-w-3xl">
        <div className="mb-8">
          <Badge className="inline-flex items-center gap-1.5 mb-3"><Brain className="w-3.5 h-3.5" /> Semantic Check</Badge>
          <h1 className="text-3xl lg:text-4xl font-light text-deep-ink tracking-tight mb-2">Check your topic</h1>
          <p className="text-slate">Find conceptually similar projects in the archive.</p>
        </div>

        <Card padding={24} className="mb-8">
          <form onSubmit={handleCheck} className="space-y-5">
            <Input label="Topic title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. AI-Based Attendance System" required />

            <div>
              <label className="block text-sm font-medium text-carbon mb-2">Abstract (optional)</label>
              <textarea value={form.abstract} onChange={e => setForm({ ...form, abstract: e.target.value })} rows={3} placeholder="Brief description..." className="w-full px-4 py-3 text-base bg-card-white border border-mist rounded-lg outline-none focus:border-deep-indigo resize-vertical" />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-carbon">Threshold</label>
                <span className="font-mono text-sm font-semibold">{Math.round(form.threshold * 100)}%</span>
              </div>
              <input type="range" min="0.3" max="0.9" step="0.05" value={form.threshold} onChange={e => setForm({ ...form, threshold: parseFloat(e.target.value) })} className="w-full accent-deep-indigo" />
            </div>

            {error && <div className="flex items-center gap-2 p-3 bg-danger/5 border border-danger/20 rounded-lg text-danger text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}

            <Button type="submit" loading={loading} size="lg" fullWidth icon={Search}>Run check</Button>
          </form>
        </Card>

        {results && !loading && (
          <div className="animate-fade-up">
            <h2 className="text-xl font-medium text-deep-ink mb-4">{results.totalResults} {results.totalResults === 1 ? 'match' : 'matches'} above {Math.round(results.threshold * 100)}%</h2>

            {results.totalResults === 0 ? (
              <Card padding={32} className="text-center">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                <h3 className="text-xl font-medium text-deep-ink mb-2">Clear to proceed</h3>
                <p className="text-slate">No similar topics found.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {results.results.map((r, i) => {
                  const pct = Math.round(r.score * 100);
                  const color = scoreColor(r.score);
                  const colors = { danger: 'text-danger bg-danger/5', warning: 'text-warning bg-warning/5', success: 'text-success bg-success/5' };
                  return (
                    <Link key={r.projectId} to={`/projects/${r.projectId}`} className="block animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                      <Card padding={20} hover>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium mb-2 ${colors[color]}`}>
                              {scoreLabel(r.score)}
                            </div>
                            <h4 className="text-base font-medium text-deep-ink line-clamp-2">{r.title}</h4>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate">
                              <span>{r.departmentName}</span>
                              <span>·</span>
                              <span>{r.authorName}</span>
                              <span>·</span>
                              <span>{r.year}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-3xl font-light tabular-nums ${colors[color].split(' ')[0]}`}>{pct}%</div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Badge({ children, className }) {
  return <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 bg-pale-cyan/30 rounded-full text-xs font-mono text-forest-teal ${className}`}>{children}</span>;
}