import { Search, X } from "lucide-react";

export const SearchInput = ({
  value = "",
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
  ...props
}) => {
  return (
    <div className={`relative flex items-center min-w-[220px] max-w-sm ${className}`}>
      <div className="absolute left-3 pointer-events-none text-slate-400 dark:text-slate-500">
        <Search className="w-3.5 h-3.5" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-8 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-lg outline-none transition-colors hover:border-slate-400 dark:hover:border-slate-600 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:focus:ring-orange-500/25 placeholder:text-slate-400 dark:placeholder:text-slate-400 shadow-xs"
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            onChange?.("");
            onClear?.();
          }}
          className="absolute right-2.5 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
