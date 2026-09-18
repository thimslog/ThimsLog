"use client";

import React from "react";
import Link from "next/link";
import {
  User as UserIcon,
  Copy,
  Check,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
} from "lucide-react";
import { UserDetail } from "./types";

interface UserProfileCardProps {
  user: UserDetail;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
  formatDate: (iso: string) => string;
}

export default function UserProfileCard({
  user,
  copiedKey,
  onCopy,
  formatDate,
}: UserProfileCardProps) {
  return (
    <div className="lg:col-span-1 rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] p-6 shadow-xs space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-700 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-sky-500/20 shrink-0">
          {user.firstName?.[0] || "U"}
          {user.lastName?.[0] || ""}
        </div>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
            {user.firstName} {user.lastName}
          </h2>
          <p className="text-xs font-semibold text-sky-600 dark:text-sky-400">
            @{user.userName || "user"}
          </p>
          <div className="mt-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active Customer
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 text-xs pt-2 border-t border-slate-100 dark:border-white/5">
        <div className="flex items-center justify-between py-1.5">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Mail size={13} /> Email
          </span>
          <div className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
            <span className="truncate max-w-[170px]">{user.email}</span>
            <button
              onClick={() => onCopy(user.email, "email")}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
            >
              {copiedKey === "email" ? (
                <Check size={12} className="text-emerald-500" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-1.5 border-t border-slate-50 dark:border-white/5">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Phone size={13} /> Phone
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {user.phoneNumber || "Not provided"}
          </span>
        </div>

        <div className="flex items-center justify-between py-1.5 border-t border-slate-50 dark:border-white/5">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Calendar size={13} /> Joined Date
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {formatDate(user.createdAt)}
          </span>
        </div>

        {/* Referred By */}
        <div className="flex items-center justify-between py-1.5 border-t border-slate-50 dark:border-white/5">
          <span className="text-slate-400 flex items-center gap-1.5">
            <UserIcon size={13} /> Referred By
          </span>
          <div>
            {user.referredBy ? (
              <Link
                href={`/admin/users/${user.referredBy.id}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-500/10 border border-sky-200/60 dark:border-sky-500/20 text-sky-700 dark:text-sky-300 font-mono text-[11px] font-semibold hover:underline"
                title={`Referred by ${user.referredBy.firstName || ""} ${user.referredBy.lastName || ""}`.trim() || user.referredBy.userName}
              >
                <span>@{user.referredBy.userName}</span>
              </Link>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 font-semibold italic">
                Direct (None)
              </span>
            )}
          </div>
        </div>

        {/* Referral Stats */}
        <div className="flex items-center justify-between py-1.5 border-t border-slate-50 dark:border-white/5">
          <span className="text-slate-400 flex items-center gap-1.5">
            <ShieldCheck size={13} /> Network
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {user._count?.referrals || 0} invited friends
          </span>
        </div>
      </div>
    </div>
  );
}
