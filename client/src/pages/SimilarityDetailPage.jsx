import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { similarityService } from '../services/project.service.js';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';

export default function SimilarityDetailPage() {
  const { id } = useParams();
  const [check, setCheck] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    similarityService.get(id)
      .then(r => setCheck(r.data.check))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const results = Array.isArray(check?.results) ? check.results : JSON.parse(check?.results || '[]');

  if (loading) return <div className="py-24 text-center text-slate">Loading...</div>;
  if (error) return <div className="py-24 text-center text-slate">{error}</div>;

  return (
    <div className="py-8 lg:py-12">
      <div className="container max-w-4xl">
        <Link to="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm text-slate hover:text-deep-ink">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>

        <div className="mb-6">
          <Badge className="inline-flex items-center gap-1.5 mb-3"><Search className="h-3.5 w-3.5" /> Similarity</Badge>
          <h1 className="text-2xl font-light tracking-tight text-deep-ink sm:text-3xl">{check.query_text}</h1>
          <p className="mt-2 text-sm text-slate">{results.length} results · {Math.round(Number(check.threshold) * 100)}% threshold</p>
        </div>

        <div className="grid gap-3">
          {results.length === 0 ? (
            <Card><p className="text-slate">No matches were found.</p></Card>
          ) : results.map(result => (
            <Link key={result.projectId} to={`/projects/${result.projectId}`}>
              <Card padding={18} hover>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="line-clamp-2 text-base font-semibold text-deep-ink">{result.title}</h2>
                    <p className="mt-1 text-sm text-slate">{result.departmentName} · {result.authorName} · {result.year}</p>
                  </div>
                  <span className="text-2xl font-light text-deep-indigo">{Math.round(result.score * 100)}%</span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <Link to="/similarity-check"><Button variant="ghost">Run another check</Button></Link>
        </div>
      </div>
    </div>
  );
}
