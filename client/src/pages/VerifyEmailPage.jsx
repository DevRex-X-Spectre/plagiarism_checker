import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service.js';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    authService.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage('Your email has been verified. You can now sign in.');
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.message || 'Verification failed. The link may have expired.');
      });
  }, [token]);

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
          background: status === 'success' ? 'var(--color-pale-cyan)' : '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--spacing-24)',
          fontSize: 24,
          color: status === 'success' ? 'var(--color-forest-teal)' : '#991b1b',
        }}>
          {status === 'success' ? '✓' : '✗'}
        </div>
        <h2 style={{
          fontFamily: 'var(--font-suisseintl)',
          fontSize: 'var(--text-heading)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-deep-ink)',
          marginBottom: 'var(--spacing-12)',
        }}>
          {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Email verified' : 'Verification failed'}
        </h2>
        <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)' }}>
          {message}
        </p>
        {status !== 'loading' && (
          <Link to="/login" style={{ display: 'block', marginTop: 'var(--spacing-32)' }}>
            <Button variant="primary">Go to sign in</Button>
          </Link>
        )}
      </Card>
    </div>
  );
}
