import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-mist py-12">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-deep-indigo flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-deep-ink">Project Archive</span>
          </Link>

          <div className="flex items-center gap-6 text-sm text-slate">
            <Link to="/browse" className="hover:text-deep-ink">Browse</Link>
            <Link to="/register" className="hover:text-deep-ink">Get Started</Link>
          </div>

          <p className="text-xs text-fog">© {new Date().getFullYear()} Faculty Project Archive</p>
        </div>
      </div>
    </footer>
  );
}
