import { RotateCcw } from "lucide-react";
import SearchInput from "./SearchInput";
import SearchableSelect from "./SearchableSelect";
import MultiSelect from "./MultiSelect";
import Button from "./Button";

export const TableToolbar = ({
  search,
  onSearchChange,
  searchPlaceholder = "Search records...",
  filters = [],
  tabs,
  activeTab,
  onTabChange,
  onClear,
  hasActiveFilters = false,
  actions,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs ${className}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Side: Search + Filter controls */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {onSearchChange && (
            <SearchInput
              value={search || ""}
              onChange={onSearchChange}
              placeholder={searchPlaceholder}
              className="w-full sm:w-64"
            />
          )}

          {/* Quick Tabs if provided */}
          {tabs && tabs.length > 0 && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700/60 overflow-x-auto">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => onTabChange?.(tab.value)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-2xs"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
                            : "bg-slate-200/80 dark:bg-slate-750 text-slate-500"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Dynamic Filters */}
          {filters.map((filter) => {
            const widthClass = filter.width || "w-44";
            if (filter.isMulti) {
              return (
                <div key={filter.key} className={widthClass}>
                  <MultiSelect
                    value={filter.value}
                    onChange={filter.onChange}
                    options={filter.options}
                    placeholder={filter.placeholder || filter.label}
                  />
                </div>
              );
            }

            return (
              <div key={filter.key} className={widthClass}>
                <SearchableSelect
                  value={filter.value}
                  onChange={filter.onChange}
                  options={filter.options}
                  placeholder={filter.placeholder || filter.label}
                  isClearable={filter.isClearable ?? true}
                />
              </div>
            );
          })}

          {/* Reset Filters button */}
          {hasActiveFilters && onClear && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              icon={RotateCcw}
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Reset
            </Button>
          )}
        </div>

        {/* Right Side: Actions Slot */}
        {actions && (
          <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableToolbar;
