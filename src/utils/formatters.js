/**
 * Utility functions for consistent data formatting across the application.
 */

export const formatDate = (dateValue) => {
  if (!dateValue) return "-";
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return String(dateValue);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return String(dateValue || "-");
  }
};

export const formatDateTime = (dateValue) => {
  if (!dateValue) return "-";
  try {
    const d = new Date(dateValue);
    if (isNaN(d.getTime())) return String(dateValue);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return String(dateValue || "-");
  }
};

export const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not specified";
  }
  const num = Number(value);
  if (isNaN(num)) return String(value);
  return `₹${num.toLocaleString("en-IN")}`;
};

export const getInitials = (name = "") => {
  if (!name) return "P";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const titleCase = (value = "") => {
  if (!value) return "";
  return String(value)
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ROLE_DICTIONARY = {
  contractor: "Contractor",
  "builder/developer": "Builder / Developer",
  builder: "Builder",
  developer: "Developer",
  infrastructure_company: "Infrastructure Co.",
  mining_company: "Mining Co.",
  rental_company: "Rental Agency",
  "government/psu": "Govt / PSU",
  "individual/other": "Individual",
};

export const formatRole = (roleValue = "") => {
  if (!roleValue) return "-";
  const key = String(roleValue).toLowerCase().trim();
  return ROLE_DICTIONARY[key] || titleCase(roleValue);
};
