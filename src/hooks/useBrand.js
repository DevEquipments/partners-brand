import { useAuth } from "../context/AuthContext";

/**
 * Hook to dynamically resolve the authenticated brand partner identity.
 * Strictly avoids hardcoded brand identifiers.
 */
export const useBrand = () => {
  const { user } = useAuth();

  const brandId =
    user?.brand_id ||
    user?.brand_slug ||
    (user?.brand_name ? String(user.brand_name).toLowerCase().trim().replace(/\s+/g, "-") : "") ||
    "";

  const brandName = user?.brand_name || user?.company_name || user?.name || "Partner";
  const companyName = user?.company_name || "";
  const brandSlug = user?.brand_slug || brandId;

  return {
    brandId,
    brandName,
    companyName,
    brandSlug,
    hasBrand: Boolean(brandId),
  };
};

export default useBrand;
