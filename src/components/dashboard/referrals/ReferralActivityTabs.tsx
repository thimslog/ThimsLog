"use client";

import React from "react";
import { Users, Gift } from "lucide-react";
import { ReferredUser, ReferralReward, formatMoney } from "./types";

interface ReferralActivityTabsProps {
  activeTab: "friends" | "rewards";
  onTabChange: (tab: "friends" | "rewards") => void;
  referredUsers: ReferredUser[];
  rewards: ReferralReward[];
}

export function ReferralActivityTabs({
  activeTab,
  onTabChange,
  referredUsers,
  rewards,
}: ReferralActivityTabsProps) {
  return (
    <section className="rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0b101b] overflow-hidden shadow-2xs">
      <div className="flex items-center gap-2 p-3 border-b border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02]">
        <button
          type="button"
          onClick={() => onTabChange("friends")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "friends"
              ? "bg-white dark:bg-white/10 text-sky-600 dark:text-sky-400 shadow-2xs"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Referred Friends ({referredUsers?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => onTabChange("rewards")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "rewards"
              ? "bg-white dark:bg-white/10 text-sky-600 dark:text-sky-400 shadow-2xs"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Commission Payouts ({rewards?.length || 0})
        </button>
      </div>

      {activeTab === "friends" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200/60 dark:border-white/5 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="px-5 py-3.5">Friend</th>
                <th className="px-5 py-3.5">Username</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5 text-right">Date Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {!referredUsers || referredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-slate-400">
                    <Users size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No referrals yet</p>
                    <p className="text-[11px] mt-0.5">Share your invite link above to start earning!</p>
                  </td>
                </tr>
              ) : (
                referredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {u.name}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-sky-600 dark:text-sky-400">
                      @{u.username}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-mono">
                      {u.emailMasked}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(u.joinedAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200/60 dark:border-white/5 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              <tr>
                <th className="px-5 py-3.5">Referee</th>
                <th className="px-5 py-3.5">Source Type</th>
                <th className="px-5 py-3.5">Order Amount</th>
                <th className="px-5 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                  Commission Earned (1%)
                </th>
                <th className="px-5 py-3.5 text-right">Date Credited</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {!rewards || rewards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-400">
                    <Gift size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No commissions earned yet</p>
                    <p className="text-[11px] mt-0.5">
                      Commissions will appear here when your referrals make purchases of ₦20,000 or above.
                    </p>
                  </td>
                </tr>
              ) : (
                rewards.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                      {r.refereeName}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                        {r.sourceType}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-slate-700 dark:text-slate-300">
                      {formatMoney(r.sourceAmount)}
                    </td>
                    <td className="px-5 py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatMoney(r.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
