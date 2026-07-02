import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button.jsx';

export default function Pagination({ page = 1, totalPages = 1, total = 0, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate">
        Page <span className="font-medium text-deep-ink">{page}</span> of {totalPages}
        {total ? <span> · {total.toLocaleString()} total</span> : null}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button variant="ghost" size="sm" icon={ChevronRight} iconPosition="right" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
