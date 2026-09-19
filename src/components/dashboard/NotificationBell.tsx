"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api-client";
import {
  Bell,
  Check,
  CheckCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Info,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toast";

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  metadata?: any;
  createdAt: string;
}

export default function NotificationBell() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data, refetch } = useQuery({
    queryKey: ["user", "notifications", 8],
    queryFn: () =>
      apiGet<{ notifications: NotificationItem[]; unreadCount: number }>(
        "/api/user/notifications?limit=8"
      ),
    staleTime: 15 * 1000,
    refetchInterval: 30000,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount ?? notifications.filter((n) => !n.read).length;

  const markReadMutation = useMutation({
    mutationFn: (id: string) =>
      apiMutate("/api/user/notifications", "PATCH", {
        action: "mark_read",
        id,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
    },
    onError: (err) => {
      console.error("Failed to mark notification as read:", err);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () =>
      apiMutate("/api/user/notifications", "PATCH", {
        action: "mark_all_read",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark all as read");
    },
  });

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markReadMutation.mutate(id);
  };

  const handleMarkAllRead = () => {
    if (unreadCount === 0 || markAllReadMutation.isPending) return;
    markAllReadMutation.mutate();
  };

  const formatRelativeTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "TRANSFER_RECEIVED":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ArrowDownLeft size={16} />
          </div>
        );
      case "TRANSFER_SENT":
        return (
          <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
            <ArrowUpRight size={16} />
          </div>
        );
      case "ORDER_UPDATE":
        return (
          <div className="w-8 h-8 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
            <Package size={16} />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Info size={16} />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) refetch();
        }}
        className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer shadow-2xs"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-sky-600 dark:bg-sky-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#060a14] animate-in zoom-in">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Floating Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {markAllReadMutation.isPending ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <CheckCheck size={13} />
                )}
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                <Bell size={24} className="mx-auto mb-2 opacity-40" />
                No notifications yet
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 flex items-start gap-3 transition-colors hover:bg-slate-50/80 dark:hover:bg-white/[0.02] ${
                    !item.read
                      ? "bg-sky-50/40 dark:bg-sky-500/[0.04]"
                      : ""
                  }`}
                >
                  {getNotificationIcon(item.type)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={`text-xs truncate ${
                          !item.read
                            ? "font-bold text-slate-900 dark:text-white"
                            : "font-semibold text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                  </div>

                  {!item.read && (
                    <button
                      type="button"
                      onClick={(e) => handleMarkAsRead(item.id, e)}
                      className="w-5 h-5 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex-shrink-0 cursor-pointer"
                      title="Mark as read"
                    >
                      <Check size={12} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] text-center">
            <Link
              href="/dashboard/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Open Notification Center</span>
              <ExternalLink size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
