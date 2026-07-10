import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { AlertCircle, ArrowRight, Check } from 'lucide-react';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(location.state?.from || '/dashboard', { replace: true });
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
          <h1 className="text-2xl font-light text-deep-ink tracking-tight mb-2">Welcome back</h1>
          <p className="text-sm text-slate mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 bg-danger/5 border border-danger/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@university.edu.ng" required />
            <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate">
                <input type="checkbox" className="w-4 h-4 rounded border-mist text-deep-indigo" />
                Remember me
              </label>
              <Link to="/reset-password" className="text-deep-indigo hover:underline">Forgot password?</Link>
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg" icon={ArrowRight} iconPosition="right">Sign in</Button>
          </form>

          <p className="text-center text-sm text-slate mt-6">
            Don't have an account? <Link to="/register" className="font-semibold text-deep-indigo hover:underline">Create one</Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-slate">
          <span className="flex items-center gap-1"><Check className="w-3 h-3 text-success" /> Secure</span>
          <span className="flex items-center gap-1"><Check className="w-3 h-3 text-success" /> Free</span>
        </div>
      </div>
    </div>
  );
}
