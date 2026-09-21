"use client";

import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import { useInactivityTimeout } from "@/hooks/useInactivityTimeout";

type AuthAdmin = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userName: string;
  createdAt: Date | string;
  role: string;
};

type AdminAuthContextValue = {
  admin: AuthAdmin | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
};

const AuthContext = createContext<AdminAuthContextValue>({
  admin: null,
  loading: true,
  signOut: async () => {},
  refreshAdmin: async () => {},
});

export const ADMIN_AUTH_QUERY_KEY = ["auth", "admin"];

async function fetchCurrentAdmin(): Promise<AuthAdmin | null> {
  const response = await fetch("/api/admin/getCurrentAdmin", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (data.success && data.admin) {
    return data.admin;
  }
  return null;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: admin = null, isLoading: loading } = useQuery({
    queryKey: ADMIN_AUTH_QUERY_KEY,
    queryFn: fetchCurrentAdmin,
    staleTime: 60 * 1000, // 1 minute
  });

  const refreshAdmin = async () => {
    await queryClient.fetchQuery({
      queryKey: ADMIN_AUTH_QUERY_KEY,
      queryFn: fetchCurrentAdmin,
    });
  };

  const signOut = useCallback(async () => {
    try {
      await fetch("/api/adminAuth/signout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      queryClient.clear();
      queryClient.setQueryData(ADMIN_AUTH_QUERY_KEY, null);
    }
  }, [queryClient]);

  // 15-minute inactivity auto-logout
  const handleInactivityTimeout = useCallback(async () => {
    toast.error("Session expired due to 15 minutes of inactivity.");
    await signOut();
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login?reason=inactivity";
    }
  }, [signOut]);

  useInactivityTimeout({
    isAuthenticated: Boolean(admin),
    onTimeout: handleInactivityTimeout,
    storageKey: "thimslog_admin_last_activity",
    timeoutMs: 15 * 60 * 1000, // 15 minutes
  });

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        signOut,
        refreshAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
