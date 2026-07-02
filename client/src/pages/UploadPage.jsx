import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/project.service.js';
import { UploadCloud, CheckCircle2, X, Sparkles, Save, ChevronLeft, FileCheck } from 'lucide-react';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Badge from '../components/ui/Badge.jsx';

export default function UploadPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [step, setStep] = useState('upload');
  const [file, setFile] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [tempFileId, setTempFileId] = useState('');
  const [form, setForm] = useState({ title: '', abstract: '', authorName: '', departmentId: '', year: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = async (selected) => {
    if (!selected) return;
    setFile(selected);
    setError('');
    setLoading(true);
    const fd = new FormData();
    fd.append('file', selected);
    try {
      const res = await projectService.upload(fd);
      const data = res.data;
      setTempFileId(data.tempFileId);
      setDepartments(data.departments || []);
      setForm({
        title: data.fields.title || '',
        abstract: data.fields.abstract || '',
        authorName: data.fields.authorName || '',
        departmentId: data.suggestedDepartmentId || '',
        year: data.fields.year?.toString() || new Date().getFullYear().toString(),
      });
      setExtracted(data.fields);
      setStep('review');
    } catch (err) {
      setError(err.message);
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!form.title || !form.abstract || !form.authorName || !form.departmentId || !form.year) { setError('All fields required'); return; }
    setError('');
    setLoading(true);
    setStep('submitting');
    try {
      await projectService.confirmUpload({
        tempFileId,
        title: form.title,
        abstract: form.abstract,
        authorName: form.authorName,
        departmentId: form.departmentId,
        year: parseInt(form.year, 10),
        originalFileName: file?.name,
        mimeType: file?.type,
        fileSize: file?.size,
      });
      navigate('/dashboard');
    } catch (err) { setError(err.message); setStep('review'); }
    finally { setLoading(false); }
  };

  const reset = () => { setStep('upload'); setFile(null); setExtracted(null); setError(''); setForm({ title: '', abstract: '', authorName: '', departmentId: '', year: '' }); };
  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); const f = e.dataTransfer.files[0]; if (f) handleFileChange(f); };

  return (
    <div className="py-8 lg:py-12">
      <div className="container max-w-2xl">
        <div className="mb-8">
          <Badge className="inline-flex items-center gap-1.5 mb-3"><UploadCloud className="w-3.5 h-3.5" /> New upload</Badge>
          <h1 className="text-3xl lg:text-4xl font-light text-deep-ink tracking-tight">Upload a project</h1>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-3 mb-8">
          <Step n={1} label="Upload" active={step === 'upload'} done={step !== 'upload'} />
          <div className="flex-1 h-px bg-mist" />
          <Step n={2} label="Confirm" active={step === 'review'} done={step === 'submitting'} />
        </div>

        {error && <div className="mb-4 flex items-center gap-2 p-3 bg-danger/5 border border-danger/20 rounded-lg text-danger text-sm"><X className="w-4 h-4" />{error}</div>}

        {step === 'upload' && (
          <Card padding={32}>
            <input ref={fileRef} type="file" accept=".docx,.pdf" onChange={e => handleFileChange(e.target.files[0])} className="hidden" />
            <div onClick={() => fileRef.current.click()} onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${dragActive ? 'border-deep-indigo bg-pale-cyan/10' : 'border-mist hover:border-deep-indigo'}`}>
              {loading ? (
                <div className="w-12 h-12 border-2 border-deep-indigo border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              ) : (
                <UploadCloud className="w-12 h-12 text-deep-indigo mx-auto mb-4" />
              )}
              <p className="text-lg font-medium text-deep-ink mb-2">{dragActive ? 'Drop file here' : 'Click to upload'}</p>
              <p className="text-sm text-slate">DOCX or PDF</p>
            </div>
            <div className="mt-4 flex items-center gap-2 p-3 bg-pale-cyan/20 rounded-lg text-sm text-forest-teal">
              <Sparkles className="w-4 h-4" />
              We extract title, abstract, author automatically
            </div>
          </Card>
        )}

        {step === 'review' && (
          <Card padding={24}>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-mist">
              <div className="flex items-center gap-3">
                <FileCheck className="w-6 h-6 text-success" />
                <div><p className="text-sm font-medium">{file?.name}</p><p className="text-xs text-slate">{(file?.size / 1024 / 1024).toFixed(2)} MB</p></div>
              </div>
              <Button variant="ghost" size="sm" onClick={reset}>Change</Button>
            </div>

            <div className="space-y-4">
              <Input label="Title ★" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Project title" required />
              <div><label className="block text-sm font-medium mb-2">Abstract ★</label><textarea value={form.abstract} onChange={e => setForm({ ...form, abstract: e.target.value })} rows={5} className="w-full px-4 py-3 border border-mist rounded-lg resize-vertical" /></div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Author ★" value={form.authorName} onChange={e => setForm({ ...form, authorName: e.target.value })} placeholder="Name" required />
                <Select label="Department ★" value={form.departmentId} onChange={e => setForm({ ...form, departmentId: e.target.value })} options={departments.map(d => ({ value: d.id, label: d.name }))} placeholder="Select" required />
              </div>
              <Select label="Year ★" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} options={Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => ({ value: (new Date().getFullYear() - i).toString(), label: (new Date().getFullYear() - i).toString() }))} />
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-mist">
              <Button variant="ghost" onClick={reset} icon={ChevronLeft}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirm} loading={loading} icon={Save}>Save project</Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

function Step({ n, label, active, done }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${done ? 'bg-success text-white' : active ? 'bg-deep-indigo text-white scale-110' : 'bg-mist text-slate'}`}>
        {done ? <CheckCircle2 className="w-4 h-4" /> : n}
      </div>
      <span className={`text-sm hidden sm:block ${active ? 'font-medium text-deep-ink' : 'text-slate'}`}>{label}</span>
    </div>
  );
}
