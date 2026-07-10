import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../services/project.service.js';
import { ArrowLeft, Building, User, Calendar, Download } from 'lucide-react';
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

  if (loading) return <div className="py-32 text-center"><div className="w-8 h-8 border-2 border-mist border-t-deep-indigo rounded-full animate-spin mx-auto" /></div>;
  if (error) return <div className="py-32 text-center"><p className="text-slate mb-4">{error}</p><Link to="/similarity-check"><Button variant="ghost" icon={ArrowLeft}>Back to repository</Button></Link></div>;

  return (
    <div className="py-8 lg:py-12">
      <div className="container max-w-3xl">
        <Link to="/browse" className="inline-flex items-center gap-1.5 text-sm text-slate hover:text-deep-indigo mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to archive
        </Link>

        <Card padding={32} className="animate-fade-up card-3d">
          <div className="flex flex-wrap items-center gap-2 mb-5">
            <Badge>{project.department_name}</Badge>
            <Badge variant="muted">{project.year}</Badge>
          </div>

          <h1 className="text-3xl lg:text-4xl font-medium text-deep-ink tracking-tight mb-6 leading-tight">{project.title}</h1>

          <div className="grid gap-3 sm:grid-cols-3 p-4 bg-white/65 rounded-2xl border border-white/70 mb-7 shadow-[0_14px_28px_-24px_rgba(17,26,74,0.35)]">
            <span className="flex items-center gap-2 text-sm text-slate"><User className="w-4 h-4 text-forest-teal" />{project.author_name}</span>
            <span className="flex items-center gap-2 text-sm text-slate"><Building className="w-4 h-4 text-deep-indigo" />{project.department_name}</span>
            <span className="flex items-center gap-2 text-sm text-slate"><Calendar className="w-4 h-4 text-warning" />{project.year}</span>
          </div>

          <div className="border-t border-mist/80 pt-6">
            <h2 className="text-base font-semibold uppercase tracking-[0.16em] text-deep-ink mb-4">Abstract</h2>
            <p className="text-carbon leading-8 whitespace-pre-wrap text-[15px]">{project.abstract}</p>
          </div>

          {project.file_name && (
            <div className="mt-6 border-t border-mist/80 pt-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-deep-ink">Document available</p>
                <p className="text-xs text-slate">Download the submitted file for offline review.</p>
              </div>
              <a href={projectService.downloadUrl(project.id)}>
                <Button variant="ghost" icon={Download}>Download document</Button>
              </a>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
