import React, { createContext, useContext, useState, useCallback } from "react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("mhc_user");
    return stored ? JSON.parse(stored) : null;
  });

  // Base URL for your FastAPI auth endpoints
  const API_BASE_URL = "http://127.0.0.1:8000/api/auth";

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Invalid email or password");
    }

    const realUser: User = await response.json();
    setUser(realUser);
    localStorage.setItem("mhc_user", JSON.stringify(realUser));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Registration failed");
    }

    const realUser: User = await response.json();
    setUser(realUser);
    localStorage.setItem("mhc_user", JSON.stringify(realUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("mhc_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};