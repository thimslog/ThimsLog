"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  RefreshCw,
  Eye,
  Check,
  Copy,
  Loader2,
  User as UserIcon,
  ExternalLink,
} from "lucide-react";
import { StatusPill } from "@/components/admin/status-pill";
import {
  TransactionRecord,
  formatMoney,
  formatDate,
  getToneForStatus,
} from "./types";

interface TransactionTableProps {
  transactions: TransactionRecord[];
  loading: boolean;
  verifyingId: string | null;
  copiedRef: string | null;
  onCopy: (text: string, id: string) => void;
  onQueryTransaction: (id: string) => void;
  onSelectTransaction: (tx: TransactionRecord) => void;
}

export function TransactionTable({
  transactions,
  loading,
  verifyingId,
  copiedRef,
  onCopy,
  onQueryTransaction,
  onSelectTransaction,
}: TransactionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/10 text-[11.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
          <tr>
            <th className="px-5 py-3.5">Customer / User</th>
            <th className="px-5 py-3.5">Type</th>
            <th className="px-5 py-3.5">Amount</th>
            <th className="px-5 py-3.5">Status</th>
            <th className="px-5 py-3.5">Merchant Ref</th>
            <th className="px-5 py-3.5">Date</th>
            <th className="px-5 py-3.5 text-right">Actions</th>
          </tr>
        </thead>

        <tbody
          className={`divide-y divide-slate-100 dark:divide-white/5 text-xs transition-opacity duration-150 ${
            loading ? "opacity-50 pointer-events-none" : "opacity-100"
          }`}
        >
          {loading && transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5 py-14 text-center text-slate-400">
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin text-sky-600" />
                  <span>Loading transactions...</span>
                </div>
              </td>
            </tr>
          ) : transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5 py-14 text-center text-slate-400">
                No transactions found matching criteria.
              </td>
            </tr>
          ) : (
            transactions.map((tx) => {
              const user = tx.wallet?.user;
              const isPending = tx.status === "PENDING";
              const isVerifying = verifyingId === tx.id;

              return (
                <tr
                  key={tx.id}
                  className="hover:bg-slate-50/60 dark:hover:bg-white/[0.03] transition-colors"
                >
                  {/* Customer Info */}
                  <td className="px-5 py-4">
                    {user?.id ? (
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="flex items-center gap-3 group/user hover:opacity-95 transition-opacity"
                        title="View user details"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 group-hover/user:bg-sky-50 dark:group-hover/user:bg-sky-500/10 group-hover/user:text-sky-600 dark:group-hover/user:text-sky-400 flex items-center justify-center text-xs font-bold shrink-0 transition-colors">
                          {user.firstName?.[0] || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white group-hover/user:text-sky-600 dark:group-hover/user:text-sky-400 truncate max-w-[140px] transition-colors flex items-center gap-1">
                            <span>
                              {user.firstName} {user.lastName}
                            </span>
                            <ExternalLink
                              size={10}
                              className="opacity-0 group-hover/user:opacity-100 text-sky-500 transition-opacity shrink-0"
                            />
                          </p>
                          <p className="text-[11.5px] text-slate-400 truncate max-w-[140px]">
                            {user.email}
                          </p>
                        </div>
                      </Link>
                    ) : user ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 flex items-center justify-center text-xs font-bold shrink-0">
                          {user.firstName?.[0] || "U"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-[11.5px] text-slate-400 truncate max-w-[140px]">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>

                  {/* Type */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      {tx.type === "FUNDING" && (
                        <ArrowDownLeft size={14} className="text-emerald-500 shrink-0" />
                      )}
                      {tx.type === "PAYMENT" && (
                        <ArrowUpRight size={14} className="text-sky-500 shrink-0" />
                      )}
                      {tx.type === "TRANSFER_SENT" && (
                        <ArrowUpRight size={14} className="text-rose-500 shrink-0" />
                      )}
                      {tx.type === "TRANSFER_RECEIVED" && (
                        <ArrowDownLeft size={14} className="text-emerald-500 shrink-0" />
                      )}
                      {tx.type === "REFUND" && (
                        <RotateCcw size={14} className="text-amber-500 shrink-0" />
                      )}
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {tx.type === "TRANSFER_SENT"
                          ? "Transfer Out"
                          : tx.type === "TRANSFER_RECEIVED"
                          ? "Transfer In"
                          : tx.type}
                      </span>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-4 font-mono font-semibold">
                    <div className="text-slate-900 dark:text-white">
                      {formatMoney(tx.amountRequested)}
                    </div>
                    {tx.amount && Number(tx.amount) !== Number(tx.amountRequested) && (
                      <div className="text-[11px] text-slate-400">
                        Paid: {formatMoney(tx.amount)}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <StatusPill
                      label={tx.status}
                      tone={getToneForStatus(tx.status)}
                    />
                  </td>

                  {/* Reference */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-300 truncate max-w-[140px]">
                        {tx.merchantReference}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          onCopy(tx.merchantReference, tx.id)
                        }
                        title="Copy Reference"
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded transition-colors cursor-pointer"
                      >
                        {copiedRef === tx.id ? (
                          <Check size={13} className="text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Date */}
                  <td className="px-5 py-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(tx.createdAt)}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {isPending && (
                        <button
                          type="button"
                          onClick={() => onQueryTransaction(tx.id)}
                          disabled={isVerifying}
                          className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-amber-200/60 dark:border-amber-500/20 transition-colors cursor-pointer disabled:opacity-60"
                          title="Query status from Paymonetra"
                        >
                          <RefreshCw
                            size={12}
                            className={isVerifying ? "animate-spin" : ""}
                          />
                          <span>{isVerifying ? "Checking..." : "Query"}</span>
                        </button>
                      )}

                      {user?.id && (
                        <Link
                          href={`/admin/users/${user.id}`}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                          title="View user details"
                        >
                          <UserIcon size={16} />
                        </Link>
                      )}

                      <button
                        type="button"
                        onClick={() => onSelectTransaction(tx)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        title="View transaction details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
