import { useState } from 'react';
import { Link } from 'react-router-dom';
import { similarityService } from '../services/project.service.js';
import { Search, Brain, AlertCircle, CheckCircle2, Building, User, Calendar, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function SimilarityCheckPage() {
  const [form, setForm] = useState({ title: '', abstract: '' });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!form.title || form.title.length < 5) {
      setError('Please enter at least five characters for the topic title.');
      return;
    }
    setError('');
    setLoading(true);
    setResults(null);
    try {
      const res = await similarityService.check({ title: form.title, abstract: form.abstract || undefined });
      setResults(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => score >= 0.8 ? 'danger' : score >= 0.5 ? 'warning' : 'success';
  const scoreLabel = (score) => score >= 0.8 ? 'Strong match' : score >= 0.5 ? 'Possible match' : 'Low match';

  return (
    <div className="py-8 lg:py-12">
      <div className="container max-w-3xl">
        <div className="mb-8">
          <Badge className="inline-flex items-center gap-1.5 mb-3"><Brain className="w-3.5 h-3.5" /> Semantic review</Badge>
          <h1 className="text-3xl lg:text-4xl font-medium text-deep-ink tracking-tight mb-2">Check your topic</h1>
          <p className="text-slate">Compare a topic against the repository before you move ahead.</p>
        </div>

        <Card padding={24} className="mb-8 card-3d">
          <form onSubmit={handleCheck} className="space-y-5">
            <Input label="Topic title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. AI-Based Attendance System" required />

            <div>
              <label className="block text-sm font-medium text-carbon mb-2">Abstract or short description (optional)</label>
              <textarea value={form.abstract} onChange={e => setForm({ ...form, abstract: e.target.value })} rows={3} placeholder="Add a concise description to refine the search." className="w-full px-4 py-3 text-base bg-card-white border border-mist rounded-2xl outline-none transition-all duration-150 focus:border-deep-indigo focus:shadow-[0_0_0_4px_rgba(33,33,86,0.16)] resize-vertical" />
            </div>

            {error && <div className="flex items-center gap-2 p-3 bg-danger/5 border border-danger/20 rounded-2xl text-danger text-sm"><AlertCircle className="w-4 h-4" />{error}</div>}

            <Button type="submit" loading={loading} size="lg" fullWidth icon={Search}>Run review</Button>
          </form>
        </Card>

        {results && !loading && (
          <div className="animate-fade-up">
            <h2 className="text-xl font-medium text-deep-ink mb-4">{results.totalResults} {results.totalResults === 1 ? 'match' : 'matches'} found</h2>

            {results.totalResults === 0 ? (
              <Card padding={32} className="text-center card-3d">
                <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                <h3 className="text-xl font-medium text-deep-ink mb-2">No strong overlap found</h3>
                <p className="text-slate">The repository does not contain a close match for this topic.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {results.results.map((r, i) => {
                  const pct = Math.round(r.score * 100);
                  const color = scoreColor(r.score);
                  const colors = { danger: 'text-danger bg-danger/5', warning: 'text-warning bg-warning/5', success: 'text-success bg-success/5' };
                  return (
                    <Link key={r.projectId} to={`/projects/${r.projectId}`} state={{ fromApp: true, from: '/similarity-check', fromLabel: 'Back to search' }} className="block animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                      <Card padding={20} hover className="card-3d">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium mb-2 ${colors[color]}`}>
                              {scoreLabel(r.score)}
                            </div>
                            <h4 className="text-base font-semibold text-deep-ink line-clamp-2">{r.title}</h4>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate">
                              <span className="flex items-center gap-1.5"><Building className="w-3 h-3" />{r.departmentName}</span>
                              <span className="flex items-center gap-1.5"><User className="w-3 h-3" />{r.authorName}</span>
                              <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{r.year}</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className={`text-3xl font-medium tabular-nums ${colors[color].split(' ')[0]}`}>{pct}%</div>
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
