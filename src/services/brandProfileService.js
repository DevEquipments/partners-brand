/**
 * Brand Profile Enterprise Service
 *
 * Manages full brand profile data for Brand Administrator:
 * - Company Info (Legal credentials, contact info, brand ID, GST, corporate bio)
 * - Brand Banners (Hero, promotional, seasonal banners with active toggle & reorder)
 * - Brand Achievements (Awards, certifications, milestones, issuing body, year)
 * - Brand Services (Commercial sales, equipment rental, maintenance, spare parts, SLAs)
 *
 * Provides persistent local state until backend endpoints are deployed.
 */

const STORAGE_KEYS = {
  COMPANY_INFO: "partners_brand_company_info",
  BANNERS: "partners_brand_banners",
  ACHIEVEMENTS: "partners_brand_achievements",
  SERVICES: "partners_brand_services",
};

const INITIAL_COMPANY_INFO = {
  brand_name: "JCB India",
  company_name: "JCB India Limited",
  brand_id: "jcb-586805",
  gst: "07AAACJ1234F1Z5",
  email: "partners@jcb.com",
  phone: "1800 200 522",
  office_address: "Plot 1, Talegaon Industrial Area, Pune, Maharashtra 410507",
  website: "https://www.jcb.com/en-in",
  established_year: "1979",
  bio: "India's premier manufacturer of world-class construction and earthmoving equipment. Offering fuel-efficient backhoe loaders, heavy excavators, genuine spare parts, and an unrivaled nationwide 24/7 service network.",
  authorized_regions: "North, South, East, West India",
  oem_certification: "Certified Heavy Machinery OEM",
};

const INITIAL_BANNERS = [
  {
    id: "BAN-1",
    title: "Next-Gen 3DX Plus Backhoe Loader",
    subtitle: "Engineered with IntelliMax Technology — Delivering 7% lower fuel consumption and industry-best excavating performance.",
    placement: "Hero Banner (Top)",
    badge: "New Release",
    link_url: "/crm/quotes",
    image_url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
    is_active: true,
    order: 1,
    created_at: "2026-10-15T10:00:00Z",
  },
  {
    id: "BAN-2",
    title: "Zero Down-Payment Equipment Financing",
    subtitle: "Partner with JCB Financial Services for fast credit approvals, competitive interest rates, and flexible seasonal EMIs.",
    placement: "Promotional Banner",
    badge: "Finance Offer",
    link_url: "/crm/enquiries",
    image_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    is_active: true,
    order: 2,
    created_at: "2026-10-20T10:00:00Z",
  },
  {
    id: "BAN-3",
    title: "Monsoon Preventive Care & AMC Package",
    subtitle: "Special 15% discount on genuine hydraulic seals, filter kits, and comprehensive engine diagnostic checkups.",
    placement: "Seasonal Offer",
    badge: "Service Discount",
    link_url: "/crm/enquiries",
    image_url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1200&q=80",
    is_active: false,
    order: 3,
    created_at: "2026-11-01T10:00:00Z",
  },
];

const INITIAL_ACHIEVEMENTS = [
  {
    id: "ACH-1",
    title: "Equipment India Manufacturer of the Year 2025",
    issuing_body: "Equipment India Annual Industry Awards",
    year: "2025",
    category: "Industry Excellence",
    description: "Honored with the top industry accolade for outstanding manufacturing scale, fuel efficiency breakthroughs, and telematics leadership in India.",
    badge_color: "emerald",
  },
  {
    id: "ACH-2",
    title: "ISO 9001:2015 & ISO 14001 Quality Certification",
    issuing_body: "TÜV Rheinland International",
    year: "2024",
    category: "Quality & Safety",
    description: "Certified world-class assembly safety standards, zero-defect quality control, and eco-friendly manufacturing across all Indian assembly plants.",
    badge_color: "blue",
  },
  {
    id: "ACH-3",
    title: "500,000 Heavy Machinery Delivered in India",
    issuing_body: "Confederation of Indian Industry (CII)",
    year: "2023",
    category: "Milestone",
    description: "Became the first construction machinery manufacturer to cross the historic milestone of half a million earthmoving machines deployed in India.",
    badge_color: "orange",
  },
  {
    id: "ACH-4",
    title: "National Dealer Network & SLA Excellence Award",
    issuing_body: "Construction Equipment Federation",
    year: "2024",
    category: "Service Network",
    description: "Recognized for maintaining under 24-hour spare parts delivery SLA and rapid breakdown assistance across 750+ authorized dealer outlets.",
    badge_color: "purple",
  },
];

const INITIAL_SERVICES = [
  {
    id: "SRV-1",
    title: "Commercial Equipment Sales & Distribution",
    category: "Equipment Sales",
    description: "Enterprise supply of brand-new heavy earthmoving machinery including excavators, backhoe loaders, compactors, and telescopic handlers.",
    turnaround: "Immediate Dispatch",
    warranty: "2 Years / 4,000 Hours OEM Comprehensive Warranty",
    features: [
      "Factory-certified pre-delivery inspection (PDI)",
      "Competitive OEM financing & lease options",
      "Complimentary first 3 periodic maintenance services",
    ],
    is_active: true,
  },
  {
    id: "SRV-2",
    title: "Heavy Equipment Rental & Fleet Leasing",
    category: "Fleet Leasing",
    description: "Short-term and long-term machinery rental solutions with certified operators, routine upkeep, and LiveLink telematics fleet monitoring included.",
    turnaround: "24-48 Hours Deployment",
    warranty: "Full Operational Maintenance Included",
    features: [
      "Flexible monthly, quarterly, and annual contracts",
      "No capital expenditure (Zero Capex) option",
      "Replacement machine guarantee during breakdown",
    ],
    is_active: true,
  },
  {
    id: "SRV-3",
    title: "24/7 Field Maintenance & Rapid Breakdown Repairs",
    category: "Field Maintenance",
    description: "On-site emergency mobile service vans equipped with diagnostic computers, certified mechanics, and common hydraulic components.",
    turnaround: "Under 4 Hours Response Time",
    warranty: "90 Days Service Guarantee on Repaired Units",
    features: [
      "Toll-free 24/7 breakdown helpline",
      "Certified factory-trained service technicians",
      "Hydraulic pressure testing and engine tune-ups",
    ],
    is_active: true,
  },
  {
    id: "SRV-4",
    title: "OEM Genuine Spare Parts & Lubricant Kits",
    category: "Spare Parts",
    description: "Direct inventory of 100% genuine filters, seals, hydraulic oils, steel tracks, and wear parts engineered specifically for heavy duty cycles.",
    turnaround: "Same-Day Dispatch",
    warranty: "100% Genuine OEM Fitment Warranty",
    features: [
      "QR-code authenticated genuine packaging",
      "Pre-bundled 500h / 1000h scheduled service kits",
      "Nationwide express courier fulfillment",
    ],
    is_active: true,
  },
  {
    id: "SRV-5",
    title: "LiveLink Telematics & Smart Fleet Analytics",
    category: "Digital Fleet",
    description: "Real-time IoT cloud tracking for machine location, fuel consumption, operating hours, geo-fencing, and predictive maintenance alerts.",
    turnaround: "Instant Activation",
    warranty: "Active SaaS Subscription Included",
    features: [
      "Mobile app & desktop command dashboard",
      "Critical fault and unauthorized movement SMS alerts",
      "Automated fleet utilization and fuel analytics",
    ],
    is_active: true,
  },
  {
    id: "SRV-6",
    title: "Certified Operator Training & Safety Programs",
    category: "Training & Safety",
    description: "Skill enhancement workshops for operators covering safe machinery handling, fuel economy techniques, and preventive daily checks.",
    turnaround: "Scheduled Batches",
    warranty: "Recognized Industry Operator Certification",
    features: [
      "Hands-on simulator and field driving training",
      "Safety compliance and daily checklist manuals",
      "Certification recognized across major infrastructure projects",
    ],
    is_active: true,
  },
];

export const brandProfileService = {
  // ================= COMPANY INFO =================
  getCompanyInfo() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COMPANY_INFO);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    localStorage.setItem(STORAGE_KEYS.COMPANY_INFO, JSON.stringify(INITIAL_COMPANY_INFO));
    return INITIAL_COMPANY_INFO;
  },

  updateCompanyInfo(updatedInfo) {
    const current = this.getCompanyInfo();
    const merged = { ...current, ...updatedInfo };
    localStorage.setItem(STORAGE_KEYS.COMPANY_INFO, JSON.stringify(merged));
    return merged;
  },

  // ================= BANNERS =================
  getBanners() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BANNERS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(INITIAL_BANNERS));
    return INITIAL_BANNERS;
  },

  addBanner(bannerData) {
    const banners = this.getBanners();
    const newBanner = {
      id: `BAN-${Date.now().toString().slice(-4)}`,
      title: bannerData.title,
      subtitle: bannerData.subtitle || "",
      placement: bannerData.placement || "Hero Banner (Top)",
      badge: bannerData.badge || "Featured",
      link_url: bannerData.link_url || "/crm/quotes",
      image_url:
        bannerData.image_url ||
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80",
      is_active: bannerData.is_active !== undefined ? bannerData.is_active : true,
      order: banners.length + 1,
      created_at: new Date().toISOString(),
    };
    const updated = [newBanner, ...banners];
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(updated));
    return newBanner;
  },

  updateBanner(id, updatedData) {
    const banners = this.getBanners();
    const updated = banners.map((b) => (b.id === id ? { ...b, ...updatedData } : b));
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(updated));
    return updated.find((b) => b.id === id);
  },

  toggleBannerStatus(id) {
    const banners = this.getBanners();
    const updated = banners.map((b) => (b.id === id ? { ...b, is_active: !b.is_active } : b));
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(updated));
    return updated.find((b) => b.id === id);
  },

  deleteBanner(id) {
    const banners = this.getBanners();
    const updated = banners.filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(updated));
    return true;
  },

  // ================= ACHIEVEMENTS =================
  getAchievements() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(INITIAL_ACHIEVEMENTS));
    return INITIAL_ACHIEVEMENTS;
  },

  addAchievement(achData) {
    const achievements = this.getAchievements();
    const newAch = {
      id: `ACH-${Date.now().toString().slice(-4)}`,
      title: achData.title,
      issuing_body: achData.issuing_body,
      year: achData.year || String(new Date().getFullYear()),
      category: achData.category || "Industry Recognition",
      description: achData.description,
      badge_color: achData.badge_color || "emerald",
      created_at: new Date().toISOString(),
    };
    const updated = [newAch, ...achievements];
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(updated));
    return newAch;
  },

  updateAchievement(id, updatedData) {
    const achievements = this.getAchievements();
    const updated = achievements.map((a) => (a.id === id ? { ...a, ...updatedData } : a));
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(updated));
    return updated.find((a) => a.id === id);
  },

  deleteAchievement(id) {
    const achievements = this.getAchievements();
    const updated = achievements.filter((a) => a.id !== id);
    localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(updated));
    return true;
  },

  // ================= SERVICES =================
  getServices() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Fallback
    }
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(INITIAL_SERVICES));
    return INITIAL_SERVICES;
  },

  addService(srvData) {
    const services = this.getServices();
    const newService = {
      id: `SRV-${Date.now().toString().slice(-4)}`,
      title: srvData.title,
      category: srvData.category || "Equipment Services",
      description: srvData.description,
      turnaround: srvData.turnaround || "Standard Turnaround",
      warranty: srvData.warranty || "Standard Terms",
      features: Array.isArray(srvData.features)
        ? srvData.features
        : srvData.features
        ? srvData.features.split("\n").filter(Boolean)
        : [],
      is_active: srvData.is_active !== undefined ? srvData.is_active : true,
      created_at: new Date().toISOString(),
    };
    const updated = [newService, ...services];
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(updated));
    return newService;
  },

  updateService(id, updatedData) {
    const services = this.getServices();
    const updated = services.map((s) => (s.id === id ? { ...s, ...updatedData } : s));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(updated));
    return updated.find((s) => s.id === id);
  },

  toggleServiceStatus(id) {
    const services = this.getServices();
    const updated = services.map((s) => (s.id === id ? { ...s, is_active: !s.is_active } : s));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(updated));
    return updated.find((s) => s.id === id);
  },

  deleteService(id) {
    const services = this.getServices();
    const updated = services.filter((s) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(updated));
    return true;
  },
};

export default brandProfileService;
