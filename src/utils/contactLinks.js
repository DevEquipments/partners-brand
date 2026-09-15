/**
 * Contact link helpers for tel, mailto, and WhatsApp links.
 */

export const cleanPhoneNumber = (phone) => {
  if (!phone) return "";
  return String(phone).replace(/\D/g, "");
};

export const getPhoneLink = (phone) => {
  const cleaned = cleanPhoneNumber(phone);
  if (!cleaned) return null;
  return `tel:${cleaned}`;
};

export const getEmailLink = (email, subject = "", body = "") => {
  if (!email) return null;
  const params = new URLSearchParams();
  if (subject) params.append("subject", subject);
  if (body) params.append("body", body);
  const query = params.toString();
  return `mailto:${email}${query ? `?${query}` : ""}`;
};

export const getWhatsAppLink = (phone, text = "") => {
  let cleaned = cleanPhoneNumber(phone);
  if (!cleaned) return null;
  // If 10 digits Indian mobile, prepend 91
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }
  const encodedText = text ? encodeURIComponent(text) : "";
  return `https://wa.me/${cleaned}${encodedText ? `?text=${encodedText}` : ""}`;
};
