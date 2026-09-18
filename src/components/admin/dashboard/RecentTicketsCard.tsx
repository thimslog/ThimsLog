"use client";

import React from "react";
import Link from "next/link";
import { LifeBuoy, ChevronRight, CheckCircle2 } from "lucide-react";
import { RecentTicket, formatDate, getPriorityBadgeClass } from "./types";

interface RecentTicketsCardProps {
  tickets: RecentTicket[];
  openTicketsCount: number;
}

export function RecentTicketsCard({
  tickets,
  openTicketsCount,
}: RecentTicketsCardProps) {
  return (
    <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0b101b] shadow-xs overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <LifeBuoy size={16} className="text-purple-600 dark:text-purple-400" />
          <h2 className="text-[14px] font-bold text-slate-900 dark:text-white">
            Support Tickets Queue
          </h2>
        </div>
        <Link
          href="/admin/tickets"
          className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-0.5"
        >
          <span>View All ({openTicketsCount})</span>
          <ChevronRight size={12} />
        </Link>
      </div>

      <div className="p-4 flex-1">
        {!tickets || tickets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-8 text-center text-slate-400 text-xs">
            <CheckCircle2 size={32} className="text-emerald-500 mb-2 opacity-80" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Support queue clear
            </p>
            <p className="text-[11px] mt-0.5">No open tickets awaiting response.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {tickets.map((t) => (
              <Link
                key={t.id}
                href="/admin/tickets"
                className="block p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white text-xs truncate group-hover:text-sky-600 transition-colors">
                    {t.subject}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getPriorityBadgeClass(
                      t.priority
                    )}`}
                  >
                    {t.priority}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{t.customerName}</span>
                  <span>{formatDate(t.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
