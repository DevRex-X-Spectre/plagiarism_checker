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
          <Badge className="inline-flex items-center gap-1.5 mb-3"><Library className="w-3.5 h-3.5" /> Project Repository</Badge>
          <h1 className="text-3xl lg:text-4xl font-light text-deep-ink tracking-tight mb-2">Browse archive</h1>
          <p className="text-slate">{pagination.total.toLocaleString()} projects</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <SearchInput value={q} onChange={e => updateParam('q', e.target.value)} placeholder="Search by title..." size="lg" />
          <div className="flex flex-wrap gap-3">
            <Select value={department} onChange={e => updateParam('department', e.target.value)} options={departments.map(d => ({ value: d.id, label: d.name }))} placeholder="All departments" className="w-48" />
            <Select value={year} onChange={e => updateParam('year', e.target.value)} options={years.map(y => ({ value: y, label: y.toString() }))} placeholder="All years" className="w-32" />
            {hasFilters && <Button variant="ghost" onClick={() => setParams({})} icon={X}>Clear</Button>}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <Card key={i} padding={20}><div className="h-16 loading-skeleton rounded" /></Card>)}
          </div>
        ) : projects.length === 0 ? (
          <Card><EmptyState icon="search" title="No projects found" actionLabel="Clear filters" actionIcon={X} action={() => setParams({})} /></Card>
        ) : (
          <div className="space-y-4">
            {projects.map((p, i) => (
              <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${i * 30}ms` }}>
                <Link to={`/projects/${p.id}`} className="block group">
                  <Card padding={20} hover>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-pale-cyan/30 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-forest-teal" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-base font-medium text-deep-ink group-hover:text-deep-indigo transition-colors line-clamp-2">{p.title}</h3>
                          <p className="text-sm text-slate line-clamp-2 mt-1">{p.abstract}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-slate">
                            <span className="flex items-center gap-1"><Building className="w-3 h-3" />{p.department_name}</span>
                            <span className="flex items-center gap-1"><User className="w-3 h-3" />{p.author_name}</span>
                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{p.year}</span>
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
