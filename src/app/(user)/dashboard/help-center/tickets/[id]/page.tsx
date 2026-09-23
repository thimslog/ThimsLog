"use client";

import { use, useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api-client";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  User as UserIcon,
  ShieldCheck,
  MessageSquare,
  RefreshCw,
  Radio,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useSocket } from "@/context/socket-context";

interface TicketResponse {
  id: string;
  senderType: "USER" | "ADMIN";
  senderName: string | null;
  message: string;
  createdAt: string;
}

interface TicketDetail {
  id: string;
  subject: string;
  message: string;
  priority: string;
  status: "OPEN" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  responses: TicketResponse[];
}

export default function UserTicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const ticketId = resolvedParams.id;
  const queryClient = useQueryClient();
  const { socket, joinTicket, leaveTicket, isConnected } = useSocket();

  const [replyMessage, setReplyMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading: loading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["tickets", "detail", ticketId],
    queryFn: () =>
      apiGet<{ success: boolean; data: TicketDetail }>(
        `/api/user/tickets/${ticketId}`
      ),
    staleTime: 15 * 1000,
  });

  const ticket = data?.data || null;

  // Real-time Socket.IO event listeners for live conversation updates
  useEffect(() => {
    if (!ticketId) return;

    joinTicket(ticketId);

    if (!socket) return;

    const handleNewReply = (payload: {
      ticketId: string;
      reply: TicketResponse;
      status?: string;
    }) => {
      if (payload.ticketId === ticketId && payload.reply) {
        queryClient.setQueryData(
          ["tickets", "detail", ticketId],
          (prev: any) => {
            if (!prev?.data) return prev;
            const currentResponses: TicketResponse[] = prev.data.responses || [];
            // Prevent duplicate message entry
            if (currentResponses.some((r) => r.id === payload.reply.id)) {
              return prev;
            }
            return {
              ...prev,
              data: {
                ...prev.data,
                status: (payload.status as any) || prev.data.status,
                responses: [...currentResponses, payload.reply],
              },
            };
          }
        );

        // Also invalidate user tickets list so response counts stay accurate
        queryClient.invalidateQueries({ queryKey: ["tickets", "user"] });

        // If message is from support admin, notify user
        if (payload.reply.senderType === "ADMIN") {
          toast.info("New message received from support agent!");
        }
      }
    };

    const handleStatusChange = (payload: {
      ticketId: string;
      status: "OPEN" | "RESOLVED" | "CLOSED";
    }) => {
      if (payload.ticketId === ticketId) {
        queryClient.setQueryData(
          ["tickets", "detail", ticketId],
          (prev: any) => {
            if (!prev?.data) return prev;
            return {
              ...prev,
              data: {
                ...prev.data,
                status: payload.status,
              },
            };
          }
        );
        queryClient.invalidateQueries({ queryKey: ["tickets", "user"] });
        toast.info(`Ticket status updated to ${payload.status}`);
      }
    };

    socket.on("ticket:reply", handleNewReply);
    socket.on("ticket:status_changed", handleStatusChange);

    return () => {
      leaveTicket(ticketId);
      socket.off("ticket:reply", handleNewReply);
      socket.off("ticket:status_changed", handleStatusChange);
    };
  }, [socket, ticketId, joinTicket, leaveTicket, queryClient]);

  const replyMutation = useMutation({
    mutationFn: (msg: string) =>
      apiMutate(`/api/user/tickets/${ticketId}/reply`, "POST", {
        message: msg,
      }),
    onSuccess: (res: any) => {
      // Optimistically append sent reply if not already present
      if (res?.data) {
        queryClient.setQueryData(
          ["tickets", "detail", ticketId],
          (prev: any) => {
            if (!prev?.data) return prev;
            const currentResponses: TicketResponse[] = prev.data.responses || [];
            if (currentResponses.some((r) => r.id === res.data.id)) return prev;
            return {
              ...prev,
              data: {
                ...prev.data,
                responses: [...currentResponses, res.data],
              },
            };
          }
        );
      }
      queryClient.invalidateQueries({ queryKey: ["tickets", "user"] });
      toast.success("Reply sent!");
      setReplyMessage("");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to send reply");
    },
  });

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || replyMutation.isPending) return;
    replyMutation.mutate(replyMessage.trim());
  };

  const handleRefresh = async () => {
    await refetch();
    toast.success("Conversation updated!");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-500/20">
            <Clock size={12} />
            <span>Open</span>
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20">
            <CheckCircle2 size={12} />
            <span>Resolved</span>
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/10">
            <XCircle size={12} />
            <span>Closed</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Top Navigation & Refresh Action Bar */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/dashboard/help-center/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to All Tickets</span>
        </Link>

        <div className="flex items-center gap-2">
          {isConnected && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Updates</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading || isRefetching}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0b101b] hover:bg-slate-50 dark:hover:bg-white/5 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            title="Check if support agent has replied"
          >
            <RefreshCw
              size={13}
              className={`text-slate-500 dark:text-slate-400 ${
                isRefetching || loading ? "animate-spin text-[#7c3aed]" : ""
              }`}
            />
            <span>{isRefetching ? "Checking..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 size={24} className="animate-spin text-[#7c3aed]" />
            <span className="text-sm font-medium">Loading ticket conversation...</span>
          </div>
        </div>
      ) : !ticket ? (
        <div className="rounded-3xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 p-10 text-center">
          <p className="text-slate-500">Ticket not found or has been deleted.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Ticket Header Card */}
          <div className="rounded-3xl bg-white dark:bg-[#0b101b] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    #{ticket.id.slice(0, 8)}
                  </span>
                  {getStatusBadge(ticket.status)}
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 dark:bg-purple-500/10 text-[#7c3aed] dark:text-purple-300">
                    {ticket.priority} PRIORITY
                  </span>
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {ticket.subject}
                </h1>
              </div>

              <div className="text-xs text-slate-400 sm:text-right">
                <p>Opened {new Date(ticket.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
              </div>
            </div>

            {/* Original Opening Ticket Message */}
            <div className="flex gap-3.5 pt-2">
              <div className="w-9 h-9 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0 font-bold text-xs">
                <UserIcon size={16} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    You (Opening Issue)
                  </p>
                  <span className="text-[11px] text-slate-400">
                    {new Date(ticket.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                  {ticket.message}
                </div>
              </div>
            </div>
          </div>

          {/* Conversation Thread */}
          {ticket.responses && ticket.responses.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-2">
                Conversation History ({ticket.responses.length})
              </h2>

              <div className="space-y-4">
                {ticket.responses.map((resp) => {
                  const isAdmin = resp.senderType === "ADMIN";
                  return (
                    <div
                      key={resp.id}
                      className={`flex gap-3.5 ${isAdmin ? "flex-row" : "flex-row"}`}
                    >
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-xs font-bold ${
                          isAdmin
                            ? "bg-purple-100 dark:bg-purple-500/20 text-[#7c3aed] dark:text-purple-300"
                            : "bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {isAdmin ? <ShieldCheck size={17} /> : <UserIcon size={16} />}
                      </div>

                      <div className="flex-1 space-y-1 max-w-2xl">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {isAdmin ? "ThimsLog Support" : "You"}
                          </p>
                          {isAdmin && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-500/20 text-[#7c3aed] dark:text-purple-300">
                              Official
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            {new Date(resp.createdAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <div
                          className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                            isAdmin
                              ? "bg-purple-50/80 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-500/20 text-purple-950 dark:text-purple-100"
                              : "bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          {resp.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reply Form (Active only when ticket status is OPEN) */}
          {ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? (
            <div className="rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                <CheckCircle2 size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  This ticket has been marked as {ticket.status.toLowerCase()}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  This support inquiry is closed and cannot receive new replies. If you have any further questions or a new issue, please open a new ticket.
                </p>
              </div>
              <div className="pt-1">
                <Link
                  href="/dashboard/help-center/tickets/create"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] text-white text-xs font-bold hover:bg-[#6d28d9] transition-colors shadow-xs cursor-pointer"
                >
                  <span>Open a New Ticket</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-[#0b101b] border border-slate-200/80 dark:border-white/10 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Send a Reply
              </h3>

              <form onSubmit={handleSendReply} className="space-y-3">
                <textarea
                  rows={3}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 text-slate-900 dark:text-white text-sm outline-none focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 transition-all resize-y min-h-[90px]"
                  required
                />

                <div className="flex items-center justify-between">
                  <p className="text-[11.5px] text-slate-400">
                    Replying will notify our support agents.
                  </p>

                  <button
                    type="submit"
                    disabled={replyMutation.isPending || !replyMessage.trim()}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold shadow-md shadow-[#7c3aed]/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {replyMutation.isPending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Send size={13} />
                    )}
                    <span>{replyMutation.isPending ? "Sending..." : "Send Reply"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
