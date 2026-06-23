import { useAuth } from "../context/AuthContext";
import {
  Users,
  MessageSquare,
  UserCheck,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowRight,
  Clock,
  FileText,
  Phone,
  Mail,
  Star,
  Activity,
  Zap,
  ChevronRight,
} from "lucide-react";

// Reusable Card Component
const Card = ({ children, className = "" }) => (
  <div
    className={`bg-white rounded-2xl border border-zinc-200 ${className}`}
  >
    {children}
  </div>
);

// Statistics Card Component
const StatCard = ({ card, index }) => (
  <Card className="p-6 hover:shadow-lg hover:border-zinc-300 transition-all duration-300 animate-fade-in group"
    style={{ animationDelay: `${index * 100}ms` }}>
    <div className="flex items-start justify-between mb-5">
      <div className={`w-12 h-12 ${card.iconBg} rounded-xl flex items-center justify-center`}>
        <card.icon className={`w-5 h-5 ${card.iconColor}`} />
      </div>
      {card.trend === "up" && (
        <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
          <TrendingUp className="w-3 h-3" />
          <span className="text-xs font-bold">{card.change}</span>
        </div>
      )}
      {card.trend === "status" && (
        <div className="flex items-center gap-1 text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg">
          <span className="text-xs font-bold">{card.change}</span>
        </div>
      )}
    </div>
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-500">{card.label}</p>
      <p className="text-2xl font-bold text-zinc-900 leading-none">{card.value}</p>
    </div>
    <div
      className={`absolute inset-x-0 top-0 h-0.5 ${card.accentColor} rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      style={{ position: "absolute" }}
    />
  </Card>
);

// Activity Item Component
const ActivityItem = ({ activity, isLast, index }) => (
  <div className="flex gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors duration-200 group">
    <div className="relative flex-shrink-0">
      <div className={`w-10 h-10 ${activity.iconBg} rounded-lg flex items-center justify-center`}>
        <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
      </div>
      {!isLast && (
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-6 bg-zinc-200" />
      )}
    </div>
    <div className="flex-1 min-w-0 pt-0.5">
      <p className="text-sm font-semibold text-zinc-900 mb-1">{activity.title}</p>
      <p className="text-xs text-zinc-500">{activity.description}</p>
    </div>
    <div className="flex items-center gap-1.5 text-xs text-zinc-400 flex-shrink-0 whitespace-nowrap">
      <Clock className="w-3 h-3" />
      <span className="font-medium">{activity.time}</span>
    </div>
  </div>
);

// Metric Bar Component
const MetricBar = ({ metric }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-zinc-700">{metric.label}</span>
      <span className="text-sm font-bold text-zinc-900">{metric.value}%</span>
    </div>
    <div className={`h-2 ${metric.trackColor} rounded-full overflow-hidden`}>
      <div
        className={`h-full ${metric.color} rounded-full transition-all duration-1000 ease-out`}
        style={{ width: `${metric.value}%` }}
      />
    </div>
  </div>
);

// Quick Action Button Component
const ActionButton = ({ action }) => (
  <button className={`w-full flex items-center gap-3 p-4 rounded-xl border border-zinc-200 text-left transition-all duration-300 group hover:border-orange-300 hover:bg-orange-50/50`}>
    <div className={`w-10 h-10 ${action.iconBg} rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110`}>
      <action.icon className={`w-4 h-4 ${action.iconColor}`} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-zinc-900 leading-tight">{action.label}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{action.description}</p>
    </div>
    <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-orange-500 transition-colors flex-shrink-0" />
  </button>
);

const Dashboard = () => {
  const { user } = useAuth();
  const displayName = user?.brand_name || user?.name || user?.username || "Partner";

  const statsCards = [
    {
      label: "Total Leads",
      value: "1,284",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
      accentColor: "bg-orange-600",
    },
    {
      label: "Active Inquiries",
      value: "342",
      change: "+8.2%",
      trend: "up",
      icon: MessageSquare,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      accentColor: "bg-emerald-600",
    },
    {
      label: "Profile Status",
      value: "Active",
      change: "Verified",
      trend: "status",
      icon: UserCheck,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      accentColor: "bg-blue-600",
    },
    {
      label: "Account Status",
      value: "Premium",
      change: "Active",
      trend: "status",
      icon: ShieldCheck,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
      accentColor: "bg-amber-600",
    },
  ];

  const recentActivities = [
    {
      icon: Phone,
      title: "New lead received from Delhi NCR",
      description: "A customer inquired about construction equipment",
      time: "2h ago",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      icon: Mail,
      title: "Inquiry response sent",
      description: "You responded to the equipment pricing inquiry",
      time: "4h ago",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: Star,
      title: "Profile rating updated",
      description: "Your brand received a new 5-star review",
      time: "6h ago",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      icon: FileText,
      title: "Quotation generated",
      description: "Quotation #QT-2847 sent to Sharma Constructions",
      time: "1d ago",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  ];

  const performanceMetrics = [
    { label: "Response Rate", value: 92, color: "bg-emerald-500", trackColor: "bg-emerald-100" },
    { label: "Lead Conversion", value: 67, color: "bg-orange-500", trackColor: "bg-orange-100" },
    { label: "Customer Satisfaction", value: 95, color: "bg-blue-500", trackColor: "bg-blue-100" },
    { label: "Profile Completion", value: 85, color: "bg-amber-500", trackColor: "bg-amber-100" },
  ];

  const quickActions = [
    {
      icon: FileText,
      label: "Generate Quotation",
      description: "Create a new price quote",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
    {
      icon: Users,
      label: "View All Leads",
      description: "Browse lead directory",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: Mail,
      label: "Contact Support",
      description: "Get help from our team",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-orange-900 to-orange-700 p-8 lg:p-12 text-white animate-fade-in">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 left-1/4 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1.5">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Live Dashboard</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
              Welcome back, {displayName}
            </h1>
            <p className="text-orange-100/90 text-base max-w-md leading-relaxed">
              Here is an overview of your brand's performance and recent activities. Stay on top of your leads and inquiries.
            </p>
          </div>

          <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-300 group self-start lg:self-center whitespace-nowrap">
            <Zap className="w-4 h-4" />
            <span>View Analytics</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <StatCard key={card.label} card={card} index={index} />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-200">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-zinc-900">Recent Activity</h2>
              <p className="text-sm text-zinc-500">Your latest updates and notifications</p>
            </div>
            <button className="flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors">
              View all
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-zinc-200">
            {recentActivities.map((activity, index) => (
              <ActivityItem
                key={index}
                activity={activity}
                isLast={index === recentActivities.length - 1}
                index={index}
              />
            ))}
          </div>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Performance Section */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-zinc-900">Performance</h3>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-md">
                <Activity className="w-3 h-3" />
                <span>This Month</span>
              </div>
            </div>

            <div className="space-y-6">
              {performanceMetrics.map((metric) => (
                <MetricBar key={metric.label} metric={metric} />
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-zinc-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <ActionButton key={action.label} action={action} />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;