import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BookOpen, LayoutDashboard, LogOut, Menu, Search, Shield, Upload, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../ui/Button.jsx';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const handleLogout = async () => {
    await logout();
    close();
    navigate('/');
  };

  const links = [
    { to: '/similarity-check', label: 'Check', icon: Search },
    { to: '/browse', label: 'Browse', icon: BookOpen },
    ...(isAuthenticated ? [{ to: '/upload', label: 'Upload', icon: Upload }] : []),
    ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-mist bg-paper-white/95 backdrop-blur">
      <div className="container">
        <div className="flex h-16 items-center justify-between gap-3">
          <Link to="/" onClick={close} className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-deep-indigo text-white">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="truncate text-base font-semibold tracking-tight text-deep-ink">Project Archive</span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {links.map(link => <DesktopLink key={link.to} {...link} />)}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated ? (
              <Button variant="ghost" size="sm" icon={LogOut} onClick={handleLogout}>Sign out</Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>Create account</Button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen(value => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-mist bg-card-white text-deep-ink lg:hidden"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-mist bg-card-white lg:hidden">
          <div className="container py-3">
            <nav className="grid gap-1">
              {links.map(link => <MobileLink key={link.to} {...link} onClick={close} />)}
              <div className="my-2 h-px bg-mist" />
              {isAuthenticated ? (
                <button onClick={handleLogout} className="flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-carbon">
                  <LogOut className="h-5 w-5" /> Sign out
                </button>
              ) : (
                <>
                  <MobileLink to="/login" label="Sign in" onClick={close} />
                  <MobileLink to="/register" label="Create account" onClick={close} />
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}

function DesktopLink({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive ? 'bg-card-white text-deep-ink shadow-sm' : 'text-carbon hover:bg-card-white hover:text-deep-ink'
        }`
      }
    >
      {Icon && <Icon className="h-4 w-4" />}
      {label}
    </NavLink>
  );
}

function MobileLink({ to, label, icon: Icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
          isActive ? 'bg-paper-white text-deep-ink' : 'text-carbon'
        }`
      }
    >
      {Icon && <Icon className="h-5 w-5" />}
      {label}
    </NavLink>
  );
}
