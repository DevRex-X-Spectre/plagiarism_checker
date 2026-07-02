import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service.js';
import { Users, Edit3 } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Select from '../../components/ui/Select.jsx';
import Modal from '../../components/ui/Modal.jsx';
import SearchInput from '../../components/ui/SearchInput.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { useDebounce } from '../../hooks/useDebounce.js';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
  const [filters, setFilters] = useState({ search: '', role: '' });
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);
  const debouncedSearch = useDebounce(filters.search, 350);

  const fetchUsers = (page = 1) => {
    setLoading(true);
    const params = { page };
    if (filters.search) params.search = filters.search;
    if (filters.role) params.role = filters.role;
    adminService.users(params).then(r => {
      setUsers(r.data.users);
      setPagination({ total: r.data.total, page: r.data.page, totalPages: r.data.totalPages });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(1); }, [filters.role, debouncedSearch]);

  const handleUpdate = async (updates) => {
    try {
      await adminService.updateUser(editModal.id, updates);
      setEditModal(null);
      fetchUsers(pagination.page);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="py-8 lg:py-12">
      <div className="container max-w-5xl">
        <div className="mb-8">
          <Badge className="inline-flex items-center gap-1.5 mb-3"><Users className="w-3.5 h-3.5" /> Users</Badge>
          <h1 className="text-3xl lg:text-4xl font-light text-deep-ink tracking-tight">{pagination.total} users</h1>
        </div>

        <div className="flex gap-3 mb-6">
          <SearchInput value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} placeholder="Search..." className="flex-1" />
          <Select value={filters.role} onChange={e => setFilters({ ...filters, role: e.target.value })} options={[{ value: 'student', label: 'Student' }, { value: 'admin', label: 'Admin' }]} placeholder="All roles" className="w-40" />
        </div>

        <Card padding={0}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-mist bg-paper-white/50">
                {['User', 'Email', 'Role', 'Status', 'Joined', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-mono text-slate uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate">Loading...</td></tr> :
                 users.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate">No users found</td></tr> :
                 users.map(u => (
                  <tr key={u.id} className="border-b border-mist last:border-0 hover:bg-paper-white/30">
                    <td className="px-4 py-3"><span className="text-sm font-medium text-deep-ink">{u.full_name}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-slate">{u.email}</span></td>
                    <td className="px-4 py-3"><Badge>{u.role}</Badge></td>
                    <td className="px-4 py-3"><span className={`text-xs ${u.is_active ? 'text-success' : 'text-slate'}`}>{u.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-slate">{new Date(u.created_at).toLocaleDateString()}</span></td>
                    <td className="px-4 py-3 text-right"><Button variant="ghost" size="sm" icon={Edit3} onClick={() => setEditModal(u)}>Edit</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Pagination page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onPageChange={fetchUsers} />

        {editModal && <EditUserModal user={editModal} onClose={() => setEditModal(null)} onUpdate={handleUpdate} />}
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onUpdate }) {
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.is_active);

  return (
    <Modal isOpen onClose={onClose} title={`Edit ${user.full_name}`}>
      <div className="space-y-4">
        <Select label="Role" value={role} onChange={e => setRole(e.target.value)} options={[{ value: 'student', label: 'Student' }, { value: 'admin', label: 'Admin' }]} />
        <Select label="Status" value={isActive.toString()} onChange={e => setIsActive(e.target.value === 'true')} options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]} />
        <div className="flex justify-end gap-2 pt-4 border-t border-mist"><Button variant="ghost" onClick={onClose}>Cancel</Button><Button variant="primary" onClick={() => onUpdate({ role, isActive })}>Save</Button></div>
      </div>
    </Modal>
  );
}
