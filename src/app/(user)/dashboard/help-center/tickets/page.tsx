"use client";

import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { useSocket } from "@/context/socket-context";
import Link from "next/link";
import {
  Plus,
  Loader2,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  LifeBuoy,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

interface TicketResponseItem {
  id: string;
  senderType: string;
  senderName: string | null;
  message: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  responses?: TicketResponseItem[];
}

export default function UserTicketsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();

  const {
    data,
    isLoading: loading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["tickets", "user"],
    queryFn: () =>
      apiGet<{ success: boolean; data: SupportTicket[] }>("/api/user/tickets"),
    staleTime: 30 * 1000,
  });

  const tickets = data?.data || [];

  // Real-time socket event listeners for tickets list
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleTicketUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", "user"] });
    };

    socket.on("ticket:reply", handleTicketUpdate);
    socket.on("ticket:created", handleTicketUpdate);
    socket.on("ticket:status_changed", handleTicketUpdate);

    return () => {
      socket.off("ticket:reply", handleTicketUpdate);
      socket.off("ticket:created", handleTicketUpdate);
      socket.off("ticket:status_changed", handleTicketUpdate);
    };
  }, [socket, isConnected, queryClient]);

  const handleRefresh = async () => {
    await refetch();
    toast.success("Tickets updated!");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
            <Clock size={12} />
            <span>Open</span>
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
            <CheckCircle2 size={12} />
            <span>Resolved</span>
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/10">
            <XCircle size={12} />
            <span>Closed</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400">
            Urgent
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
            High
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400">
            Medium
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400">
            Low
          </span>
        );
    }
  };

  const filtered = tickets.filter((t) => {
    if (statusFilter === "ALL") return true;
    return t.status === statusFilter;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header with Title, Refresh and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/help-center"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            ← Help Center
          </Link>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Support Tickets
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || isRefetching}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0b101b] hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Check for agent responses"
          >
            <RefreshCw
              size={14}
              className={`text-slate-500 dark:text-slate-400 ${
                loading || isRefetching ? "animate-spin text-[#7c3aed]" : ""
              }`}
            />
            <span>Refresh</span>
          </button>

          <Link
            href="/dashboard/help-center/tickets/create"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold shadow-md shadow-[#7c3aed]/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Open Ticket</span>
          </Link>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 dark:bg-white/5 rounded-2xl w-fit border border-slate-200/60 dark:border-white/10 text-xs font-semibold">
        {[
          { id: "ALL", label: "All Tickets" },
          { id: "OPEN", label: "Open" },
          { id: "RESOLVED", label: "Resolved" },
          { id: "CLOSED", label: "Closed" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
              statusFilter === tab.id
                ? "bg-white dark:bg-[#0b101b] text-slate-900 dark:text-white shadow-xs font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 size={22} className="animate-spin text-[#7c3aed]" />
            <span className="text-sm font-medium">Loading your tickets...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-[#0b101b] border border-slate-200/80 dark:border-white/10 p-12 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-[#7c3aed] dark:text-purple-400 flex items-center justify-center mx-auto">
            <MessageSquare size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {statusFilter === "ALL"
                ? "No support tickets yet"
                : `No ${statusFilter.toLowerCase()} tickets`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Need assistance with an order, account or wallet balance? Open a ticket and our support team will respond quickly.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard/help-center/tickets/create"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6d28d9] transition-colors cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Your First Ticket</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket) => {
            const replyCount = ticket.responses?.length || 0;
            return (
              <Link
                key={ticket.id}
                href={`/dashboard/help-center/tickets/${ticket.id}`}
                className="group block rounded-2xl bg-white dark:bg-[#0b101b] border border-slate-200/80 dark:border-white/10 p-5 shadow-xs hover:border-[#7c3aed]/50 dark:hover:border-purple-500/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        {new Date(ticket.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="text-[15px] font-bold text-slate-900 dark:text-white group-hover:text-[#7c3aed] dark:group-hover:text-purple-300 transition-colors truncate">
                      {ticket.subject}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {ticket.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-center">
                    {replyCount > 0 && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                        <MessageSquare size={13} className="text-[#7c3aed]" />
                        <span>{replyCount}</span>
                      </span>
                    )}

                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 group-hover:bg-purple-50 dark:group-hover:bg-purple-500/10 text-slate-400 group-hover:text-[#7c3aed] dark:group-hover:text-purple-300 flex items-center justify-center transition-colors">
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
