/**
 * Equipments Dekho Premium Brand CRM — Access & Eligibility Engine
 *
 * Centralized authorization & assignment eligibility calculations:
 * - canViewRecord(user, role, record)
 * - canUpdateRecord(user, role, record, permission)
 * - canAssignRecord(user, role)
 * - getEligibleAssignees(record, teamMembers, crmType)
 */

import { PERMISSIONS } from "../config/permissions";

/**
 * Checks if a Sub Admin's territories cover the given state and city.
 */
export const checkTerritoryMatch = (territories, state, city) => {
  if (!territories || territories.length === 0) return false;
  if (!state) return true;

  const matchState = territories.find(
    (t) => (t.state || "").toLowerCase() === state.toLowerCase()
  );
  if (!matchState) return false;

  // If no city specified on record or Sub Admin covers all cities in state
  if (!city || !matchState.cities || matchState.cities.length === 0 || matchState.cities.includes("ALL")) {
    return true;
  }

  return matchState.cities.some((c) => c.toLowerCase() === city.toLowerCase());
};

/**
 * Evaluates whether a user can view a given CRM record.
 * Admin: Globally authorized.
 * Sub Admin: Requires appropriate view permission + (ownership OR territory coverage).
 */
export const canViewRecord = (user, role, record) => {
  if (role === "ADMIN" || user?.role?.toUpperCase() === "ADMIN") {
    return true;
  }
  if (!user || !record) return false;

  const permissions = user.permissions || [];

  // Determine required view permission based on record type
  let reqPerm = PERMISSIONS.LEADS_VIEW;
  if (record.type === "customer_enquiry") reqPerm = PERMISSIONS.ENQUIRIES_VIEW;
  if (record.type === "equipment_quote") reqPerm = PERMISSIONS.QUOTES_VIEW;
  if (record.quotation_number) reqPerm = PERMISSIONS.QUOTATIONS_VIEW;

  if (!permissions.includes(reqPerm)) {
    return false;
  }

  // Direct ownership match
  if (record.assigned_to && String(record.assigned_to) === String(user.id)) {
    return true;
  }

  // Territory match
  return checkTerritoryMatch(user.territories, record.state, record.city);
};

/**
 * Evaluates whether a user can update a given CRM record.
 */
export const canUpdateRecord = (user, role, record) => {
  if (role === "ADMIN" || user?.role?.toUpperCase() === "ADMIN") {
    return true;
  }
  if (!user || !record) return false;

  const permissions = user.permissions || [];

  let reqPerm = PERMISSIONS.LEADS_UPDATE;
  if (record.type === "customer_enquiry") reqPerm = PERMISSIONS.ENQUIRIES_UPDATE;
  if (record.type === "equipment_quote") reqPerm = PERMISSIONS.QUOTES_UPDATE;
  if (record.quotation_number) reqPerm = PERMISSIONS.QUOTATIONS_UPDATE;

  if (!permissions.includes(reqPerm)) {
    return false;
  }

  // Sub Admin must own the record or have territory access to update it
  if (record.assigned_to && String(record.assigned_to) === String(user.id)) {
    return true;
  }

  return checkTerritoryMatch(user.territories, record.state, record.city);
};

/**
 * Evaluates assignment eligibility for a record.
 *
 * CRITICAL RULE: Eligibility requires:
 * 1. Active status
 * 2. Territory match (State + City)
 * 3. Operational access (View AND Update permissions for that CRM type):
 *    - Leads: leads:view + leads:update
 *    - Customer Enquiries: enquiries:view + enquiries:update
 *    - Equipment Quotes: quotes:view + quotes:update
 *    - Quotations: quotations:view + quotations:update
 */
export const getEligibleAssignees = (record, teamMembers = [], crmType = null) => {
  if (!record) return [];

  const effectiveType = crmType || record.type || "leads";

  return teamMembers.filter((member) => {
    // 1. Must be active
    if (member.status !== "active") return false;

    const perms = member.permissions || [];

    // 2. Check operational access (view + update)
    if (effectiveType === "customer_enquiry" || effectiveType === "enquiries") {
      const hasEnquiryAccess =
        perms.includes(PERMISSIONS.ENQUIRIES_VIEW) && perms.includes(PERMISSIONS.ENQUIRIES_UPDATE);
      if (!hasEnquiryAccess) return false;
    } else if (effectiveType === "equipment_quote" || effectiveType === "quotes") {
      const hasQuoteAccess =
        perms.includes(PERMISSIONS.QUOTES_VIEW) && perms.includes(PERMISSIONS.QUOTES_UPDATE);
      if (!hasQuoteAccess) return false;
    } else if (effectiveType === "quotations") {
      const hasQuotationAccess =
        perms.includes(PERMISSIONS.QUOTATIONS_VIEW) && perms.includes(PERMISSIONS.QUOTATIONS_UPDATE);
      if (!hasQuotationAccess) return false;
    } else {
      // General Lead
      const hasLeadAccess =
        perms.includes(PERMISSIONS.LEADS_VIEW) && perms.includes(PERMISSIONS.LEADS_UPDATE);
      if (!hasLeadAccess) return false;
    }

    // 3. Check Territory match (State and City)
    return checkTerritoryMatch(member.territories, record.state, record.city);
  });
};
