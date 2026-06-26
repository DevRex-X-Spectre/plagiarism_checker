import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--color-mist)',
      padding: 'var(--spacing-48) 0',
      marginTop: 'var(--spacing-80)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--spacing-16)',
      }}>
        <div style={{
          fontFamily: 'var(--font-suisseintl)',
          fontSize: '14px',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-deep-ink)',
        }}>
          Project Archive
        </div>
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-24)',
          fontSize: 'var(--text-body-sm)',
          color: 'var(--color-slate)',
        }}>
          <Link to="/browse">Browse</Link>
          <Link to="/register">Get Started</Link>
        </div>
        <div style={{
          fontSize: 'var(--text-caption)',
          color: 'var(--color-fog)',
        }}>
          &copy; {new Date().getFullYear()} Faculty Project Archive
        </div>
      </div>
    </footer>
  );
}
