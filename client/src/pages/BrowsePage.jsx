import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { projectService } from '../services/project.service.js';
import { departmentService } from '../services/project.service.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { Search, Library, FileText, Building, User, Calendar, ArrowRight, X } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import Badge from '../components/ui/Badge.jsx';
import Select from '../components/ui/Select.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import SearchInput from '../components/ui/SearchInput.jsx';
import Pagination from '../components/ui/Pagination.jsx';

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
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  const years = Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => new Date().getFullYear() - i);
  const hasFilters = q || department || year;

  return (
    <div className="py-8 lg:py-12">
      <div className="container max-w-5xl">
        <div className="mb-8">
          <Badge className="inline-flex items-center gap-1.5 mb-3"><Library className="w-3.5 h-3.5" /> Project repository</Badge>
          <h1 className="text-3xl lg:text-4xl font-medium text-deep-ink tracking-tight mb-2">Browse the archive</h1>
          <p className="text-slate">{pagination.total.toLocaleString()} projects cataloged and ready to explore.</p>
        </div>

        <Card padding={20} className="mb-8 card-3d">
          <div className="space-y-4">
            <SearchInput value={q} onChange={e => updateParam('q', e.target.value)} placeholder="Search by title, author, or abstract..." size="lg" />
            <div className="flex flex-wrap gap-3">
              <Select value={department} onChange={e => updateParam('department', e.target.value)} options={departments.map(d => ({ value: d.id, label: d.name }))} placeholder="All departments" className="w-52" />
              <Select value={year} onChange={e => updateParam('year', e.target.value)} options={years.map(y => ({ value: y, label: y.toString() }))} placeholder="All years" className="w-36" />
              {hasFilters && <Button variant="ghost" onClick={() => setParams({})} icon={X}>Clear filters</Button>}
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <Card key={i} padding={20} className="card-3d"><div className="h-16 loading-skeleton rounded-xl" /></Card>)}
          </div>
        ) : projects.length === 0 ? (
          <Card className="card-3d"><EmptyState icon="search" title="No projects found" description="Try adjusting your filters or clear them to see the full archive." actionLabel="Clear filters" actionIcon={X} action={() => setParams({})} /></Card>
        ) : (
          <div className="space-y-4">
            {projects.map((p, i) => (
              <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <Link to={`/projects/${p.id}`} className="block group">
                  <Card padding={20} hover className="card-3d">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-deep-indigo/6 text-deep-indigo shadow-[0_12px_22px_-18px_rgba(17,26,74,0.45)]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-deep-ink group-hover:text-deep-indigo transition-colors line-clamp-2">{p.title}</h3>
                          <p className="text-sm text-slate line-clamp-2 mt-1.5 leading-6">{p.abstract}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-slate">
                            <span className="flex items-center gap-1.5"><Building className="w-3 h-3" />{p.department_name}</span>
                            <span className="flex items-center gap-1.5"><User className="w-3 h-3" />{p.author_name}</span>
                            <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{p.year}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-fog group-hover:text-deep-indigo group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" />
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        )}
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={(nextPage) => updateParam('page', String(nextPage))} />
      </div>
    </div>
  );
}
