"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api-client";
import {
  Search,
  RefreshCw,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
  ShieldCheck,
  Send,
  X,
  Loader2,
  ExternalLink,
  Wallet,
  Mail,
  Phone,
  Filter,
} from "lucide-react";

import { useAdminPage } from "@/context/admin-page-context";
import { StatusPill } from "@/components/admin/status-pill";
import { toast } from "@/components/ui/toast";
import { useSocket } from "@/context/socket-context";

const PAGE_SIZE = 10;

interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userName: string;
  phoneNumber?: string;
  wallet?: {
    balance: number | string;
    currency: string;
  };
}

interface TicketResponse {
  id: string;
  ticketId: string;
  senderType: "USER" | "ADMIN";
  senderName: string | null;
  message: string;
  createdAt: string;
}

interface TicketRecord {
  id: string;
  userId: string;
  subject: string;
  message: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  responseCount: number;
  user?: UserInfo;
  responses?: TicketResponse[];
}

interface Metrics {
  total: number;
  open: number;
  resolved: number;
  closed: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

function AdminTicketsContent() {
  const { setPageTitle } = useAdminPage();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { socket, joinAdmin, leaveAdmin, joinTicket, leaveTicket, isConnected } = useSocket();

  const initialPage = Math.max(Number(searchParams.get("page")) || 1, 1);
  const initialStatus = searchParams.get("status") || "ALL";
  const initialPriority = searchParams.get("priority") || "ALL";
  const initialSearch = searchParams.get("search") || "";

  const [page, setPage] = useState(initialPage);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [priorityFilter, setPriorityFilter] = useState(initialPriority);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);

  // Selected Ticket for View / Reply Modal
  const [selectedTicket, setSelectedTicket] = useState<TicketRecord | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [adminReply, setAdminReply] = useState("");
  const [replyStatus, setReplyStatus] = useState<string>("KEEP");

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Join admin ticket room for real-time updates
  useEffect(() => {
    joinAdmin();
    return () => {
      leaveAdmin();
    };
  }, [joinAdmin, leaveAdmin]);

  // Join active modal ticket room
  useEffect(() => {
    if (selectedTicket?.id) {
      joinTicket(selectedTicket.id);
      return () => {
        leaveTicket(selectedTicket.id);
      };
    }
  }, [selectedTicket?.id, joinTicket, leaveTicket]);

  // Socket.IO Real-Time Listeners
  useEffect(() => {
    if (!socket) return;

    const handleTicketReply = (payload: {
      ticketId: string;
      reply: TicketResponse;
      status?: string;
    }) => {
      // Invalidate tickets list to keep counts / latest reply fresh
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });

      // If active modal is viewing this ticket, append reply immediately
      if (selectedTicket && selectedTicket.id === payload.ticketId && payload.reply) {
        setSelectedTicket((prev) => {
          if (!prev) return prev;
          const currentResponses: TicketResponse[] = prev.responses || [];
          if (currentResponses.some((r) => r.id === payload.reply.id)) {
            return prev;
          }
          return {
            ...prev,
            status: (payload.status as any) || prev.status,
            responses: [...currentResponses, payload.reply],
            responseCount: (prev.responseCount || 0) + 1,
          };
        });
      }

      if (payload.reply?.senderType === "USER") {
        toast.info(`New user reply on ticket #${payload.ticketId.slice(-6)}`);
      }
    };

    const handleTicketCreated = (payload: { ticket: any }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      toast.info(`New support ticket: ${payload.ticket?.subject || "New Inquiry"}`);
    };

    const handleTicketStatusChanged = (payload: {
      ticketId: string;
      status: "OPEN" | "RESOLVED" | "CLOSED";
    }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });

      if (selectedTicket && selectedTicket.id === payload.ticketId) {
        setSelectedTicket((prev) =>
          prev ? { ...prev, status: payload.status } : null
        );
      }
    };

    socket.on("ticket:reply", handleTicketReply);
    socket.on("ticket:created", handleTicketCreated);
    socket.on("ticket:status_changed", handleTicketStatusChanged);

    return () => {
      socket.off("ticket:reply", handleTicketReply);
      socket.off("ticket:created", handleTicketCreated);
      socket.off("ticket:status_changed", handleTicketStatusChanged);
    };
  }, [socket, selectedTicket, queryClient]);

  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(PAGE_SIZE),
  });
  if (statusFilter !== "ALL") queryParams.append("status", statusFilter);
  if (priorityFilter !== "ALL") queryParams.append("priority", priorityFilter);
  if (debouncedSearch.trim()) queryParams.append("search", debouncedSearch.trim());

  const {
    data: rawData,
    isLoading: loading,
    isRefetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: [
      "admin",
      "tickets",
      page,
      statusFilter,
      priorityFilter,
      debouncedSearch,
    ],
    queryFn: () =>
      apiGet<{
        success: boolean;
        data: {
          tickets: TicketRecord[];
          metrics: Metrics;
          pagination: Pagination;
        };
      }>(`/api/admin/tickets?${queryParams.toString()}`),
    staleTime: 30 * 1000,
  });

  const tickets = rawData?.data?.tickets || [];
  const metrics = rawData?.data?.metrics || null;
  const pagination = rawData?.data?.pagination || null;
  const error = queryError ? (queryError as any).message || "Failed to load tickets" : "";

  useEffect(() => {
    setPageTitle({
      title: "Support Tickets",
      subtitle: metrics
        ? `${metrics.open} open tickets requiring response`
        : "Manage user support inquiries and tickets",
    });
  }, [setPageTitle, metrics]);

  // Quick status change mutation
  const statusMutation = useMutation({
    mutationFn: ({ ticketId, newStatus }: { ticketId: string; newStatus: string }) =>
      apiMutate<{ success: boolean; message?: string }>(
        `/api/admin/tickets/${ticketId}`,
        "PATCH",
        { status: newStatus }
      ),
    onSuccess: (data, { ticketId, newStatus }) => {
      toast.success(`Ticket marked as ${newStatus}`);
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev) =>
          prev ? { ...prev, status: newStatus as any } : null
        );
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update ticket status");
    },
  });

  // Admin reply mutation
  const replyMutation = useMutation({
    mutationFn: ({
      ticketId,
      message,
      status,
    }: {
      ticketId: string;
      message: string;
      status: string;
    }) =>
      apiMutate<{ success: boolean; message?: string }>(
        `/api/admin/tickets/${ticketId}/reply`,
        "POST",
        { message, status }
      ),
    onSuccess: async (data, { ticketId, status }) => {
      toast.success(`Response sent & ticket marked as ${status}!`);
      setAdminReply("");
      queryClient.invalidateQueries({ queryKey: ["admin", "tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });

      // Refresh modal ticket
      try {
        const updated = await apiGet<{ success: boolean; data: TicketRecord }>(
          `/api/admin/tickets/${ticketId}`
        );
        if (updated.success) {
          setSelectedTicket(updated.data);
        }
      } catch (err) {
        console.error("Failed to re-fetch ticket detail:", err);
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to send response");
    },
  });

  // Open modal with full ticket detail
  const openTicketModal = async (ticketSummary: TicketRecord) => {
    setSelectedTicket(ticketSummary);
    setAdminReply("");
    setReplyStatus("KEEP");
    setModalLoading(true);

    try {
      const res = await apiGet<{ success: boolean; data: TicketRecord }>(
        `/api/admin/tickets/${ticketSummary.id}`
      );
      if (res.success) {
        setSelectedTicket(res.data);
      }
    } catch (err) {
      console.error("Failed to load full ticket details:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleQuickStatusChange = (ticketId: string, newStatus: string) => {
    statusMutation.mutate({ ticketId, newStatus });
  };

  const handleAdminReplySubmit = (e: React.FormEvent, customStatus?: string) => {
    e.preventDefault();
    if (!selectedTicket || !adminReply.trim()) {
      toast.error("Please enter a response message");
      return;
    }

    const finalStatus =
      customStatus ||
      (replyStatus === "KEEP" ? selectedTicket.status : replyStatus) ||
      selectedTicket.status;

    replyMutation.mutate({
      ticketId: selectedTicket.id,
      message: adminReply.trim(),
      status: finalStatus,
    });
  };

  const sendingReply = replyMutation.isPending;
  const updatingStatus = statusMutation.isPending;

  // Live search input
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      const clean = val.trim();
      setDebouncedSearch(clean);
      setPage(1);

      const params = new URLSearchParams();
      if (clean) params.set("search", clean);
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (priorityFilter !== "ALL") params.set("priority", priorityFilter);

      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`);
    }, 350);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage === page || newPage < 1) return;
    if (pagination && newPage > pagination.totalPages) return;
    setPage(newPage);

    const params = new URLSearchParams();
    if (newPage > 1) params.set("page", String(newPage));
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter !== "ALL") params.set("status", statusFilter);
    if (priorityFilter !== "ALL") params.set("priority", priorityFilter);

    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ""}`);
  };

  const getStatusPillTone = (status: string) => {
    switch (status) {
      case "OPEN":
        return "warn";
      case "RESOLVED":
        return "good";
      case "CLOSED":
        return "neutral";
      default:
        return "neutral";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20">
            URGENT
          </span>
        );
      case "HIGH":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-500/20">
            HIGH
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-500/20">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/10">
            LOW
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Stat Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Open Inquiries */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Open Tickets
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {metrics?.open ?? 0}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Awaiting admin reply
            </p>
          </div>
        </div>

        {/* Resolved Tickets */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Resolved
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {metrics?.resolved ?? 0}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Successfully answered
            </p>
          </div>
        </div>

        {/* Closed Tickets */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Closed
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 flex items-center justify-center">
              <XCircle size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {metrics?.closed ?? 0}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Archived tickets
            </p>
          </div>
        </div>

        {/* Total Inquiries */}
        <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Inquiries
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-[#7c3aed] dark:text-purple-400 flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {metrics?.total ?? 0}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              All time submitted
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#0b101b] p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center flex-wrap gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200/80 dark:border-white/10 text-xs font-semibold">
          {[
            { id: "ALL", label: "All" },
            { id: "OPEN", label: "Open" },
            { id: "RESOLVED", label: "Resolved" },
            { id: "CLOSED", label: "Closed" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-white dark:bg-[#0b101b] text-slate-900 dark:text-white shadow-xs font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Priority Controls */}
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          {/* Priority dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            aria-label="Filter tickets by priority"
            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b101b] text-slate-700 dark:text-slate-300 outline-none cursor-pointer shrink-0"
          >
            <option value="ALL">All Priority</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Search box */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search subject, customer or message..."
              className="w-full pl-8.5 pr-8 py-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-sky-600 dark:focus:border-sky-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearch("");
                  setPage(1);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Refresh button */}
          <button
            type="button"
            onClick={async () => {
              await refetch();
              toast.success("Tickets refreshed");
            }}
            disabled={loading || isRefetching}
            className="p-2 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
            title="Refresh tickets"
          >
            <RefreshCw
              size={14}
              className={loading || isRefetching ? "animate-spin text-sky-600" : ""}
            />
          </button>
        </div>
      </div>

      {/* Tickets Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
              <tr className="text-[11.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                <th className="px-5 py-3.5">Ticket / Subject</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Replies</th>
                <th className="px-5 py-3.5">Created</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 size={18} className="animate-spin text-sky-600" />
                      <span>Loading support tickets...</span>
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-14 text-center text-slate-400">
                    No support tickets found matching your filter.
                  </td>
                </tr>
              ) : (
                tickets.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors"
                  >
                    {/* Subject */}
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => openTicketModal(t)}
                        className="text-left group cursor-pointer block max-w-xs"
                      >
                        <span className="font-bold text-[13px] text-slate-900 dark:text-white group-hover:text-[#7c3aed] dark:group-hover:text-purple-300 transition-colors line-clamp-1">
                          {t.subject}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          #{t.id.slice(0, 8)}
                        </span>
                      </button>
                    </td>

                    {/* Customer Info */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[11px] font-bold shrink-0">
                          {t.user?.firstName?.[0] || "U"}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={t.user ? `/admin/users/${t.user.id}` : "#"}
                            className="font-semibold text-slate-900 dark:text-white hover:text-sky-600 transition-colors block truncate max-w-[130px]"
                          >
                            {t.user
                              ? `${t.user.firstName} ${t.user.lastName}`.trim()
                              : "User"}
                          </Link>
                          <span className="text-[11px] text-slate-400 font-mono block truncate max-w-[130px]">
                            {t.user?.email || "No email"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-3.5">{getPriorityBadge(t.priority)}</td>

                    {/* Status with Quick Toggle Dropdown */}
                    <td className="px-5 py-3.5">
                      <select
                        value={t.status}
                        onChange={(e) => handleQuickStatusChange(t.id, e.target.value)}
                        disabled={updatingStatus}
                        aria-label={`Change status for ticket ${t.id.slice(0, 8)}`}
                        className="px-2.5 py-1 text-[11.5px] font-bold rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b101b] text-slate-800 dark:text-slate-200 outline-none cursor-pointer hover:border-slate-300"
                      >
                        <option value="OPEN">Open</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>

                    {/* Replies count */}
                    <td className="px-5 py-3.5 font-mono">
                      <span className="inline-flex items-center gap-1 text-[11.5px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                        <MessageSquare size={11} className="text-sky-600" />
                        <span>{t.responseCount}</span>
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11.5px]">
                      {new Date(t.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Action Button */}
                    <td className="px-5 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openTicketModal(t)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7c3aed]/10 text-[#7c3aed] dark:text-purple-300 hover:bg-[#7c3aed]/20 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <MessageSquare size={12} />
                        <span>Respond</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pagination Footer */}
      {!loading && pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} tickets)
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={!pagination.hasPreviousPage}
              onClick={() => handlePageChange(page - 1)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={14} />
              <span>Previous</span>
            </button>

            <button
              type="button"
              disabled={!pagination.hasNextPage}
              onClick={() => handlePageChange(page + 1)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-white/5 disabled:opacity-40 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* TICKET DETAIL & REPLY MODAL */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="w-full max-w-3xl rounded-3xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    #{selectedTicket.id.slice(0, 8)}
                  </span>
                  {getPriorityBadge(selectedTicket.priority)}
                  <span className="text-xs text-slate-400">
                    Opened {new Date(selectedTicket.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {selectedTicket.subject}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Status Switcher in Modal */}
                <select
                  value={selectedTicket.status}
                  onChange={(e) =>
                    handleQuickStatusChange(selectedTicket.id, e.target.value)
                  }
                  aria-label="Change ticket status in detail modal"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b101b] text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <option value="OPEN">Status: Open</option>
                  <option value="RESOLVED">Status: Resolved</option>
                  <option value="CLOSED">Status: Closed</option>
                </select>

                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Customer Snapshot Bar */}
            {selectedTicket.user && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-500/20 text-[#7c3aed] flex items-center justify-center font-bold">
                    {selectedTicket.user.firstName?.[0] || "U"}
                  </div>
                  <div>
                    <Link
                      href={`/admin/users/${selectedTicket.user.id}`}
                      className="font-bold text-slate-900 dark:text-white hover:text-sky-600"
                    >
                      {selectedTicket.user.firstName} {selectedTicket.user.lastName} (@{selectedTicket.user.userName})
                    </Link>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {selectedTicket.user.email} {selectedTicket.user.phoneNumber ? `• ${selectedTicket.user.phoneNumber}` : ""}
                    </p>
                  </div>
                </div>

                {selectedTicket.user.wallet && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono font-bold">
                    <Wallet size={13} />
                    <span>Balance: ₦{Number(selectedTicket.user.wallet.balance).toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}

            {/* Thread History */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {/* Initial Customer Message */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <UserIcon size={14} className="text-slate-500" />
                    <span>Customer Opening Issue</span>
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {new Date(selectedTicket.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {selectedTicket.message}
                </p>
              </div>

              {/* Follow-up Replies */}
              {selectedTicket.responses?.map((r) => {
                const isAdmin = r.senderType === "ADMIN";
                return (
                  <div
                    key={r.id}
                    className={`p-4 rounded-2xl space-y-1.5 ${
                      isAdmin
                        ? "bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-500/20"
                        : "bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-bold flex items-center gap-1.5 ${
                          isAdmin
                            ? "text-[#7c3aed] dark:text-purple-300"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {isAdmin ? <ShieldCheck size={15} /> : <UserIcon size={14} />}
                        <span>{isAdmin ? "Admin Response" : "Customer Reply"}</span>
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(r.createdAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p
                      className={`text-sm leading-relaxed whitespace-pre-wrap ${
                        isAdmin
                          ? "text-purple-950 dark:text-purple-100"
                          : "text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      {r.message}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Admin Response Form */}
            <form onSubmit={handleAdminReplySubmit} className="pt-2 border-t border-slate-100 dark:border-white/5 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Write Support Response
              </label>

              <textarea
                rows={3}
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                placeholder="Type your official response to the customer..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all resize-y min-h-[90px]"
                required
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">After sending:</span>
                  <select
                    value={replyStatus}
                    onChange={(e) => setReplyStatus(e.target.value)}
                    aria-label="Action status after sending ticket reply"
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="KEEP">
                      Keep Current ({selectedTicket.status})
                    </option>
                    <option value="OPEN">Mark as Open</option>
                    <option value="RESOLVED">Mark as Resolved</option>
                    <option value="CLOSED">Mark as Closed</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={sendingReply || !adminReply.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold shadow-md shadow-[#7c3aed]/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {sendingReply ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={13} />
                  )}
                  <span>Send Response</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminTicketsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 flex items-center justify-center">
          <div className="flex items-center gap-2.5 text-slate-400 text-sm font-medium">
            <Loader2 size={20} className="animate-spin text-sky-600 dark:text-sky-400" />
            <span>Loading support inquiries...</span>
          </div>
        </div>
      }
    >
      <AdminTicketsContent />
    </Suspense>
  );
}
