import {
  Users,
  AlertCircle,
  Phone,
  CheckCircle2,
  Download,
  RefreshCw,
} from "lucide-react";

const DashboardHeader = ({
  title,
  description,
  total,
  counts,
  doExport,
  onRefresh,
  refreshing,
}) => {
  return (
    <div
      className="relative rounded-2xl overflow-hidden shrink-0"
      style={{
        background:
          "linear-gradient(135deg, #18181b 0%, #1c1917 40%, #431407 100%)",
      }}
    >
      {/* Orange top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-orange-500 via-amber-400 to-orange-500" />

      {/* Ambient glow — left orange orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          left: -60,
          top: -40,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Ambient glow — right amber orb */}
      <div
        className="absolute pointer-events-none"
        style={{
          right: -40,
          bottom: -60,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%)",
        }}
      />

      {/* Dot grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.045]"
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />

      {/* Content */}
      <div className="relative flex flex-wrap items-center gap-4 px-6 py-5.5">
        {/* Title */}
        <div className="shrink-0">
          <h1 className="text-[17px] font-bold text-white leading-tight mb-0.5">
            {title}
          </h1>
          <p className="text-[11px] text-slate-400">{description}</p>
        </div>

        {/* Divider */}
        <div className="w-px h-9 bg-white/8 hrink-0 hidden sm:block" />

        {/* Stat chips */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="flex items-center gap-1.5 px-3 py-1.75 rounded-[10px] bg-white/5 border border-white/9">
            <Users className="w-3.5 h-3.5 text-orange-400 shrink-0" />
            <span className="text-[15px] font-bold text-white leading-none">
              {total}
            </span>
            <span className="text-[10px] font-medium text-white/50">
              Total
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.75 rounded-[10px] bg-blue-500/10 border border-blue-500/20">
            <AlertCircle className="w-3.5 h-3.5 text-blue-300 shrink-0" />
            <span className="text-[15px] font-bold text-blue-200 leading-none">
              {counts.new}
            </span>
            <span className="text-[10px] font-medium text-blue-300/60">
              New
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.75 rounded-[10px] bg-amber-500/10 border border-amber-500/20">
            <Phone className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="text-[15px] font-bold text-amber-200 leading-none">
              {counts.contacted}
            </span>
            <span className="text-[10px] font-medium text-amber-300/60">
              Contacted
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.75 rounded-[10px] bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span className="text-[15px] font-bold text-emerald-200 leading-none">
              {counts.resolved}
            </span>
            <span className="text-[10px] font-medium text-emerald-300/60">
              Resolved
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={doExport}
            className="flex items-center gap-1.5 px-3.5 py-1.75 rounded-[9px]
          bg-white/8 border border-white/12 text-slate-200
          text-xs font-semibold hover:bg-white/14 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3.5 py-1.75 rounded-[9px]
          text-white text-xs font-bold cursor-pointer transition-opacity hover:opacity-90
          border border-orange-500/30"
              style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                boxShadow: "0 2px 8px rgba(249,115,22,0.25)",
              }}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;