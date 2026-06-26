import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service.js';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Modal from '../../components/ui/Modal.jsx';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState(null);

  const fetchDepartments = () => {
    setLoading(true);
    adminService.stats().then(r => {
      // The /admin/stats returns departments, but for a list we need /departments/all
      // Let's use the existing department service
      return import('../../services/project.service.js').then(m => m.departmentService.listAll());
    })
      .then(r => setDepartments(r.data.departments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleCreate = async (data) => {
    try {
      await adminService.createDepartment(data);
      setShowModal(false);
      fetchDepartments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdate = async (data) => {
    try {
      await adminService.updateDepartment(editDept.id, data);
      setEditDept(null);
      fetchDepartments();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this department?')) return;
    try {
      await adminService.updateDepartment(id, { isActive: false });
      fetchDepartments();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-48) 0' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-32)' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 'var(--text-heading-lg)', fontWeight: 'var(--font-weight-light)', color: 'var(--color-deep-ink)', marginBottom: 'var(--spacing-8)' }}>
              Departments
            </h1>
            <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)' }}>
              Manage faculty departments
            </p>
          </div>
          <Button variant="primary" onClick={() => setShowModal(true)}>+ Add department</Button>
        </div>

        {loading ? (
          <Card style={{ textAlign: 'center', padding: 'var(--spacing-40) 0' }}>Loading...</Card>
        ) : departments.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: 'var(--spacing-40) 0' }}>
            <p style={{ color: 'var(--color-slate)', marginBottom: 'var(--spacing-16)' }}>No departments yet. Add your first department above.</p>
          </Card>
        ) : (
          <Card padding={0}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-mist)' }}>
                  {['Name', 'Code', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: 'var(--spacing-12) var(--card-padding)', textAlign: 'left', fontFamily: 'var(--font-suisseintlmono)', fontSize: '11px', color: 'var(--color-slate)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'var(--font-weight-regular)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {departments.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--color-mist)' }}>
                    <td style={{ padding: 'var(--spacing-16) var(--card-padding)', fontSize: 'var(--text-body-sm)', color: 'var(--color-deep-ink)' }}>{d.name}</td>
                    <td style={{ padding: 'var(--spacing-16) var(--card-padding)', fontSize: 'var(--text-body-sm)', color: 'var(--color-carbon)' }}>{d.code || '—'}</td>
                    <td style={{ padding: 'var(--spacing-16) var(--card-padding)' }}>
                      {d.is_active
                        ? <Badge variant="success">Active</Badge>
                        : <Badge variant="muted">Inactive</Badge>
                      }
                    </td>
                    <td style={{ padding: 'var(--spacing-16) var(--card-padding)', textAlign: 'right' }}>
                      <Button size="sm" variant="ghost" onClick={() => setEditDept(d)}>Edit</Button>
                      {d.is_active && (
                        <Button size="sm" variant="secondary" style={{ marginLeft: 8 }} onClick={() => handleDelete(d.id)}>Deactivate</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {showModal && (
        <DepartmentModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {editDept && (
        <DepartmentModal
          department={editDept}
          onClose={() => setEditDept(null)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}

function DepartmentModal({ department, onClose, onSubmit }) {
  const [name, setName] = useState(department?.name || '');
  const [code, setCode] = useState(department?.code || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, code: code || undefined });
  };

  return (
    <Modal isOpen onClose={onClose} title={department ? 'Edit department' : 'Add department'}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
        <Input
          label="Department name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Computer Science"
          required
        />
        <Input
          label="Code (optional)"
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="e.g. CS"
          hint="Short code for display"
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-12)' }}>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit">{department ? 'Save' : 'Create'}</Button>
        </div>
      </form>
    </Modal>
  );
}