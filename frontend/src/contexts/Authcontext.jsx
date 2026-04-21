import { createContext, useContext, useState, useCallback, useEffect } from "react";
import ApiService from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    ApiService.getProfile()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async ({ email, mat_khau }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.login({ email, mat_khau });
      localStorage.setItem("token", res.token);
      setUser(res.user);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Đăng nhập thất bại");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiService.register(data);
      localStorage.setItem("token", res.token);
      setUser(res.user);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Đăng ký thất bại");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}