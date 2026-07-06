import type { PaginationMeta } from "../../types";
import { Button } from "./Button";

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export const Pagination = ({ meta, onPageChange }: PaginationProps) => {
  if (meta.totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Page {meta.page} of {meta.totalPages} · {meta.total} total
      </p>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={meta.page >= meta.totalPages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
