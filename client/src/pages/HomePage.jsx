import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Search, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <div className="container max-w-6xl">
        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="py-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-forest-teal">Project repository</p>
            <h1 className="max-w-3xl text-4xl font-light leading-tight tracking-tight text-deep-ink sm:text-5xl lg:text-6xl">
              Check project similarity before work starts.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate sm:text-lg">
              Search existing student projects, compare new ideas, and keep faculty submissions in one clean archive.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/similarity-check"><Button size="lg" icon={Search}>Check similarity</Button></Link>
              <Link to="/browse"><Button variant="ghost" size="lg" icon={BookOpen}>Browse archive</Button></Link>
            </div>
          </div>

          <Card padding={0} className="overflow-hidden">
            <div className="border-b border-mist bg-paper-white px-5 py-4">
              <p className="text-sm font-medium text-deep-ink">Quick actions</p>
            </div>
            <div className="grid gap-1 p-3">
              <Action to="/similarity-check" icon={Search} title="Check an idea" text="Compare topic and abstract." />
              <Action to="/browse" icon={BookOpen} title="Find projects" text="Search by title, department, or year." />
              <Action to={isAuthenticated ? '/upload' : '/login'} icon={Upload} title="Upload project" text="Students sign in to submit." />
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Action({ to, icon: Icon, title, text }) {
  return (
    <Link to={to} className="group flex items-center gap-4 rounded-lg px-4 py-4 transition-colors hover:bg-paper-white">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pale-cyan/40 text-forest-teal">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-deep-ink">{title}</span>
        <span className="block text-sm text-slate">{text}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-fog transition-transform group-hover:translate-x-1 group-hover:text-deep-indigo" />
    </Link>
  );
}
