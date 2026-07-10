import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-mist/70 py-5">
      <div className="container">
        <div className="flex items-center justify-center">
          <Link to="/" className="inline-flex items-center gap-2 text-slate transition-colors hover:text-deep-ink">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-deep-indigo text-white">
              <BookOpen className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-medium">Project Repository</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
