import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { getProfile, logoutUser as apiLogout } from "../services/authApi";
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
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));

  // Role detection: Exactly TWO user types: ADMIN and SUB_ADMIN
  const role = useMemo(() => {
    const rawRole = String(user?.role || user?.user_type || "").toUpperCase().trim();
    if (rawRole.includes("SUB")) {
      return "SUB_ADMIN";
    }
    return "ADMIN";
  }, [user]);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await getProfile();
      const profileData = response.data || response.user || response;
      if (profileData && typeof profileData === "object") {
        setUser(profileData);
        localStorage.setItem("user", JSON.stringify(profileData));
        return profileData;
      }
    } catch {
      // If profile fetch fails on a 401, axios interceptor handles redirect
    }
    return null;
  }, []);

  const isDummyEnabled = import.meta.env.VITE_ENABLE_DUMMY_SUB_ADMIN === "true";
  const [isDummySession, setIsDummySession] = useState(
    () => isDummyEnabled && sessionStorage.getItem("is_dummy_sub_admin") === "true"
  );

  // Fetch fresh profile on mount if token exists and not in dummy test mode
  useEffect(() => {
    if (!token || isDummySession) return;

    let isMounted = true;
    const loadProfile = async () => {
      try {
        const response = await getProfile();
        const profileData = response.data || response.user || response;
        if (isMounted && profileData && typeof profileData === "object") {
          setUser(profileData);
          localStorage.setItem("user", JSON.stringify(profileData));
        }
      } catch {
        // If profile fetch fails on a 401, axios interceptor handles redirect
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [token, isDummySession]);

  const login = useCallback((newToken, userData) => {
    sessionStorage.removeItem("is_dummy_sub_admin");
    setIsDummySession(false);
    localStorage.setItem("token", newToken);
    setToken(newToken);
    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      if (!isDummySession) {
        await apiLogout();
      }
      toast.success("Logged out successfully");
    } catch {
      // Even if backend logout fails, clear local session
    } finally {
      sessionStorage.removeItem("is_dummy_sub_admin");
      sessionStorage.removeItem("real_user_backup");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsDummySession(false);
      setToken(null);
      setUser(null);
    }
  }, [isDummySession]);

  // Frontend-only Dummy Sub Admin toggle for testing role-based UI and permissions
  const switchToDummySubAdmin = useCallback(() => {
    if (!isDummyEnabled) return;

    // Backup real user in session storage if available
    const currentUser = localStorage.getItem("user");
    if (currentUser) {
      sessionStorage.setItem("real_user_backup", currentUser);
    }

    const DUMMY_SUB_ADMIN = {
      id: "frontend-test-sub-admin",
      name: "Test Sub Admin",
      username: "subadmin_test",
      email: "subadmin.test@equipmentsdekho.local",
      role: "SUB_ADMIN",
      user_type: "SUB_ADMIN",
      brand_id: user?.brand_id || user?.brand_slug || "frontend-test-brand",
      brand_name: user?.brand_name || "Partner Brand",
      permissions: [
        "dashboard:view",
        "enquiries:view",
        "enquiries:export",
        "quotes:view",
        "profile:view",
      ],
    };

    sessionStorage.setItem("is_dummy_sub_admin", "true");
    setIsDummySession(true);
    setUser(DUMMY_SUB_ADMIN);
    // If not logged in, set a synthetic development token to allow inspecting protected routes
    if (!token) {
      setToken("dev-dummy-token");
    }
    toast.success("Active test session: Dummy Sub Admin mode enabled");
  }, [isDummyEnabled, user, token]);

  const restoreAdminSession = useCallback(async () => {
    sessionStorage.removeItem("is_dummy_sub_admin");
    setIsDummySession(false);
    const backup = sessionStorage.getItem("real_user_backup");
    if (backup) {
      try {
        const parsed = JSON.parse(backup);
        setUser(parsed);
        localStorage.setItem("user", backup);
      } catch {
        // Fallback
      }
      sessionStorage.removeItem("real_user_backup");
    } else {
      await fetchProfile();
    }
    if (token === "dev-dummy-token") {
      setToken(null);
    }
    toast.success("Restored Admin session");
  }, [fetchProfile, token]);

  const value = {
    user,
    token,
    role,
    loading,
    isAuthenticated: Boolean(token),
    isDummyEnabled,
    isDummySession,
    switchToDummySubAdmin,
    restoreAdminSession,
    login,
    logout,
    fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
