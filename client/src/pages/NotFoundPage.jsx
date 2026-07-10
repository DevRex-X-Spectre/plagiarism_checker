import { Link } from 'react-router-dom';
import { ArrowLeft, Search, FileQuestion } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-16">
      <div className="max-w-md text-center animate-fade-up">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-pale-cyan/30 text-forest-teal">
          <FileQuestion className="h-10 w-10" />
        </div>
        <h1 className="text-6xl font-light tracking-tight text-deep-ink">404</h1>
        <h2 className="mt-3 text-2xl font-light tracking-tight text-deep-ink">Page not found</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate">
          This page does not exist.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/"><Button variant="primary" size="lg" icon={ArrowLeft}>Home</Button></Link>
          <Link to="/similarity-check"><Button variant="ghost" size="lg" icon={Search}>Check similarity</Button></Link>
        </div>
      </div>
    </div>
  );
}
