import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/project.service.js';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';

export default function UploadPage() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [step, setStep] = useState('upload'); // 'upload' | 'review' | 'submitting'
  const [file, setFile] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [tempFileId, setTempFileId] = useState('');
  const [form, setForm] = useState({ title: '', abstract: '', authorName: '', departmentId: '', year: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
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
    if (!form.title || !form.abstract || !form.authorName || !form.departmentId || !form.year) {
      setError('All fields are required');
      return;
    }
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
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setStep('review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 'var(--spacing-48) 0' }}>
      <div className="container" style={{ maxWidth: 680 }}>
        <h1 style={{
          fontFamily: 'var(--font-suisseintl)',
          fontSize: 'var(--text-heading-lg)',
          fontWeight: 'var(--font-weight-light)',
          color: 'var(--color-deep-ink)',
          marginBottom: 'var(--spacing-8)',
        }}>
          Upload a project
        </h1>
        <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)', marginBottom: 'var(--spacing-40)' }}>
          Upload a DOCX or PDF file. We'll extract the details automatically.
        </p>

        {error && (
          <div style={{
            padding: 'var(--spacing-12) var(--spacing-16)',
            background: '#fee2e2',
            borderRadius: 'var(--radius-lg)',
            color: '#991b1b',
            fontSize: 'var(--text-body-sm)',
            marginBottom: 'var(--spacing-24)',
          }}>
            {error}
          </div>
        )}

        {step === 'upload' && (
          <Card>
            <input
              ref={fileRef}
              type="file"
              accept=".docx,.pdf"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div
              onClick={() => fileRef.current.click()}
              style={{
                border: '2px dashed var(--color-mist)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-64) var(--spacing-48)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'border-color 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-deep-indigo)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-mist)'}
            >
              {loading ? (
                <>
                  <div style={{
                    width: 40,
                    height: 40,
                    border: '2px solid var(--color-mist)',
                    borderTopColor: 'var(--color-deep-indigo)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto var(--spacing-16)',
                  }} />
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                  <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)' }}>
                    Extracting content...
                  </p>
                </>
              ) : (
                <>
                  <div style={{
                    fontSize: 40,
                    marginBottom: 'var(--spacing-16)',
                    color: 'var(--color-fog)',
                  }}>
                    📄
                  </div>
                  <p style={{
                    fontSize: 'var(--text-body-lg)',
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-deep-ink)',
                    marginBottom: 'var(--spacing-8)',
                  }}>
                    Click to upload or drag a file here
                  </p>
                  <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-slate)' }}>
                    DOCX or PDF · Maximum 20MB
                  </p>
                </>
              )}
            </div>
          </Card>
        )}

        {step === 'review' && (
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-24)' }}>
              <div>
                <Badge style={{ marginBottom: 'var(--spacing-8)' }}>Review extracted data</Badge>
                <p style={{ fontSize: 'var(--text-body-sm)', color: 'var(--color-slate)' }}>
                  File: <strong>{file?.name}</strong>
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setStep('upload'); setFile(null); setExtracted(null); }}>
                Upload different file
              </Button>
            </div>

            {extracted && (
              <div style={{
                padding: 'var(--spacing-12) var(--spacing-16)',
                background: 'var(--color-pale-cyan)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: 'var(--spacing-24)',
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-forest-teal)',
              }}>
                Fields marked with ★ were automatically extracted. Please review and correct if needed.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
              <Input
                label="Project title"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Design and Implementation of an AI-based Attendance System"
                required
              />
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-body-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-carbon)',
                  marginBottom: 'var(--spacing-8)',
                }}>
                  Abstract
                </label>
                <textarea
                  value={form.abstract}
                  onChange={e => setForm({ ...form, abstract: e.target.value })}
                  placeholder="Paste or type the abstract..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: 'var(--text-body)',
                    fontFamily: 'var(--font-suisseintl)',
                    color: 'var(--color-deep-ink)',
                    background: 'var(--surface-card)',
                    border: '1px solid var(--color-mist)',
                    borderRadius: 'var(--radius-inputs)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
              <Input
                label="Author name"
                value={form.authorName}
                onChange={e => setForm({ ...form, authorName: e.target.value })}
                placeholder="e.g. John Adebayo"
                required
              />
              <Select
                label="Department"
                value={form.departmentId}
                onChange={e => setForm({ ...form, departmentId: e.target.value })}
                options={departments.map(d => ({ value: d.id, label: d.name }))}
                placeholder="Select department"
                required
              />
              <Select
                label="Year"
                value={form.year}
                onChange={e => setForm({ ...form, year: e.target.value })}
                options={Array.from({ length: new Date().getFullYear() - 1999 }, (_, i) => ({
                  value: (new Date().getFullYear() - i).toString(),
                  label: (new Date().getFullYear() - i).toString(),
                }))}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--spacing-12)', marginTop: 'var(--spacing-32)' }}>
              <Button variant="ghost" onClick={() => { setStep('upload'); setFile(null); }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirm} loading={loading}>
                Save project →
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
