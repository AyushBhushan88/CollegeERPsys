"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface User {
  id: string;
  email: string;
  role: string;
  tenantId: string;
}

interface AuthContextType {
  user: User | null;
  login: (tenantSlug: string, credentials: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get("token");
      const tenantId = Cookies.get("tenantId");

      if (token && tenantId) {
        try {
          const response = await api.get("/auth/me");
          if (response.data && response.data.status === 'success') {
            setUser(response.data.data);
          } else {
            logout();
          }
        } catch (error) {
          logout();
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (tenantSlug: string, credentials: any) => {
    try {
      const response = await api.post("/auth/login", { ...credentials, tenantSlug }, {
        headers: {
          "x-tenant-id": tenantSlug
        }
      });

      if (response.data && response.data.status === 'success') {
        const { accessToken, user: userData } = response.data.data;
        
        Cookies.set("token", accessToken, { expires: 7 });
        Cookies.set("tenantId", userData.tenantId, { expires: 7 });
        
        setUser(userData);
        router.push("/dashboard");
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove("token");
    Cookies.remove("tenantId");
    setUser(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
