import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../ui/Button.jsx';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav style={{
      padding: 'var(--spacing-20) 0',
      background: 'transparent',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Wordmark */}
        <Link to="/" style={{
          fontFamily: 'var(--font-suisseintl)',
          fontSize: '18px',
          fontWeight: 'var(--font-weight-medium)',
          color: 'var(--color-deep-ink)',
          letterSpacing: '-0.2px',
        }}>
          Project Archive
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-32)' }}>
          <Link to="/browse" style={{
            fontSize: 'var(--text-body-sm)',
            color: 'var(--color-carbon)',
            fontWeight: 'var(--font-weight-regular)',
          }}>
            Browse
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/similarity-check" style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-carbon)',
              }}>
                Check Similarity
              </Link>
              <Link to="/upload" style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-carbon)',
              }}>
                Upload Project
              </Link>
              <Link to="/dashboard" style={{
                fontSize: 'var(--text-body-sm)',
                color: 'var(--color-carbon)',
              }}>
                Dashboard
              </Link>
              {isAdmin && (
                <Link to="/admin" style={{
                  fontSize: 'var(--text-body-sm)',
                  color: 'var(--color-deep-indigo)',
                  fontWeight: 'var(--font-weight-medium)',
                }}>
                  Admin
                </Link>
              )}
              <Button variant="ghost" onClick={handleLogout} style={{ fontSize: '14px' }}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" style={{ fontSize: '14px' }}>
                  Sign in
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" style={{ fontSize: '14px' }}>
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
