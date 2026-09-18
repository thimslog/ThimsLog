"use client";

import React from "react";
import { Sparkles, Copy, Check, MessageSquare, Send } from "lucide-react";

interface ReferralHeroCardProps {
  referralLink: string;
  referralCode: string;
  copiedLink: boolean;
  copiedCode: boolean;
  onCopyLink: () => void;
  onCopyCode: () => void;
  onShareWhatsApp: () => void;
  onShareTelegram: () => void;
}

export function ReferralHeroCard({
  referralLink,
  referralCode,
  copiedLink,
  copiedCode,
  onCopyLink,
  onCopyCode,
  onShareWhatsApp,
  onShareTelegram,
}: ReferralHeroCardProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-sky-100 dark:border-white/10 bg-gradient-to-br from-sky-600 via-sky-700 to-indigo-800 text-white p-6 sm:p-8 shadow-xl shadow-sky-950/10">
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -mb-20" />

      <div className="relative z-10 max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 border border-white/20 rounded-full text-xs font-semibold uppercase tracking-wider text-sky-200">
          <Sparkles size={13} className="text-amber-300" />
          <span>1% Affiliate Commission</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
          Earn 1% on Every Purchase Above ₦20,000 Your Friends Make.
        </h2>
        <p className="text-xs sm:text-sm text-sky-100 leading-relaxed">
          Share your invite link with other agency owners, buyers, and freelancers. Whenever they buy accounts worth ₦20,000 or more, your wallet is automatically credited with a 1% commission instantly.
        </p>

        {/* Link Input & Action Buttons */}
        <div className="pt-2 space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 text-xs text-white font-mono truncate">
              <span className="truncate">{referralLink || "Loading link..."}</span>
            </div>

            <button
              type="button"
              onClick={onCopyLink}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-slate-900 hover:bg-sky-50 active:bg-sky-100 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
            >
              {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
              <span>{copiedLink ? "Copied!" : "Copy Link"}</span>
            </button>

            <button
              type="button"
              onClick={onCopyCode}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 text-white rounded-2xl text-xs font-semibold transition-all cursor-pointer shrink-0"
              title="Copy referral code only"
            >
              <span>
                Code: <span className="font-mono font-bold">{referralCode || "..."}</span>
              </span>
            </button>
          </div>

          {/* Social Share Buttons */}
          <div className="flex items-center gap-2.5 pt-1 flex-wrap">
            <span className="text-xs text-sky-200 font-medium">Quick Share:</span>
            <button
              type="button"
              onClick={onShareWhatsApp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-xs font-semibold text-emerald-200 transition-colors cursor-pointer"
            >
              <MessageSquare size={13} />
              <span>WhatsApp</span>
            </button>
            <button
              type="button"
              onClick={onShareTelegram}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-400/20 hover:bg-sky-400/30 border border-sky-300/30 text-xs font-semibold text-sky-200 transition-colors cursor-pointer"
            >
              <Send size={13} />
              <span>Telegram</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
