import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import Card from '../components/ui/Card.jsx';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [step, setStep] = useState(token ? 'reset' : 'request');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleRequest = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
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
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)', padding: 'var(--spacing-48) var(--spacing-24)',
      }}>
        <Card style={{ width: '100%', maxWidth: 440, textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 'var(--text-heading)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-12)' }}>
            {step === 'request' ? 'Check your email' : 'Password reset'}
          </h2>
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)' }}>
            {step === 'request'
              ? 'If that email exists, a reset link has been sent.'
              : 'Your password has been reset. You can now sign in.'}
          </p>
          <Link to="/login" style={{ display: 'block', marginTop: 'var(--spacing-32)' }}>
            <Button variant="primary">Sign in</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (step === 'reset') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)', padding: 'var(--spacing-48) var(--spacing-24)' }}>
        <Card style={{ width: '100%', maxWidth: 440 }}>
          <h1 style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 'var(--text-heading)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-8)' }}>Reset password</h1>
          <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)', marginBottom: 'var(--spacing-32)' }}>Enter your new password</p>
          {error && <div style={{ padding: 'var(--spacing-12)', background: 'var(--color-danger-light)', borderRadius: 'var(--radius-lg)', color: 'var(--color-danger)', fontSize: 'var(--text-body-sm)', marginBottom: 'var(--spacing-24)' }}>{error}</div>}
          <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
            <Input label="New password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 8 characters" required />
            <Button type="submit" loading={loading} style={{ width: '100%' }}>Reset password</Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 200px)', padding: 'var(--spacing-48) var(--spacing-24)' }}>
      <Card style={{ width: '100%', maxWidth: 440 }}>
        <h1 style={{ fontFamily: 'var(--font-suisseintl)', fontSize: 'var(--text-heading)', fontWeight: 'var(--font-weight-medium)', marginBottom: 'var(--spacing-8)' }}>Forgot password</h1>
        <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)', marginBottom: 'var(--spacing-32)' }}>Enter your email and we'll send you a reset link</p>
        {error && <div style={{ padding: 'var(--spacing-12)', background: 'var(--color-danger-light)', borderRadius: 'var(--radius-lg)', color: 'var(--color-danger)', fontSize: 'var(--text-body-sm)', marginBottom: 'var(--spacing-24)' }}>{error}</div>}
        <form onSubmit={handleRequest} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-20)' }}>
          <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@university.edu.ng" required />
          <Button type="submit" loading={loading} style={{ width: '100%' }}>Send reset link</Button>
        </form>
      </Card>
    </div>
  );
}
