"use client";

import React from "react";
import { RefreshCw } from "lucide-react";

interface DashboardHeaderProps {
  loading: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({ loading, onRefresh }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0b101b] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
      <div className="flex items-center gap-2.5">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          System Live Telemetry
        </span>
        <span className="text-slate-400 text-xs">•</span>
        <span className="text-xs text-slate-400 font-normal">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 transition-colors cursor-pointer disabled:opacity-50"
      >
        <RefreshCw
          size={13}
          className={loading ? "animate-spin text-sky-600 dark:text-sky-400" : ""}
        />
        <span>Refresh Data</span>
      </button>
    </div>
  );
}
