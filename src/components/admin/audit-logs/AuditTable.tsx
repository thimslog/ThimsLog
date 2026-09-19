"use client";

import React from "react";
import { formatInTimeZone } from "date-fns-tz";
import {
  Eye,
  Shield,
  User,
  Activity,
  Layers,
  HelpCircle,
  Receipt,
  Ticket,
  AlertCircle,
  Database,
} from "lucide-react";
import { AdminAuditLogRecord } from "./types";

interface AuditTableProps {
  logs: AdminAuditLogRecord[];
  loading: boolean;
  onSelectLog: (log: AdminAuditLogRecord) => void;
}

export function AuditTable({ logs, loading, onSelectLog }: AuditTableProps) {
  const getActionBadge = (action: string) => {
    if (action.includes("DELETE")) {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-500/20">
          {action}
        </span>
      );
    }
    if (action.includes("CREATE") || action.includes("SIGNUP") || action.includes("ADDED")) {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-500/20">
          {action}
        </span>
      );
    }
    if (action.includes("VERIFIED") || action.includes("SYNC")) {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-200/60 dark:border-sky-500/20">
          {action}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-200/60 dark:border-purple-500/20">
        {action}
      </span>
    );
  };

  const getEntityIcon = (entityType?: string | null) => {
    switch (entityType?.toUpperCase()) {
      case "USER":
        return <User size={13} className="text-sky-500" />;
      case "TRANSACTION":
        return <Receipt size={13} className="text-emerald-500" />;
      case "TICKET":
        return <Ticket size={13} className="text-purple-500" />;
      case "INVENTORY":
        return <Database size={13} className="text-amber-500" />;
      case "HELP_CENTER":
        return <HelpCircle size={13} className="text-indigo-500" />;
      case "ADMIN":
        return <Shield size={13} className="text-rose-500" />;
      default:
        return <Activity size={13} className="text-slate-400" />;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px]">
            <th className="py-3 px-4">Timestamp (WAT)</th>
            <th className="py-3 px-4">Operator Admin</th>
            <th className="py-3 px-4">Action Event</th>
            <th className="py-3 px-4">Target Entity</th>
            <th className="py-3 px-4">Activity Description</th>
            <th className="py-3 px-4">IP Address</th>
            <th className="py-3 px-4 text-right">Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-sans">
          {loading ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-slate-400">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-sky-600 border-t-transparent animate-spin" />
                  <span>Loading audit logs...</span>
                </div>
              </td>
            </tr>
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-12 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-1">
                  <AlertCircle size={20} className="opacity-40" />
                  <span>No audit events match the selected criteria</span>
                </div>
              </td>
            </tr>
          ) : (
            logs.map((log) => {
              let formattedTime = "";
              try {
                formattedTime = formatInTimeZone(
                  new Date(log.createdAt),
                  "Africa/Lagos",
                  "MMM dd, yyyy HH:mm:ss"
                );
              } catch {
                formattedTime = new Date(log.createdAt).toLocaleString();
              }

              return (
                <tr
                  key={log.id}
                  onClick={() => onSelectLog(log)}
                  className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  {/* Timestamp */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {formattedTime}
                  </td>

                  {/* Operator Admin */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 flex items-center justify-center text-[10px] font-bold">
                        {log.admin?.firstName?.[0] || log.adminEmail?.[0] || "A"}
                      </div>
                      <div className="leading-tight">
                        <p className="font-semibold text-slate-900 dark:text-white text-xs">
                          {log.admin
                            ? `${log.admin.firstName} ${log.admin.lastName}`
                            : log.adminEmail}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {log.adminEmail}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Action Event Badge */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getActionBadge(log.action)}
                  </td>

                  {/* Target Entity */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {getEntityIcon(log.entityType)}
                      <span className="truncate max-w-[140px]" title={log.entityLabel || log.entityId || "N/A"}>
                        {log.entityLabel || log.entityId || "System"}
                      </span>
                    </div>
                  </td>

                  {/* Description */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={log.description}>
                    {log.description}
                  </td>

                  {/* IP Address */}
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                    {log.ipAddress || "—"}
                  </td>

                  {/* Action / Inspect */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLog(log);
                      }}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer shadow-2xs"
                      title="View Event Details"
                    >
                      <Eye size={13} />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
