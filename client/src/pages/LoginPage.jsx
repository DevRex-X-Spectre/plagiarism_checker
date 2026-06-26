import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Card from '../components/ui/Card.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 200px)',
      padding: 'var(--spacing-48) var(--spacing-24)',
    }}>
      <Card style={{ width: '100%', maxWidth: 440 }} shadow="subtle">
        <h1 style={{
          fontFamily: 'var(--font-suisseintl)',
          fontSize: 'var(--text-heading)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-deep-ink)',
          marginBottom: 'var(--spacing-8)',
        }}>
          Welcome back
        </h1>
        <p style={{
          fontSize: 'var(--text-body)',
          color: 'var(--color-slate)',
          marginBottom: 'var(--spacing-32)',
        }}>
          Sign in to access your archive
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="you@university.edu.ng"
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required
          />

          <div style={{ textAlign: 'right' }}>
            <Link to="/reset-password" style={{
              fontSize: 'var(--text-body-sm)',
              color: 'var(--color-slate)',
            }}>
              Forgot password?
            </Link>
          </div>

          <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 'var(--spacing-8)' }}>
            Sign in
          </Button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: 'var(--spacing-32)',
          fontSize: 'var(--text-body-sm)',
          color: 'var(--color-slate)',
        }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--color-deep-indigo)', fontWeight: 'var(--font-weight-medium)' }}>
            Create one
          </Link>
        </p>
      </Card>
    </div>
  );
}
