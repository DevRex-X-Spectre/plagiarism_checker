import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { projectService } from '../services/project.service.js';
import { similarityService } from '../services/project.service.js';
import { Search, Upload, Library, FileText, History, ArrowRight } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myProjects, setMyProjects] = useState([]);
  const [checkHistory, setCheckHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([projectService.getMine(), similarityService.history()])
      .then(([p, h]) => {
        setMyProjects(p.data.projects || []);
        setCheckHistory(h.data.checks || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.fullName?.split(' ')[0] || 'there';
  const role = user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1);

  return (
    <div className="py-8 lg:py-12">
      <div className="container max-w-5xl">
        <div className="mb-10 animate-fade-up">
          <Badge className="inline-flex items-center gap-1.5 mb-3">Dashboard</Badge>
          <h1 className="text-3xl lg:text-4xl font-medium text-deep-ink tracking-tight">
            Good to see you, {firstName}
          </h1>
          <p className="text-slate">{role} · {user?.email}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <ActionCard icon={Search} title="Check similarity" href="/similarity-check" delay={100} />
          <ActionCard icon={Upload} title="Upload project" href="/upload" delay={200} />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="animate-fade-up delay-200">
            <h2 className="text-lg font-semibold text-deep-ink mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate" /> My uploads ({myProjects.length})
            </h2>
            {loading ? (
              <Card className="card-3d"><p className="text-center py-8 text-slate">Loading your projects...</p></Card>
            ) : myProjects.length === 0 ? (
              <Card className="card-3d">
                <EmptyState icon="upload" title="No projects yet" description="Upload your first project to start building your archive." actionLabel="Upload now" actionIcon={Upload} action={() => navigate('/upload')} />
              </Card>
            ) : (
              <div className="space-y-3">
                {myProjects.slice(0, 5).map((p, i) => (
                  <Link key={p.id} to={`/projects/${p.id}`} state={{ fromApp: true, from: '/dashboard', fromLabel: 'Back to dashboard' }} className="block animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <Card padding={16} hover className="card-3d">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-deep-ink line-clamp-2">{p.title}</p>
                          <p className="text-xs text-slate mt-1">{p.department_name} · {p.year}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-fog flex-shrink-0" />
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="animate-fade-up delay-300">
            <h2 className="text-lg font-semibold text-deep-ink mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-slate" /> Recent checks ({checkHistory.length})
            </h2>
            {loading ? (
              <Card className="card-3d"><p className="text-center py-8 text-slate">Loading your history...</p></Card>
            ) : checkHistory.length === 0 ? (
              <Card className="card-3d">
                <EmptyState icon="search" title="No checks yet" description="Run your first similarity review to see results here." actionLabel="Check now" actionIcon={Search} action={() => navigate('/similarity-check')} />
              </Card>
            ) : (
              <div className="space-y-3">
                {checkHistory.slice(0, 5).map((c, i) => (
                  <Link key={c.id} to={`/similarity/${c.id}`} className="block animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                    <Card padding={16} hover className="card-3d">
                      <p className="text-sm font-semibold text-deep-ink line-clamp-2 mb-2">"{c.query_text}"</p>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-slate">{new Date(c.created_at).toLocaleDateString()}</span>
                        <Badge className="text-[10px]">{c.result_count} results</Badge>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, href, delay }) {
  return (
    <Link to={href} className="block animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <Card padding={20} hover className="group card-3d">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-deep-indigo/6 text-forest-teal shadow-[0_12px_22px_-18px_rgba(17,26,74,0.45)]">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-deep-ink">{title}</h3>
          </div>
          <ArrowRight className="w-4 h-4 text-fog group-hover:text-deep-indigo group-hover:translate-x-1 transition-all" />
        </div>
      </Card>
    </Link>
  );
}
