import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { projectService } from '../services/project.service.js';
import { ArrowLeft, Building, User, Calendar } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fallbackBack = location.state?.from || (isAdmin ? '/admin/projects' : isAuthenticated ? '/dashboard' : '/similarity-check');
  const backLabel = location.state?.fromLabel || (isAdmin ? 'Back to admin projects' : isAuthenticated ? 'Back to dashboard' : 'Back to search');
  const canGoBack = location.state?.fromApp === true;

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1);
      return;
    }
    navigate(fallbackBack);
  };

  useEffect(() => {
    projectService.get(id)
      .then(r => setProject(r.data.project))
      .catch(() => setError('Project not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-32 text-center"><div className="w-8 h-8 border-2 border-mist border-t-deep-indigo rounded-full animate-spin mx-auto" /></div>;
  if (error) return <div className="py-32 text-center"><p className="text-slate mb-4">{error}</p><Button variant="ghost" icon={ArrowLeft} onClick={handleBack}>{backLabel}</Button></div>;

  return (
    <div className="py-8 lg:py-12">
      <div className="container max-w-3xl">
        <button type="button" onClick={handleBack} className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-deep-indigo mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {backLabel}
        </button>

        <Card padding={32} className="animate-fade-up card-3d">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <Badge>{project.department_name}</Badge>
            <Badge variant="muted">{project.year}</Badge>
          </div>

          <h1 className="text-3xl lg:text-4xl font-medium text-deep-ink tracking-tight mb-6 leading-tight">{project.title}</h1>

          <div className="grid gap-3 sm:grid-cols-3 p-4 bg-pale-cyan rounded-2xl border border-mist mb-7 shadow-[0_14px_28px_-24px_rgba(0,0,0,0.70)]">
            <span className="flex items-center gap-2 text-sm text-slate"><User className="w-4 h-4 text-forest-teal" />{project.author_name}</span>
            <span className="flex items-center gap-2 text-sm text-slate"><Building className="w-4 h-4 text-deep-indigo" />{project.department_name}</span>
            <span className="flex items-center gap-2 text-sm text-slate"><Calendar className="w-4 h-4 text-warning" />{project.year}</span>
          </div>

          <div className="border-t border-mist/80 pt-6">
            <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-deep-ink mb-4">Abstract</h2>
            <p className="text-carbon leading-8 whitespace-pre-wrap text-[15px]">{project.abstract}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
