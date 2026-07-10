import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { AlertCircle, ArrowRight } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="bg-card-white rounded-2xl shadow-lg border border-mist p-8">
          <h1 className="text-2xl font-light text-deep-ink tracking-tight mb-2">Create account</h1>
          <p className="text-sm text-slate mb-6">Join the repository</p>

          {error && <div className="mb-4 flex items-start gap-2 p-3 bg-danger/5 border border-danger/20 rounded-lg text-danger text-sm"><AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full name" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Ada Lovelace" required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@university.edu.ng" required />
            <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Minimum 8 characters" required hint="At least 8 characters" />

            <Button type="submit" loading={loading} fullWidth size="lg" icon={ArrowRight} iconPosition="right">Create account</Button>
          </form>

          <p className="text-center text-sm text-slate mt-6">Already have an account? <Link to="/login" className="font-semibold text-deep-indigo hover:underline">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
