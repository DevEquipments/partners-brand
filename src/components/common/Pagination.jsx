import { ChevronLeft, ChevronRight } from "lucide-react";
import Button from "./Button";

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalRecords = 0,
  onPageChange,
  isLoading = false,
  className = "",
}) => {
  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <div
      className={`flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 select-none text-xs text-slate-500 dark:text-slate-400 ${className}`}
    >
      <div className="flex items-center gap-1.5">
        <span>Total</span>
        <span className="font-bold text-slate-800 dark:text-slate-200">
          {totalRecords.toLocaleString("en-IN")}
        </span>
        <span>records</span>
        <span className="mx-1 text-slate-300 dark:text-slate-700">|</span>
        <span>Page</span>
        <span className="font-bold text-slate-800 dark:text-slate-200">{currentPage}</span>
        <span>of</span>
        <span className="font-bold text-slate-800 dark:text-slate-200">{Math.max(totalPages, 1)}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          disabled={isFirstPage || isLoading}
          onClick={() => onPageChange(currentPage - 1)}
          icon={ChevronLeft}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={isLastPage || isLoading}
          onClick={() => onPageChange(currentPage + 1)}
          icon={ChevronRight}
          iconPosition="right"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
