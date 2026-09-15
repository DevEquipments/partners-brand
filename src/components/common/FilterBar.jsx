import SearchInput from "./SearchInput";
import Select from "./Select";

export const FilterBar = ({
  search = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  statusFilter = "all",
  onStatusFilterChange,
  statusCounts = {},
  statusOptions = [
    { value: "all", label: "All" },
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "resolved", label: "Resolved" },
  ],
  sortBy,
  onSortByChange,
  sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
    { value: "name", label: "Customer Name" },
  ],
  actions,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs ${className}`}
    >
      {/* Left side: Search & Status tabs */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
        />

        {statusOptions && statusOptions.length > 0 && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
            {statusOptions.map((opt) => {
              const isActive = statusFilter === opt.value;
              const count = statusCounts[opt.value];

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onStatusFilterChange?.(opt.value)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <span>{opt.label}</span>
                  {count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          : "bg-slate-200/80 dark:bg-slate-750 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right side: Sort and Action slot */}
      <div className="flex items-center gap-2.5 self-end md:self-auto">
        {sortOptions && sortOptions.length > 0 && (
          <div className="w-36">
            <Select
              value={sortBy}
              onChange={(e) => onSortByChange?.(e.target.value)}
              options={sortOptions}
            />
          </div>
        )}
        {actions}
      </div>
    </div>
  );
};

export default FilterBar;
