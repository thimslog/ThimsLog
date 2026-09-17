"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  Info,
  ShieldCheck,
  Clock,
  Filter,
  RefreshCw,
  Loader2,
  Inbox,
} from "lucide-react";
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/notifications?limit=100");
      if (!res.ok) throw new Error("Could not load notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    setMarkingId(id);
    try {
      const res = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", id }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        toast.success("Notification marked as read");
      }
    } catch (err) {
      toast.error("Could not update notification");
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      const res = await fetch("/api/user/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });

      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        toast.success("All notifications marked as read");
      }
    } catch (err) {
      toast.error("Failed to mark all notifications as read");
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;
  const filteredNotifications =
    activeTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "TRANSFER_RECEIVED":
        return {
          icon: <ArrowDownLeft size={16} />,
          label: "Money Received",
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        };
      case "TRANSFER_SENT":
        return {
          icon: <ArrowUpRight size={16} />,
          label: "Transfer Sent",
          bg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        };
      case "ORDER_UPDATE":
        return {
          icon: <Package size={16} />,
          label: "Order Alert",
          bg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        };
      default:
        return {
          icon: <Info size={16} />,
          label: "System",
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        };
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>Notification Center</span>
            {unreadCount > 0 && (
              <span className="text-xs font-semibold bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 px-2.5 py-0.5 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Stay updated on transfers, incoming funds and account alerts
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchNotifications}
            disabled={loading}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-glow cursor-pointer disabled:opacity-60"
            >
              {markingAll ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCheck size={15} />
              )}
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("unread")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "unread"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* List Content */}
      {loading ? (
        <div className="p-12 text-center rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02]">
          <Loader2 size={24} className="animate-spin mx-auto text-sky-500 mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Loading notifications...
          </p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="p-16 text-center rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-400">
            <Inbox size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {activeTab === "unread" ? "No unread notifications" : "No notifications yet"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {activeTab === "unread"
              ? "You're all caught up! When you receive money or have order updates, they'll show up here."
              : "When funds are transferred to you or your transactions complete, notifications will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const badge = getTypeBadge(n.type);
            return (
              <div
                key={n.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !n.read
                    ? "bg-sky-50/40 dark:bg-sky-500/[0.04] border-sky-200/80 dark:border-sky-500/20 shadow-xs"
                    : "bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl border flex-shrink-0 ${badge.bg}`}>
                    {badge.icon}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {n.title}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.bg}`}
                      >
                        {badge.label}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-sky-500" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 pt-0.5">
                      <Clock size={12} />
                      <span>{formatDateTime(n.createdAt)}</span>
                    </div>
                  </div>
                </div>

                {!n.read && (
                  <div className="flex items-center justify-end flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMarkAsRead(n.id)}
                      disabled={markingId === n.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/20 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      {markingId === n.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={13} className="text-emerald-500" />
                      )}
                      <span>Mark as read</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
