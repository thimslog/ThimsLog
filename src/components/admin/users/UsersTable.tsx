"use client";

import React from "react";
import Link from "next/link";
import { Wallet, Loader2, ExternalLink, Trash2 } from "lucide-react";
import { UserRecord } from "./types";

interface UsersTableProps {
  users: UserRecord[];
  loading: boolean;
  debouncedSearch: string;
  onSelectUserToDelete: (user: UserRecord) => void;
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "₦0.00";
  return `₦${currencyFormatter.format(Number(value))}`;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function UsersTable({
  users,
  loading,
  debouncedSearch,
  onSelectUserToDelete,
}: UsersTableProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/[0.02]">
            <tr className="text-[11.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
              <th className="px-5 py-3.5">Customer Name</th>
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Username</th>
              <th className="px-5 py-3.5">Referred By</th>
              <th className="px-5 py-3.5">Wallet Balance</th>
              <th className="px-5 py-3.5">Joined Date</th>
              <th className="px-5 py-3.5">Last Active</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody
            className={`divide-y divide-slate-100 dark:divide-white/5 text-xs transition-opacity duration-150 ${
              loading ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
          >
            {loading && users.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-14 text-center text-[13px] text-slate-400"
                >
                  <div className="flex items-center justify-center gap-2.5">
                    <Loader2 size={18} className="animate-spin text-sky-600 dark:text-sky-400" />
                    <span>Loading customers...</span>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-14 text-center text-[13px] text-slate-400 dark:text-slate-500"
                >
                  {debouncedSearch
                    ? `No customers found matching "${debouncedSearch}"`
                    : "No users found in database."}
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors"
                >
                  {/* Customer Name */}
                  <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center gap-2"
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[11px] font-bold shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate max-w-[160px]">{user.name}</span>
                    </Link>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-3.5 font-mono text-slate-600 dark:text-slate-300 text-[12px]">
                    {user.email}
                  </td>

                  {/* Username */}
                  <td className="px-5 py-3.5 font-mono text-sky-700 dark:text-sky-400 font-medium">
                    @{user.username}
                  </td>

                  {/* Referred By */}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {user.referredBy ? (
                      <Link
                        href={`/admin/users/${user.referredBy.id}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-500/10 border border-sky-200/60 dark:border-sky-500/20 text-sky-700 dark:text-sky-300 font-mono text-[11px] font-semibold hover:underline"
                        title={`Referred by ${user.referredBy.name}`}
                      >
                        <span>@{user.referredBy.username}</span>
                      </Link>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-[11px] italic">
                        Direct / None
                      </span>
                    )}
                  </td>

                  {/* Wallet Balance */}
                  <td className="px-5 py-3.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-[12px]">
                      <Wallet size={12} className="text-emerald-600 dark:text-emerald-400" />
                      <span>{formatMoney(user.balance)}</span>
                    </div>
                  </td>

                  {/* Joined Date */}
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(user.joinedAt)}
                  </td>

                  {/* Last Active */}
                  <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(user.lastActive)}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-500/20 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <span>View Details</span>
                        <ExternalLink size={11} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onSelectUserToDelete(user)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-xs font-semibold transition-colors cursor-pointer"
                        title={`Delete ${user.name}`}
                      >
                        <Trash2 size={12} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
