"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth, USER_AUTH_QUERY_KEY } from "@/context/auth-context";
import { toast } from "@/components/ui/toast";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  joinTicket: (ticketId: string) => void;
  leaveTicket: (ticketId: string) => void;
  joinAdmin: () => void;
  leaveAdmin: () => void;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  joinTicket: () => {},
  leaveTicket: () => {},
  joinAdmin: () => {},
  leaveAdmin: () => {},
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const activeUserRef = useRef<string | null>(null);

  useEffect(() => {
    // Connect to Socket.IO server
    const socketInstance = io({
      path: "/api/socket/io",
      autoConnect: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      // If user is already loaded, join user room immediately
      if (activeUserRef.current) {
        socketInstance.emit("join_user", activeUserRef.current);
      }
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
    });

    // Real-time Wallet Balance Listener
    socketInstance.on("wallet:balance_updated", (payload: {
      userId: string;
      balance: number;
      currency?: string;
      delta?: number;
      reason?: string;
    }) => {
      if (!payload) return;

      // Update auth user cache directly in TanStack React Query
      queryClient.setQueryData(USER_AUTH_QUERY_KEY, (prevUser: any) => {
        if (!prevUser) return prevUser;
        return {
          ...prevUser,
          wallet: {
            ...prevUser.wallet,
            balance: payload.balance,
            currency: payload.currency || prevUser.wallet?.currency || "NGN",
          },
        };
      });

      // Invalidate specific wallet queries
      queryClient.invalidateQueries({ queryKey: ["wallet", "virtual-account"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["inventory", "product"] });

      // Notify user if wallet was credited
      if (typeof payload.delta === "number" && payload.delta > 0) {
        const formattedDelta = Number(payload.delta).toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        toast.success(
          payload.reason || `Wallet credited with ₦${formattedDelta}! Balance updated live.`
        );
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [queryClient]);

  // Sync user room when user signs in or out
  useEffect(() => {
    activeUserRef.current = user?.id || null;
    if (socket && isConnected) {
      if (user?.id) {
        socket.emit("join_user", user.id);
      }
    }
  }, [user?.id, socket, isConnected]);

  const joinTicket = useCallback(
    (ticketId: string) => {
      if (socket && ticketId) {
        socket.emit("join_ticket", ticketId);
      }
    },
    [socket]
  );

  const leaveTicket = useCallback(
    (ticketId: string) => {
      if (socket && ticketId) {
        socket.emit("leave_ticket", ticketId);
      }
    },
    [socket]
  );

  const joinAdmin = useCallback(() => {
    if (socket) {
      socket.emit("join_admin");
    }
  }, [socket]);

  const leaveAdmin = useCallback(() => {
    if (socket) {
      socket.emit("leave_admin");
    }
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinTicket,
        leaveTicket,
        joinAdmin,
        leaveAdmin,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
