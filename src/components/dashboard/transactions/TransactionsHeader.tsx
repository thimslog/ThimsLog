"use client";

import React from "react";
import Link from "next/link";
import { RefreshCw, Send, Plus } from "lucide-react";

interface TransactionsHeaderProps {
  refreshing: boolean;
  onRefresh: () => void;
  onOpenSendMoney: () => void;
}

export function TransactionsHeader({
  refreshing,
  onRefresh,
  onOpenSendMoney,
}: TransactionsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Wallet History
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Track all your deposits, transfers, purchases and account activity
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
          title="Refresh Transactions"
        >
          <RefreshCw
            size={14}
            className={refreshing ? "animate-spin text-sky-500" : "text-slate-500"}
          />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
        <button
          type="button"
          onClick={onOpenSendMoney}
          className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Send size={14} />
          Send Money
        </button>
        <Link
          href="/dashboard/wallet"
          className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-glow cursor-pointer"
        >
          <Plus size={15} />
          Fund Account
        </Link>
      </div>
    </div>
  );
}
