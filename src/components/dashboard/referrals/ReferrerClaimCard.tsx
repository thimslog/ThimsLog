"use client";

import React from "react";
import { Gift, ShieldCheck, Check, Loader2 } from "lucide-react";

interface ReferrerClaimCardProps {
  referredBy?: { id: string; name: string; username: string } | null;
  claimCode: string;
  claiming: boolean;
  onClaimCodeChange: (val: string) => void;
  onSubmitClaim: (e: React.FormEvent) => void;
}

export function ReferrerClaimCard({
  referredBy,
  claimCode,
  claiming,
  onClaimCodeChange,
  onSubmitClaim,
}: ReferrerClaimCardProps) {
  if (referredBy) {
    return (
      <div className="p-4 rounded-2xl border border-emerald-200/80 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
              Your Referrer
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {referredBy.name}{" "}
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold text-xs">
                (@{referredBy.username})
              </span>
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-500/20 px-3 py-1 rounded-full w-fit">
          <Check size={12} /> Referrer Linked
        </span>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-3xl border border-dashed border-sky-300 dark:border-sky-500/30 bg-sky-50/40 dark:bg-sky-500/5 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
      <div className="space-y-1">
        <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
          <Gift size={16} className="text-sky-600 dark:text-sky-400" />
          <span>Were you referred by a friend?</span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-[11.5px]">
          Enter their username or referral code below.{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            (You can only link a referrer once)
          </span>
        </p>
      </div>

      <form onSubmit={onSubmitClaim} className="flex items-center gap-2 max-w-sm w-full">
        <input
          type="text"
          value={claimCode}
          onChange={(e) => onClaimCodeChange(e.target.value)}
          placeholder="Enter referrer username"
          required
          disabled={claiming}
          className="flex-1 px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 font-mono text-xs focus:outline-none focus:border-sky-600 dark:focus:border-sky-400 transition-colors"
        />
        <button
          type="submit"
          disabled={claiming || !claimCode.trim()}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 shadow-xs"
        >
          {claiming ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          <span>Claim</span>
        </button>
      </form>
    </div>
  );
}
