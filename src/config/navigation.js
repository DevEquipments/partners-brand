import {
  LayoutDashboard,
  Layers,
  MessageSquareText,
  FileSpreadsheet,
  Clock,
  Users,
  Shield,
  BarChart3,
  User,
} from "lucide-react";
import { MODULES, PERMISSIONS } from "./permissions";
import { resolveSlugToModule } from "../utils/permissionResolver";

/**
 * Route metadata mapping for dynamically resolved CRM modules.
 * Slugs from POST /get-premium-brand-permissions are resolved to system modules
 * via resolveSlugToModule, then matched against this map to construct safe navigation items.
 * Slugs that do not map to a recognized application route (e.g. "Test") are safely omitted.
 */
export const SUPPORTED_DYNAMIC_ROUTES = {
  [MODULES.CRM_LEADS]: {
    path: "/crm/leads",
    icon: Layers,
    defaultLabel: "Leads",
    permission: PERMISSIONS.LEADS_VIEW,
  },
  [MODULES.CRM_ENQUIRIES]: {
    path: "/crm/enquiries",
    icon: MessageSquareText,
    defaultLabel: "Customer Enquiry",
    permission: PERMISSIONS.ENQUIRIES_VIEW,
  },
  [MODULES.CRM_QUOTES]: {
    path: "/crm/quotes",
    icon: FileSpreadsheet,
    defaultLabel: "Quotes",
    permission: PERMISSIONS.QUOTES_VIEW,
  },
  [MODULES.CRM_FOLLOWUPS]: {
    path: "/crm/follow-ups",
    icon: Clock,
    defaultLabel: "Follow-ups",
    permission: PERMISSIONS.FOLLOWUPS_VIEW,
  },
  [MODULES.REPORTS]: {
    path: "/reports",
    icon: BarChart3,
    defaultLabel: "Reports",
    permission: PERMISSIONS.REPORTS_VIEW,
  },
};

/**
 * Maps a single dynamic permission definition to a validated sidebar navigation item.
 * @param {Object} def - { id, name, slug }
 * @returns {Object|null} Nav item object or null if unmapped
 */
export const mapDefinitionToNavItem = (def) => {
  if (!def || !def.slug) return null;

  const resolvedModule = resolveSlugToModule(def.slug);
  const routeMeta = SUPPORTED_DYNAMIC_ROUTES[resolvedModule];

  // If unknown or unsupported slug (e.g. "Test"), skip safely without crashing
  if (!routeMeta) {
    return null;
  }

  return {
    id: def.id,
    label: (def.name || "").trim() || routeMeta.defaultLabel,
    path: routeMeta.path,
    icon: routeMeta.icon || Shield,
    module: resolvedModule,
    permission: routeMeta.permission,
    slug: def.slug,
  };
};

/**
 * Equipments Dekho Premium Brand CRM — Navigation Specification
 *
 * Distinct views for Admin vs Sub Admin:
 *
 * Admin:
 * - Overview: Dashboard (/dashboard)
 * - CRM: Dynamically loaded from POST /get-premium-brand-permissions
 * - Operations: Sub Admins (/sub-admins), Permissions (/permissions), Profile (/profile)
 *
 * Sub Admin (Untouched):
 * - Overview: Dashboard (/dashboard)
 * - CRM: My Leads (/crm/leads), My Enquiries (/crm/enquiries), My Quotes (/crm/quotes), Follow-ups (/crm/follow-ups)
 * - Settings: Profile (/profile)
 *
 * @param {string} role - "ADMIN" | "SUB_ADMIN"
 * @param {Array<Object>} dynamicDefinitions - Dynamic definitions from POST /get-premium-brand-permissions
 * @returns {Array<Object>} Array of navigation section objects
 */
export const getNavigationSections = (role = "ADMIN", dynamicDefinitions = []) => {
  const isAdmin = role === "ADMIN";

  if (isAdmin) {
    // Dynamic CRM items constructed strictly from real API permission definitions
    const crmItems = [];
    const seenPaths = new Set();

    if (Array.isArray(dynamicDefinitions)) {
      dynamicDefinitions.forEach((def) => {
        const item = mapDefinitionToNavItem(def);
        if (item && !seenPaths.has(item.path)) {
          seenPaths.add(item.path);
          crmItems.push(item);
        }
      });
    }

    const sections = [
      {
        title: "Overview",
        items: [
          {
            label: "Dashboard",
            path: "/dashboard",
            icon: LayoutDashboard,
            module: MODULES.DASHBOARD,
            permission: PERMISSIONS.DASHBOARD_VIEW,
          },
        ],
      },
      {
        title: "CRM",
        items: crmItems,
      },
    ];

    // Shell Operations Section
    sections.push({
      title: "Operations",
      items: [
        {
          label: "Sub Admins",
          path: "/sub-admins",
          icon: Users,
          module: MODULES.TEAM,
          permission: PERMISSIONS.SUBADMINS_MANAGE,
          adminOnly: true,
        },
        {
          label: "Permissions",
          path: "/permissions",
          icon: Shield,
          module: MODULES.TEAM,
          permission: PERMISSIONS.SUBADMINS_MANAGE,
          adminOnly: true,
        },
        {
          label: "Profile",
          path: "/profile",
          icon: User,
          module: MODULES.PROFILE,
          permission: PERMISSIONS.PROFILE_VIEW,
        },
      ],
    });

    return sections;
  }

  // Sub Admin Navigation (Untouched, independent of dynamic definitions)
  return [
    {
      title: "Overview",
      items: [
        {
          label: "Dashboard",
          path: "/dashboard",
          icon: LayoutDashboard,
          module: MODULES.DASHBOARD,
          permission: PERMISSIONS.DASHBOARD_VIEW,
        },
      ],
    },
    {
      title: "CRM",
      items: [
        {
          label: "My Leads",
          path: "/crm/leads",
          icon: Layers,
          module: MODULES.CRM_LEADS,
          permission: PERMISSIONS.LEADS_VIEW,
        },
        {
          label: "My Enquiries",
          path: "/crm/enquiries",
          icon: MessageSquareText,
          module: MODULES.CRM_ENQUIRIES,
          permission: PERMISSIONS.ENQUIRIES_VIEW,
        },
        {
          label: "My Quotes",
          path: "/crm/quotes",
          icon: FileSpreadsheet,
          module: MODULES.CRM_QUOTES,
          permission: PERMISSIONS.QUOTES_VIEW,
        },
        {
          label: "Follow-ups",
          path: "/crm/follow-ups",
          icon: Clock,
          module: MODULES.CRM_FOLLOWUPS,
          permission: PERMISSIONS.FOLLOWUPS_VIEW,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          label: "Profile",
          path: "/profile",
          icon: User,
          module: MODULES.PROFILE,
          permission: PERMISSIONS.PROFILE_VIEW,
        },
      ],
    },
  ];
};

export const CRM_NAVIGATION_SECTIONS = getNavigationSections("ADMIN", []);

export default CRM_NAVIGATION_SECTIONS;
