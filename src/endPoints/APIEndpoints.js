const API_ENDPOINTS = {
  login: {
    url: "/premium-brand-login",
    method: "post",
  },

  register: {
    url: "/premium-brand-register",
    method: "post",
  },

  profile: {
    url: "/profile",
    method: "post",
  },

  logout: {
    url: "/logout",
    method: "post",
  },

  premiumBrandQuotesEnquiry: {
    url: "/premium-brand-quotes-enquiry",
    method: "post",
  },

  getFeatureEquipmentQuotes: {
    url: "/get-feature-equipment-quotes",
    method: "post"
  },
  endPointPremiumBrandsList: {
    url: "get-PremiumBrandsList",
    method: "post",
  },

  update_Profile: {
    url: "update-profile",
    method: "post"
  },

  getDashboardData: {
    url: "get-dashboard-data",
    method: "post"
  }

};

export default API_ENDPOINTS;