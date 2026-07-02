import { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service.js';
import { Building2, Plus, Edit3, PowerOff } from 'lucide-react';
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
    adminService.stats().then(() => import('../../services/project.service.js').then(m => m.departmentService.listAll()))
      .then(r => setDepartments(r.data.departments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDepartments(); }, []);

  const handleCreate = async (data) => {
    try { await adminService.createDepartment(data); setShowModal(false); fetchDepartments(); }
    catch (err) { alert(err.message); }
  };

  const handleUpdate = async (data) => {
    try { await adminService.updateDepartment(editDept.id, data); setEditDept(null); fetchDepartments(); }
    catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this department?')) return;
    try { await adminService.updateDepartment(id, { isActive: false }); fetchDepartments(); }
    catch (err) { alert(err.message); }
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
                        {d.is_active && <Button variant="ghost" size="sm" icon={PowerOff} onClick={() => handleDelete(d.id)} className="text-danger">Off</Button>}
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
    </div>
  );
}

function DepartmentModal({ department, onClose, onSubmit }) {
  const [name, setName] = useState(department?.name || '');
  const [code, setCode] = useState(department?.code || '');
  const handleSubmit = (e) => { e.preventDefault(); onSubmit({ name, code: code || undefined }); };

  return (
    <Modal isOpen onClose={onClose} title={department ? 'Edit department' : 'Add department'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Computer Science" required />
        <Input label="Code (optional)" value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. CS" />
        <div className="flex justify-end gap-2 pt-4 border-t border-mist"><Button variant="ghost" type="button" onClick={onClose}>Cancel</Button><Button variant="primary" type="submit">{department ? 'Save' : 'Create'}</Button></div>
      </form>
    </Modal>
  );
}