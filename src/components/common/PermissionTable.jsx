import { useState, useMemo } from "react";
import {
  Layers,
  FileText,
  Clock,
  Activity,
  History,
  BarChart3,
  MessageSquareText,
  Shield,
  Download,
  Globe,
  Search,
} from "lucide-react";
import Switch from "./Switch";

/**
 * Resolves appropriate visual icons for dynamic permissions.
 * Falls back to generic Lucide Shield icon for any new or unknown permissions.
 */
const resolvePermissionIcon = (slug = "", name = "") => {
  const s = String(slug || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const n = String(name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const key = `${s} ${n}`;

  if (key.includes("lead")) return Layers;
  if (key.includes("quote") || key.includes("quotation")) return FileText;
  if (key.includes("followup") || key.includes("follow")) return Clock;
  if (key.includes("activit")) return Activity;
  if (key.includes("history")) return History;
  if (key.includes("report")) return BarChart3;
  if (key.includes("enquir") || key.includes("inquir")) return MessageSquareText;
  if (key.includes("brand") || key.includes("page")) return Globe;
  if (key.includes("export") || key.includes("csv")) return Download;

  return Shield;
};

/**
 * Clean Permission Assignment List
 *
 * Displays dynamic permission definitions from GET /get-premium-brand-permissions
 * with simple ON/OFF toggle switches.
 */
export const PermissionTable = ({
  definitions = [],
  permissions = {},
  onChange,
  disabled = false,
  isLoading = false,
  className = "",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDefinitions = useMemo(() => {
    if (!searchQuery.trim()) return definitions;
    const q = searchQuery.toLowerCase().trim();
    return definitions.filter((def) => {
      const nameMatch = (def.name || "").toLowerCase().includes(q);
      const slugMatch = (def.slug || "").toLowerCase().includes(q);
      return nameMatch || slugMatch;
    });
  }, [definitions, searchQuery]);

  const handleToggle = (slug, nextVal) => {
    if (disabled || isLoading || !onChange) return;
    onChange(slug, nextVal);
  };

  if (isLoading) {
    return (
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center text-slate-400 text-xs ${className}`}
      >
        Loading available permissions...
      </div>
    );
  }

  if (!definitions || definitions.length === 0) {
    return (
      <div
        className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center text-slate-500 dark:text-slate-400 text-xs ${className}`}
      >
        No permission definitions found.
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Optional Search Bar when multiple definitions exist */}
      {definitions.length > 5 && (
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search permissions by name or slug..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-slate-900 transition-colors"
          />
        </div>
      )}

      {/* Permission Assignment Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-2xs">
        {/* Table Header: Permission | Access */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 dark:bg-slate-850/60 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          <span>Permission</span>
          <span className="w-16 text-right">Access</span>
        </div>

        {filteredDefinitions.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs">
            No permissions matching &ldquo;{searchQuery}&rdquo;
          </div>
        ) : (
          filteredDefinitions.map((def) => {
            const Icon = resolvePermissionIcon(def.slug, def.name);
            const isOn = Boolean(permissions[def.slug]);

            return (
              <div
                key={def.slug || def.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* Permission Icon, Name, and Slug */}
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/40 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-slate-900 dark:text-white text-xs block truncate">
                      {def.name}
                    </span>
                    {def.slug && (
                      <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                        {def.slug}
                      </span>
                    )}
                  </div>
                </div>

                {/* Single ON / OFF Toggle */}
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-[11px] font-bold select-none w-8 text-right transition-colors ${
                      isOn
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-slate-400 dark:text-slate-500"
                    }`}
                  >
                    {isOn ? "ON" : "OFF"}
                  </span>
                  <Switch
                    checked={isOn}
                    onChange={(nextVal) => handleToggle(def.slug, nextVal)}
                    disabled={disabled}
                    aria-label={`Toggle ${def.name} permission`}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PermissionTable;
