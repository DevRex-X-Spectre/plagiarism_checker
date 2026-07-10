import { Link } from 'react-router-dom';
import { ArrowRight, Search, Upload, Sparkles, ShieldCheck, LibraryBig } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Card from '../components/ui/Card.jsx';

export default function HomePage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <div className="container max-w-6xl">
        <section className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
          <div className="relative py-6 lg:py-10">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-forest-teal shadow-[0_10px_24px_-20px_rgba(17,26,74,0.45)]">
              <Sparkles className="h-3.5 w-3.5" /> Faculty repository
            </div>
            <h1 className="max-w-3xl text-4xl font-medium leading-[1.04] tracking-tight text-deep-ink sm:text-5xl lg:text-6xl">
              A classic repository for checking ideas, preserving work, and keeping submissions in order.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate sm:text-lg">
              Search for similarity, review details with clarity, and confirm whether a topic has already been explored.
            </p>
            <div className="mt-9 grid grid-cols-2 gap-2 sm:flex sm:gap-3">
              <Link to="/similarity-check" className="min-w-0 sm:min-w-fit">
                <Button size="lg" icon={Search} fullWidth className="h-11 whitespace-nowrap px-3 text-sm sm:h-auto sm:px-6 sm:py-3 sm:text-base">
                  Check similarity
                </Button>
              </Link>
              <Link to={isAuthenticated ? '/upload' : '/login'} className="min-w-0 sm:min-w-fit">
                <Button variant="ghost" size="lg" icon={Upload} fullWidth className="h-11 whitespace-nowrap px-3 text-sm sm:h-auto sm:px-6 sm:py-3 sm:text-base">
                  Submit a project
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 shadow-[0_10px_24px_-22px_rgba(17,26,74,0.45)]">
                <ShieldCheck className="h-4 w-4 text-forest-teal" /> Structured review
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1.5 shadow-[0_10px_24px_-22px_rgba(17,26,74,0.45)]">
                <LibraryBig className="h-4 w-4 text-deep-indigo" /> Semantic repository
              </span>
            </div>
          </div>

          <Card padding={0} className="overflow-hidden card-3d">
            <div className="border-b border-mist/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(246,244,239,0.92))] px-6 py-5">
              <p className="text-sm font-semibold tracking-[0.08em] uppercase text-deep-ink">Quick actions</p>
            </div>
            <div className="grid gap-2 p-4">
              <Action to="/similarity-check" icon={Search} title="Check an idea" text="Compare topic and abstract against the repository." />
              <Action to={isAuthenticated ? '/upload' : '/login'} icon={Upload} title="Submit a project" text="Sign in to upload and preserve your work." />
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function Action({ to, icon: Icon, title, text }) {
  return (
    <Link to={to} className="group flex items-center gap-4 rounded-2xl border border-transparent px-4 py-4 transition-all duration-200 hover:border-white/70 hover:bg-white/70 hover:shadow-[0_16px_30px_-22px_rgba(17,26,74,0.4)]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-deep-indigo/6 text-deep-indigo shadow-[0_12px_22px_-18px_rgba(17,26,74,0.4)]">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-deep-ink">{title}</span>
        <span className="block text-sm leading-6 text-slate">{text}</span>
      </span>
      <ArrowRight className="h-4 w-4 text-fog transition-transform group-hover:translate-x-1 group-hover:text-deep-indigo" />
    </Link>
  );
}
