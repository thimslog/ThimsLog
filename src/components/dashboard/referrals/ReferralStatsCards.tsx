"use client";

import React from "react";
import { TrendingUp, Users, Percent } from "lucide-react";
import { ReferralMetrics, formatMoney } from "./types";

interface ReferralStatsCardsProps {
  metrics: ReferralMetrics;
  commissionRatePercent?: string;
}

export function ReferralStatsCards({
  metrics,
  commissionRatePercent = "1%",
}: ReferralStatsCardsProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Total Earnings */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Total Commission Earned
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatMoney(metrics?.totalEarnings || 0)}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Credited directly into your main wallet
          </p>
        </div>
      </div>

      {/* Total Referred Friends */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Referred Friends
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Users size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {metrics?.totalReferred || 0}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Registered using your invite link
          </p>
        </div>
      </div>

      {/* Commission Rate */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Commission Rate
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Percent size={16} />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {commissionRatePercent}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Instant purchase cashback rate (≥ ₦20k)
          </p>
        </div>
      </div>
    </section>
  );
}
