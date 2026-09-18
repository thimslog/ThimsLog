"use client";

import React from "react";

export function ReferralHowItWorks() {
  return (
    <section className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0b101b] p-5 sm:p-6 shadow-2xs">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        How the Affiliate Program Works
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1.5">
          <div className="w-6 h-6 rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold flex items-center justify-center text-xs">
            1
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">Share Your Link</h4>
          <p className="text-slate-500 dark:text-slate-400 text-[11.5px]">
            Copy your unique referral link or code and share it in WhatsApp groups, Telegram channels, or with colleagues.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1.5">
          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-xs">
            2
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">Friend Buys Accounts</h4>
          <p className="text-slate-500 dark:text-slate-400 text-[11.5px]">
            When your invited friend signs up and purchases accounts worth ₦20,000 or more.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-1.5">
          <div className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-xs">
            3
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white">Instant 1% Credit</h4>
          <p className="text-slate-500 dark:text-slate-400 text-[11.5px]">
            You instantly receive 1% of the order purchase amount in your wallet balance, ready to spend or buy social accounts.
          </p>
        </div>
      </div>
    </section>
  );
}
