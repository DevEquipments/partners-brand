import {
  INITIAL_LEADS,
  INITIAL_CUSTOMERS,
  INITIAL_QUOTATIONS,
  INITIAL_ACTIVITIES,
  INITIAL_SUB_ADMINS,
} from "../../mock/crmInitialData";

/**
 * Equipments Dekho Premium Brand CRM — Local Development Repository
 *
 * Provides a clean Data Access Layer mimicking future REST/GraphQL endpoints:
 * - Leads CRUD & Territory Filtering
 * - Lead Assignment (manual & rule-based)
 * - Customer CRUD & History Aggregation
 * - Quotations Management
 * - Activities Timeline Logging
 * - Sub Admins & Territory Mapping
 */

const STORAGE_KEYS = {
  LEADS: "crm_leads_data_v2",
  CUSTOMERS: "crm_customers_data_v2",
  QUOTATIONS: "crm_quotations_data_v2",
  ACTIVITIES: "crm_activities_data_v2",
  SUB_ADMINS: "crm_sub_admins_data_v2",
};

const getStored = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const setStored = (key, val) => {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // quota exceeded fallback
  }
};

export const leadRepository = {
  async getAll() {
    return getStored(STORAGE_KEYS.LEADS, INITIAL_LEADS);
  },

  async getById(id) {
    const leads = await this.getAll();
    return leads.find((l) => String(l.id) === String(id)) || null;
  },

  async update(id, updates) {
    const leads = await this.getAll();
    const index = leads.findIndex((l) => String(l.id) === String(id));
    if (index === -1) throw new Error("Lead not found");
    const updated = { ...leads[index], ...updates, updated_at: new Date().toISOString() };
    leads[index] = updated;
    setStored(STORAGE_KEYS.LEADS, leads);
    return updated;
  },

  async create(leadData) {
    const leads = await this.getAll();
    const newLead = {
      id: `lead-${Date.now()}`,
      lead_code: `LEAD-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
      pipeline_stage: "new",
      status: "new",
      priority: "warm",
      ...leadData,
    };
    leads.unshift(newLead);
    setStored(STORAGE_KEYS.LEADS, leads);
    return newLead;
  },

  async assign(id, subAdminId, subAdminName) {
    return this.update(id, {
      assigned_to: subAdminId,
      assigned_name: subAdminName,
      pipeline_stage: "assigned",
    });
  },

  async updateFollowup(id, { next_followup_at, next_followup_notes }) {
    return this.update(id, { next_followup_at, next_followup_notes });
  },

  async resetToDefault() {
    setStored(STORAGE_KEYS.LEADS, INITIAL_LEADS);
    return INITIAL_LEADS;
  },
};

export const customerRepository = {
  async getAll() {
    return getStored(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },

  async getById(id) {
    const customers = await this.getAll();
    return customers.find((c) => String(c.id) === String(id)) || null;
  },

  async getCustomerWithHistory(id) {
    const customer = await this.getById(id);
    if (!customer) return null;

    const allLeads = await leadRepository.getAll();
    const customerLeads = allLeads.filter(
      (l) => String(l.customer_id) === String(id) || l.phone === customer.phone
    );

    const allQuotations = await quotationRepository.getAll();
    const customerQuotations = allQuotations.filter(
      (q) => String(q.customer_id) === String(id) || q.phone === customer.phone
    );

    return {
      ...customer,
      leads: customerLeads,
      quotations: customerQuotations,
    };
  },
};

export const quotationRepository = {
  async getAll() {
    return getStored(STORAGE_KEYS.QUOTATIONS, INITIAL_QUOTATIONS);
  },

  async getById(id) {
    const quotes = await this.getAll();
    return quotes.find((q) => String(q.id) === String(id)) || null;
  },

  async create(quotationData) {
    const quotes = await this.getAll();
    const newQuote = {
      id: `qtn-${Date.now()}`,
      quotation_number: `QTN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      created_at: new Date().toISOString(),
      status: "draft",
      ...quotationData,
    };
    quotes.unshift(newQuote);
    setStored(STORAGE_KEYS.QUOTATIONS, quotes);
    return newQuote;
  },

  async updateStatus(id, newStatus) {
    const quotes = await this.getAll();
    const index = quotes.findIndex((q) => String(q.id) === String(id));
    if (index === -1) throw new Error("Quotation not found");
    quotes[index] = { ...quotes[index], status: newStatus, updated_at: new Date().toISOString() };
    setStored(STORAGE_KEYS.QUOTATIONS, quotes);
    return quotes[index];
  },
};

export const activityRepository = {
  async getAll() {
    return getStored(STORAGE_KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
  },

  async getForLead(leadId) {
    const activities = await this.getAll();
    return activities
      .filter((a) => String(a.lead_id) === String(leadId))
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async add(activityData) {
    const activities = await this.getAll();
    const newActivity = {
      id: `act-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...activityData,
    };
    activities.unshift(newActivity);
    setStored(STORAGE_KEYS.ACTIVITIES, activities);
    return newActivity;
  },
};

export const teamRepository = {
  async getAll() {
    return getStored(STORAGE_KEYS.SUB_ADMINS, INITIAL_SUB_ADMINS);
  },

  async getById(id) {
    const team = await this.getAll();
    return team.find((u) => String(u.id) === String(id)) || null;
  },

  async update(id, updates) {
    const team = await this.getAll();
    const index = team.findIndex((u) => String(u.id) === String(id));
    if (index === -1) throw new Error("Member not found");
    team[index] = { ...team[index], ...updates };
    setStored(STORAGE_KEYS.SUB_ADMINS, team);
    return team[index];
  },

  async create(memberData) {
    const team = await this.getAll();
    const newMember = {
      id: `sa-${Date.now()}`,
      role: "SUB_ADMIN",
      status: "active",
      created_at: new Date().toISOString(),
      ...memberData,
    };
    team.push(newMember);
    setStored(STORAGE_KEYS.SUB_ADMINS, team);
    return newMember;
  },

  async toggleStatus(id) {
    const team = await this.getAll();
    const index = team.findIndex((u) => String(u.id) === String(id));
    if (index === -1) throw new Error("Member not found");
    const newStatus = team[index].status === "active" ? "inactive" : "active";
    team[index] = { ...team[index], status: newStatus, updated_at: new Date().toISOString() };
    setStored(STORAGE_KEYS.SUB_ADMINS, team);
    return team[index];
  },

  async delete(id) {
    const team = await this.getAll();
    const filtered = team.filter((u) => String(u.id) !== String(id));
    setStored(STORAGE_KEYS.SUB_ADMINS, filtered);
    return true;
  },
};
