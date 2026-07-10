import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service.js';
import { departmentService } from '../../services/project.service.js';
import { Building2, Plus, Edit3, PowerOff } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import Modal from '../../components/ui/Modal.jsx';
import AdminNav from '../../components/admin/AdminNav.jsx';
import AdminNotice from '../../components/admin/AdminNotice.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editDept, setEditDept] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const fetchDepartments = () => {
    setLoading(true);
    setError('');
    adminService.stats().then(() => departmentService.listAll())
      .then(r => setDepartments(r.data.departments || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleCreate = async (data) => {
    await adminService.createDepartment(data);
    setShowModal(false);
    fetchDepartments();
  };

  const handleUpdate = async (data) => {
    await adminService.updateDepartment(editDept.id, data);
    setEditDept(null);
    fetchDepartments();
  };

  const handleDeactivate = async () => {
    if (!deactivateTarget) return;
    setDeactivating(true);
    setError('');
    try {
      await adminService.updateDepartment(deactivateTarget.id, { isActive: false });
      setDeactivateTarget(null);
      fetchDepartments();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="py-8 lg:py-12">
      <div className="container max-w-5xl">
        <div className="flex justify-between items-end mb-8">
          <div>
            <Badge className="inline-flex items-center gap-1.5 mb-3"><Building2 className="w-3.5 h-3.5" /> Departments</Badge>
            <h1 className="text-3xl lg:text-4xl font-light text-deep-ink tracking-tight">Departments</h1>
          </div>
          <Button variant="primary" icon={Plus} onClick={() => setShowModal(true)}>Add</Button>
        </div>

        <AdminNav />
        <AdminNotice>{error}</AdminNotice>

        {loading ? <Card padding={20}><p className="text-center text-slate">Loading...</p></Card> :
         departments.length === 0 ? <Card padding={32}><div className="text-center"><Building2 className="w-10 h-10 text-fog mx-auto mb-3" /><p className="text-slate">No departments yet</p></div></Card> :
         <Card padding={0}>
           <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-mist bg-paper-white/50">
                {['Name', 'Code', 'Status', ''].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-mono text-slate uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {departments.map(d => (
                  <tr key={d.id} className="border-b border-mist last:border-0 hover:bg-paper-white/30">
                    <td className="px-4 py-3"><span className="text-sm font-medium text-deep-ink">{d.name}</span></td>
                    <td className="px-4 py-3"><span className="text-sm text-slate">{d.code || '—'}</span></td>
                    <td className="px-4 py-3"><span className={`text-xs ${d.is_active ? 'text-success' : 'text-slate'}`}>{d.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" icon={Edit3} onClick={() => setEditDept(d)}>Edit</Button>
                        {d.is_active && <Button variant="ghost" size="sm" icon={PowerOff} onClick={() => setDeactivateTarget(d)} className="text-danger">Off</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>}
      </div>

      {showModal && <DepartmentModal onClose={() => setShowModal(false)} onSubmit={handleCreate} />}
      {editDept && <DepartmentModal department={editDept} onClose={() => setEditDept(null)} onSubmit={handleUpdate} />}
      <ConfirmDialog
        isOpen={!!deactivateTarget}
        title="Deactivate department"
        message={`Students and admins will no longer be able to select "${deactivateTarget?.name || 'this department'}" for new active records.`}
        confirmLabel="Deactivate"
        loading={deactivating}
        onCancel={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}

function DepartmentModal({ department, onClose, onSubmit }) {
  const [name, setName] = useState(department?.name || '');
  const [code, setCode] = useState(department?.code || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSubmit({ name, code: code || undefined });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={department ? 'Edit department' : 'Add department'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <AdminNotice>{error}</AdminNotice>
        <Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Computer Science" required />
        <Input label="Code (optional)" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. CS" />
        <div className="flex justify-end gap-2 pt-4 border-t border-mist"><Button variant="ghost" type="button" onClick={onClose} disabled={saving}>Cancel</Button><Button variant="primary" type="submit" loading={saving}>{department ? 'Save' : 'Create'}</Button></div>
      </form>
    </Modal>
  );
}
