import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service.js';
import { FileText, Trash2, ExternalLink } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const debouncedQuery = useDebounce(query, 350);

  const fetchProjects = (page = 1) => {
    setLoading(true);
    adminService.projects({ page, limit: 20, q: debouncedQuery || undefined }).then(r => {
      setProjects(r.data.projects);
      setPagination({ total: r.data.total, page: r.data.page, totalPages: r.data.totalPages });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(1); }, [debouncedQuery]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this project?')) return;
    try { await adminService.deleteProject(id); fetchProjects(pagination.page); }
    catch (err) { alert(err.message); }
  };

  return (
    <div className="py-8 lg:py-12">
      <div className="container max-w-5xl">
        <div className="mb-8">
          <Badge className="inline-flex items-center gap-1.5 mb-3"><FileText className="w-3.5 h-3.5" /> Projects</Badge>
          <h1 className="text-3xl lg:text-4xl font-light text-deep-ink tracking-tight">{pagination.total} projects</h1>
        </div>

        <div className="mb-6">
          <SearchInput value={query} onChange={e => setQuery(e.target.value)} placeholder="Search projects..." />
        </div>

        <Card padding={0}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-mist bg-paper-white/50">
                {['Title', 'Author', 'Department', 'Year', 'Status', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-mono text-slate uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate">Loading...</td></tr> :
                 projects.map(p => (
                  <tr key={p.id} className="border-b border-mist last:border-0 hover:bg-paper-white/30">
                    <td className="px-4 py-3 max-w-xs">
                      <Link to={`/projects/${p.id}`} className="text-sm font-medium text-deep-ink hover:text-deep-indigo flex items-center gap-1">
                        <span className="line-clamp-1">{p.title}</span><ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </Link>
                    </td>
                    <td className="px-4 py-3"><span className="text-sm text-slate">{p.author_name}</span></td>
                    <td className="px-4 py-3"><Badge variant="muted">{p.department_name}</Badge></td>
                    <td className="px-4 py-3"><span className="text-sm text-slate">{p.year}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs ${p.is_deleted ? 'text-danger' : 'text-success'}`}>{p.is_deleted ? 'Deleted' : 'Active'}</span></td>
                    <td className="px-4 py-3 text-right">{!p.is_deleted && <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDelete(p.id)} className="text-danger">Delete</Button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={fetchProjects} />
      </div>
    </div>
  );
}
