import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile, logoutUser as apiLogout } from '../api/authApi';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getProfile();
      setUser(data.data || data.user || data);
    } catch {
      // If profile fetch fails, token might be invalid
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
  }, []);

  // Auto-fetch profile on mount if token exists
  useEffect(() => {
    if (token) {
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, fetchProfile]);

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    if (userData) {
      setUser(userData);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
      toast.success('Logged out successfully');
    } catch {
      // Even if API fails, clear local state
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
    fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
