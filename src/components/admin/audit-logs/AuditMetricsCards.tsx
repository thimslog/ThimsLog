"use client";

import React from "react";
import { ScrollText, Clock, Users, ShieldAlert } from "lucide-react";
import { AuditMetrics } from "./types";

interface AuditMetricsCardsProps {
  metrics: AuditMetrics | null;
  loading?: boolean;
}

export function AuditMetricsCards({ metrics, loading }: AuditMetricsCardsProps) {
  const total = metrics?.totalLogs ?? 0;
  const today = metrics?.todayLogs ?? 0;
  const activeAdmins = metrics?.activeAdminsCount ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Recorded Operations */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Audit Events
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <ScrollText size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {total.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Historical system audit records
          </p>
        </div>
      </div>

      {/* Today's Activity */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Today's Mutations
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Clock size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {today.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Recorded since midnight WAT
          </p>
        </div>
      </div>

      {/* Unique Active Admins */}
      <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Active Admins Logged
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {activeAdmins.toLocaleString()}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Distinct operators with recorded actions
          </p>
        </div>
      </div>
    </div>
  );
}
