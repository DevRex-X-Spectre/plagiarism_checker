import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Select from '../components/ui/Select.jsx';
import Card from '../components/ui/Card.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', fullName: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        padding: 'var(--spacing-48) var(--spacing-24)',
      }}>
        <Card style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'var(--color-pale-cyan)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--spacing-24)',
            fontSize: 24,
          }}>
            ✓
          </div>
          <h2 style={{
            fontFamily: 'var(--font-suisseintl)',
            fontSize: 'var(--text-heading)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-deep-ink)',
            marginBottom: 'var(--spacing-12)',
          }}>
            Check your email
          </h2>
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)' }}>
            We sent a verification link to <strong>{form.email}</strong>.
            Click it to activate your account and start using the archive.
          </p>
          <Link to="/login" style={{ display: 'block', marginTop: 'var(--spacing-32)' }}>
            <Button variant="ghost">Back to sign in</Button>
          </Link>
        </Card>
      </div>
    );
  }

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
          Create account
        </h1>
        <p style={{
          fontSize: 'var(--text-body)',
          color: 'var(--color-slate)',
          marginBottom: 'var(--spacing-32)',
        }}>
          Join the faculty project archive
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
            label="Full name"
            value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })}
            placeholder="Ada Lovelace"
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            placeholder="you@university.edu.ng"
            required
          />
          <Select
            label="Role"
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value })}
            options={[
              { value: 'student', label: 'Student' },
              { value: 'lecturer', label: 'Lecturer' },
            ]}
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            placeholder="Minimum 8 characters"
            required
            hint="Must be at least 8 characters"
          />

          <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 'var(--spacing-8)' }}>
            Create account
          </Button>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: 'var(--spacing-32)',
          fontSize: 'var(--text-body-sm)',
          color: 'var(--color-slate)',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-deep-indigo)', fontWeight: 'var(--font-weight-medium)' }}>
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
