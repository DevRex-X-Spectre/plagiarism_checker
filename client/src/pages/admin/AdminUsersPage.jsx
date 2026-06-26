import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Modal from '../../components/ui/Modal.jsx';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 0 });
  const [filters, setFilters] = useState({ search: '', role: '', isActive: '' });
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);

  const fetchUsers = (page = 1) => {
    setLoading(true);
    const params = { page };
    if (filters.search) params.search = filters.search;
    if (filters.role) params.role = filters.role;
    if (filters.isActive !== '') params.isActive = filters.isActive;

    adminService.users(params)
      .then(r => {
        setUsers(r.data.users);
        setPagination({ total: r.data.total, page: r.data.page, totalPages: r.data.totalPages });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [filters.role, filters.isActive]);

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
    <div style={{ padding: 'var(--spacing-48) 0' }}>
      <div className="container">
        <h1 style={{
          fontFamily: 'var(--font-suisseintl)',
          fontSize: 'var(--text-heading-lg)',
          fontWeight: 'var(--font-weight-light)',
          color: 'var(--color-deep-ink)',
          marginBottom: 'var(--spacing-8)',
        }}>
          Users
        </h1>
        <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)', marginBottom: 'var(--spacing-32)' }}>
          {pagination.total} registered users
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 'var(--spacing-16)', marginBottom: 'var(--spacing-32)', alignItems: 'end' }}>
          <Input
            placeholder="Search by email or name..."
            value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && fetchUsers(1)}
          />
          <Select
            value={filters.role}
            onChange={e => setFilters({ ...filters, role: e.target.value })}
            options={[
              { value: 'student', label: 'Student' },
              { value: 'lecturer', label: 'Lecturer' },
              { value: 'admin', label: 'Admin' },
            ]}
            placeholder="All roles"
            style={{ minWidth: 140 }}
          />
          <Select
            value={filters.isActive}
            onChange={e => setFilters({ ...filters, isActive: e.target.value })}
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
            placeholder="All status"
            style={{ minWidth: 140 }}
          />
        </div>

        <Card padding={0}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-mist)' }}>
                {['Name', 'Email', 'Role', 'Status', 'Joined', ''].map(h => (
                  <th key={h} style={{
                    padding: 'var(--spacing-12) var(--card-padding)',
                    textAlign: 'left',
                    fontFamily: 'var(--font-suisseintlmono)',
                    fontSize: '11px',
                    color: 'var(--color-slate)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    fontWeight: 'var(--font-weight-regular)',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: 'var(--spacing-24)', textAlign: 'center', color: 'var(--color-slate)' }}>Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 'var(--spacing-24)', textAlign: 'center', color: 'var(--color-slate)' }}>No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--color-mist)' }}>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)', fontSize: 'var(--text-body-sm)', color: 'var(--color-deep-ink)' }}>{u.full_name}</td>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)', fontSize: 'var(--text-body-sm)', color: 'var(--color-carbon)' }}>{u.email}</td>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)' }}>
                    <Badge>{u.role}</Badge>
                  </td>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)' }}>
                    {u.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="danger">Inactive</Badge>}
                  </td>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)', fontSize: 'var(--text-body-sm)', color: 'var(--color-slate)' }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: 'var(--spacing-16) var(--card-padding)', textAlign: 'right' }}>
                    <Button size="sm" variant="ghost" onClick={() => setEditModal(u)}>
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {editModal && (
          <EditUserModal
            user={editModal}
            onClose={() => setEditModal(null)}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
}

function EditUserModal({ user, onClose, onUpdate }) {
  const [role, setRole] = useState(user.role);
  const [isActive, setIsActive] = useState(user.is_active);

  return (
    <Modal isOpen onClose={onClose} title={`Edit ${user.full_name}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
        <Select
          label="Role"
          value={role}
          onChange={e => setRole(e.target.value)}
          options={[
            { value: 'student', label: 'Student' },
            { value: 'lecturer', label: 'Lecturer' },
            { value: 'admin', label: 'Admin' },
          ]}
        />
        <Select
          label="Status"
          value={isActive.toString()}
          onChange={e => setIsActive(e.target.value === 'true')}
          options={[
            { value: 'true', label: 'Active' },
            { value: 'false', label: 'Inactive' },
          ]}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-12)' }}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onUpdate({ role, isActive })}>Save</Button>
        </div>
      </div>
    </Modal>
  );
}