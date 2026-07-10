import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { BookOpen, LayoutDashboard, LogOut, Menu, Search, Shield, Upload, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import Button from '../ui/Button.jsx';

export default function Navbar() {
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const headerRef = useRef(null);

  const close = () => setOpen(false);
  const handleLogout = async () => {
    await logout();
    close();
    navigate('/');
  };

  const links = [
    { to: '/similarity-check', label: 'Check', icon: Search },
    ...(isAuthenticated ? [{ to: '/upload', label: 'Upload', icon: Upload }] : []),
    ...(isAuthenticated ? [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    ...(isAdmin ? [{ to: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = event => {
      if (!headerRef.current?.contains(event.target)) {
        close();
      }
    };

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 border-b border-white/50 bg-[rgba(248,247,243,0.82)] backdrop-blur-2xl">
      <div className="container">
        <div className="flex h-18 items-center justify-between gap-3 py-2">
          <Link to="/" onClick={close} className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-deep-indigo text-white shadow-[0_12px_24px_-12px_rgba(17,26,74,0.55)] ring-1 ring-white/20">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="truncate text-[15px] font-semibold tracking-[0.08em] text-deep-ink uppercase">Project Repository</span>
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
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
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/60 bg-white/80 text-deep-ink shadow-[0_10px_24px_-18px_rgba(17,26,74,0.45)] lg:hidden"
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/60 bg-white/90 shadow-[0_18px_40px_-22px_rgba(17,26,74,0.24)] lg:hidden">
          <div className="container py-4">
            <nav className="grid gap-2">
              {links.map(link => <MobileLink key={link.to} {...link} onClick={close} />)}
              <div className="my-2 h-px bg-mist/80" />
              {isAuthenticated ? (
                <button onClick={handleLogout} className="flex items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-carbon hover:bg-paper-white">
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
        `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-deep-indigo text-white shadow-[0_12px_24px_-14px_rgba(17,26,74,0.55)]'
            : 'text-carbon hover:bg-white/80 hover:text-deep-ink hover:shadow-[0_10px_20px_-18px_rgba(17,26,74,0.35)]'
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
        `flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-colors ${
          isActive ? 'bg-paper-white text-deep-ink' : 'text-carbon hover:bg-paper-white'
        }`
      }
    >
      {Icon && <Icon className="h-5 w-5" />}
      {label}
    </NavLink>
  );
}
