// src/store/auth.js — Simple auth state (no external lib needed)
import { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, validate stored token
  useEffect(() => {
    const token = localStorage.getItem("internai_token");
    if (!token) { setLoading(false); return; }
    authApi.me()
      .then((res) => setUser(res.user))
      .catch(() => localStorage.removeItem("internai_token"))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    localStorage.setItem("internai_token", res.token);
    setUser(res.user);
    return res;
  };

  const logout = () => {
    localStorage.removeItem("internai_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
