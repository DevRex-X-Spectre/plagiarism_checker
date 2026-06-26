import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';

export default function NotFoundPage() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 200px)',
      padding: 'var(--spacing-48) var(--spacing-24)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 480 }}>
        <div style={{
          fontFamily: 'var(--font-suisseintl)',
          fontSize: 'var(--text-display)',
          fontWeight: 'var(--font-weight-light)',
          color: 'var(--color-mist)',
          lineHeight: 1,
          marginBottom: 'var(--spacing-24)',
        }}>
          404
        </div>
        <h1 style={{
          fontFamily: 'var(--font-suisseintl)',
          fontSize: 'var(--text-heading)',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-deep-ink)',
          marginBottom: 'var(--spacing-12)',
        }}>
          Page not found
        </h1>
        <p style={{ fontSize: 'var(--text-body)', color: 'var(--color-slate)', marginBottom: 'var(--spacing-32)' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary">Back to home</Button>
        </Link>
      </div>
    </div>
  );
}