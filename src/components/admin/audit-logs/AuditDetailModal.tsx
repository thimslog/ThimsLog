"use client";

import React, { useState } from "react";
import { X, Copy, Check, ShieldCheck, Terminal, Globe, Calendar, User } from "lucide-react";
import { AdminAuditLogRecord } from "./types";
import { formatInTimeZone } from "date-fns-tz";
import { toast } from "@/components/ui/toast";

interface AuditDetailModalProps {
  log: AdminAuditLogRecord | null;
  onClose: () => void;
}

export function AuditDetailModal({ log, onClose }: AuditDetailModalProps) {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  let formattedDate = "";
  try {
    formattedDate =
      formatInTimeZone(new Date(log.createdAt), "Africa/Lagos", "yyyy-MM-dd HH:mm:ss") +
      " (WAT)";
  } catch {
    formattedDate = new Date(log.createdAt).toLocaleString();
  }

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Audit log payload copied to clipboard");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Audit Event Record</span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-500/20">
                  {log.action}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Log ID: <span className="font-mono">{log.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyJson}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              title="Copy JSON Payload"
            >
              {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 font-sans text-xs">
          {/* Summary / Description */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Activity Description
            </span>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              {log.description}
            </p>
          </div>

          {/* Identity & Context Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Operator / Admin */}
            <div className="p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/[0.01] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <User size={12} />
                Actor Identity
              </span>
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {log.admin ? `${log.admin.firstName} ${log.admin.lastName}` : log.adminEmail}
              </p>
              <p className="text-slate-400 font-mono text-[11px] truncate">
                {log.adminEmail}
              </p>
            </div>

            {/* Target Entity */}
            <div className="p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/[0.01] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Terminal size={12} />
                Target Entity
              </span>
              <p className="font-semibold text-slate-900 dark:text-white truncate">
                {log.entityLabel || log.entityId || "N/A"}
              </p>
              <p className="text-slate-400 font-mono text-[11px] truncate">
                Type: {log.entityType || "N/A"}
              </p>
            </div>

            {/* Timestamp */}
            <div className="p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/[0.01] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Calendar size={12} />
                Logged Time
              </span>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {formattedDate}
              </p>
            </div>

            {/* Client Context / IP */}
            <div className="p-3.5 rounded-xl border border-slate-200/60 dark:border-white/5 bg-white dark:bg-white/[0.01] space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Globe size={12} />
                Client IP Address
              </span>
              <p className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {log.ipAddress || "Unknown"}
              </p>
              {log.userAgent && (
                <p className="text-[10px] text-slate-400 line-clamp-1" title={log.userAgent}>
                  {log.userAgent}
                </p>
              )}
            </div>
          </div>

          {/* Metadata JSON Inspector */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Attached Payload & Diff Metadata
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {Object.keys(log.metadata).length} attributes
                </span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-sky-300 font-mono text-[11.5px] overflow-x-auto leading-relaxed border border-slate-800 shadow-inner max-h-60">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
