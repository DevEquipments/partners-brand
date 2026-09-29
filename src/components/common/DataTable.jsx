import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import Checkbox from "./Checkbox";
import LoadingState from "./LoadingState";
import EmptyState from "./EmptyState";
import ErrorState from "./ErrorState";
import Pagination from "./Pagination";

export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  error = null,
  onRetry,
  emptyTitle = "No records found",
  emptyDescription = "There are no records matching the selected criteria.",
  selectable = false,
  selectedIds = new Set(),
  onSelectRow,
  onSelectAll,
  onRowClick,
  rowKey = "id",
  sortColumn,
  sortDirection = "asc", // 'asc' | 'desc'
  onSort,
  pagination,
  className = "",
}) => {
  const isAllSelected =
    selectable && data.length > 0 && data.every((item) => selectedIds.has(item[rowKey]));

  return (
    <div
      className={`w-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          {/* Header */}
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/80 text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider select-none">
              {selectable && (
                <th className="w-10 px-4 py-3 text-center shrink-0">
                  <Checkbox
                    checked={isAllSelected}
                    onChange={() => onSelectAll?.(data)}
                    disabled={data.length === 0}
                  />
                </th>
              )}
              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                const canSort = col.sortable && onSort;

                return (
                  <th
                    key={col.key}
                    onClick={() => canSort && onSort(col.key)}
                    className={`px-4 py-3 font-bold text-[11px] ${
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                        ? "text-center"
                        : "text-left"
                    } ${canSort ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" : ""} ${
                      col.className || ""
                    }`}
                    style={col.width ? { width: col.width } : undefined}
                  >
                    <div
                      className={`flex items-center gap-1.5 ${
                        col.align === "right"
                          ? "justify-end"
                          : col.align === "center"
                          ? "justify-center"
                          : "justify-start"
                      }`}
                    >
                      <span>{col.label}</span>
                      {canSort && (
                        <span className="text-slate-400 dark:text-slate-500">
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="w-3.5 h-3.5 text-orange-500" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-orange-500" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3 h-3 opacity-60 hover:opacity-100" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="p-0"
                >
                  <LoadingState text="Loading records..." skeleton rows={5} />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="p-6 text-center"
                >
                  <ErrorState
                    title="Failed to load records"
                    message={typeof error === "string" ? error : error?.message || "An unexpected error occurred"}
                    onRetry={onRetry}
                  />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="p-6 text-center"
                >
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            ) : (
              data.map((row, idx) => {
                const id = row[rowKey] !== undefined ? row[rowKey] : idx;
                const isSelected = selectedIds.has(id);

                return (
                  <tr
                    key={id}
                    onClick={() => onRowClick?.(row)}
                    className={`transition-colors duration-100 ${
                      onRowClick ? "cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850/60" : ""
                    } ${
                      isSelected
                        ? "bg-orange-50/50 dark:bg-orange-950/20"
                        : "bg-white dark:bg-slate-900"
                    }`}
                  >
                    {selectable && (
                      <td
                        className="w-10 px-4 py-3 text-center shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => onSelectRow?.(id)}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-4 py-3 text-slate-700 dark:text-slate-300 font-medium ${
                          col.align === "right"
                            ? "text-right"
                            : col.align === "center"
                            ? "text-center"
                            : "text-left"
                        } ${col.cellClassName || ""}`}
                      >
                        {col.render ? col.render(row[col.key], row, idx) : row[col.key] ?? "-"}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Integration */}
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage || pagination.page || 1}
          totalPages={pagination.totalPages || 1}
          totalRecords={pagination.totalRecords !== undefined ? pagination.totalRecords : pagination.total || 0}
          onPageChange={pagination.onPageChange}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default DataTable;
