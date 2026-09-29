import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { getProfile, logoutUser as apiLogout } from "../services/authApi";
import { ROLES, normalizeUserType, isValidRole } from "../utils/roleUtils";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  // Restore stored session and validate normalized role
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      if (!parsed || typeof parsed !== "object") return null;

      // Validate that stored session contains a recognized role/user_type
      const normalizedRole = normalizeUserType(parsed.user_type || parsed.role);
      if (!normalizedRole) {
        // Unknown or missing role: prevent unauthorized access
        localStorage.removeItem("user");
        return null;
      }

      return {
        ...parsed,
        role: normalizedRole,
        user_type: parsed.user_type || (normalizedRole === ROLES.ADMIN ? "admin" : "sub_admin"),
      };
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  // Loading state prevents layout and protected route flash
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));

  // Canonical normalized role: strictly ADMIN | SUB_ADMIN | null
  const role = useMemo(() => {
    return normalizeUserType(user?.user_type || user?.role);
  }, [user]);

  const isAdmin = role === ROLES.ADMIN;
  const isSubAdmin = role === ROLES.SUB_ADMIN;
  const isAuthenticated = Boolean(token && role && isValidRole(role));

  // Merge profile response safely without wiping backend user_type or role
  const fetchProfile = useCallback(async () => {
    if (!token) return null;

    try {
      const response = await getProfile();
      const profileData = response?.data || response?.user || response;

      if (profileData && typeof profileData === "object") {
        setUser((prev) => {
          const rawType = profileData.user_type || prev?.user_type;
          const assignedRole = normalizeUserType(rawType || profileData.role || prev?.role);

          const merged = {
            ...(prev || {}),
            ...profileData,
            user_type: rawType || (assignedRole === ROLES.ADMIN ? "admin" : "sub_admin"),
            role: assignedRole,
          };

          try {
            localStorage.setItem("user", JSON.stringify(merged));
          } catch {
            // Storage quota handled safely
          }
          return merged;
        });
        return profileData;
      }
    } catch {
      // 401 is handled by axios interceptor
    }
    return null;
  }, [token]);

  // Validate session on mount if token exists
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const initSession = async () => {
      try {
        await fetchProfile();
      } catch {
        // Interceptor handles session expiry
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initSession();

    return () => {
      isMounted = false;
    };
  }, [token, fetchProfile]);

  /**
   * Complete login handler
   *
   * Accepts:
   * - newToken: string
   * - userData: object ({ id, brand_id, brand_name, username, ... })
   * - explicitUserType: optional string ("admin" | "sub_admin")
   */
  const login = useCallback((newToken, userData = {}, explicitUserType = null) => {
    if (!newToken) {
      throw new Error("Authentication token is required.");
    }

    const candidateType = explicitUserType || userData?.user_type || userData?.role;
    const normalizedRole = normalizeUserType(candidateType);

    if (!normalizedRole) {
      throw new Error("Unable to authenticate: missing or unsupported account role.");
    }

    const canonicalUser = {
      ...(userData || {}),
      user_type: candidateType ? String(candidateType).trim().toLowerCase() : (normalizedRole === ROLES.ADMIN ? "admin" : "sub_admin"),
      role: normalizedRole,
    };

    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(canonicalUser));

    setToken(newToken);
    setUser(canonicalUser);
    setLoading(false);
  }, []);

  /**
   * Complete logout handler
   * Clears API session, localStorage, and resets auth state
   */
  const logout = useCallback(async () => {
    try {
      await apiLogout();
      toast.success("Logged out successfully");
    } catch {
      // Clear local session even if server logout request fails
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      try {
        sessionStorage.clear();
      } catch {
        // Safari private mode safe
      }
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    token,
    role,
    isAdmin,
    isSubAdmin,
    loading,
    isAuthenticated,
    login,
    logout,
    fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
