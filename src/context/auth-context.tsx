"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userName: string;
  createdAt: Date | string;
  isAdmin?: boolean;
  adminRole?: string | null;
  usernameChangedAt?: Date | string | null;
  canChangeUsername?: boolean;
  daysRemaining?: number;
  nextAllowedDate?: string | null;
  wallet?: {
    id?: string;
    balance: any;
    currency?: string;
    bankName?: string | null;
    accountNumber?: string | null;
    accountName?: string | null;
    virtualAccountReference?: string | null;
  };
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  setUser: (user: AuthUser | null) => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => null,
  setUser: () => {},
});

export const USER_AUTH_QUERY_KEY = ["auth", "user"];

async function fetchCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/user/getCurrentUser", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (data.success && data.user) {
    return data.user;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const { data: user = null, isLoading: loading } = useQuery({
    queryKey: USER_AUTH_QUERY_KEY,
    queryFn: fetchCurrentUser,
    staleTime: 60 * 1000, // 1 minute
  });

  const refreshUser = async (): Promise<AuthUser | null> => {
    const result = await queryClient.fetchQuery({
      queryKey: USER_AUTH_QUERY_KEY,
      queryFn: fetchCurrentUser,
    });
    return result;
  };

  const setUser = (newUser: AuthUser | null) => {
    queryClient.setQueryData(USER_AUTH_QUERY_KEY, newUser);
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      queryClient.setQueryData(USER_AUTH_QUERY_KEY, null);
      queryClient.removeQueries({ queryKey: USER_AUTH_QUERY_KEY });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
