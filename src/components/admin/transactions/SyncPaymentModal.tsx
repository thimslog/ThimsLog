"use client";

import React, { useState } from "react";
import { RotateCcw, X, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface SyncPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
}

export function SyncPaymentModal({
  isOpen,
  onClose,
  onSuccess,
}: SyncPaymentModalProps) {
  const [syncReference, setSyncReference] = useState("");
  const [syncAccountNumber, setSyncAccountNumber] = useState("");
  const [syncAmount, setSyncAmount] = useState("");
  const [syncing, setSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncReference.trim() && !syncAccountNumber.trim()) {
      toast.error("Please enter a reference or customer virtual account number.");
      return;
    }

    setSyncing(true);
    try {
      const res = await fetch("/api/admin/transactions/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: syncReference.trim() || undefined,
          accountNumber: syncAccountNumber.trim() || undefined,
          amount: syncAmount ? Number(syncAmount) : undefined,
        }),
      });

      const data = await res.json();

      if (data.alreadyProcessed) {
        toast.info(data.message || "This transaction is already saved and credited.");
        onClose();
      } else if (res.ok && data.success) {
        toast.success(data.message || "Transaction successfully synced and credited!");
        setSyncReference("");
        setSyncAccountNumber("");
        setSyncAmount("");
        onClose();
        await onSuccess();
      } else {
        toast.error(data.message || "Failed to sync transaction");
      }
    } catch (err: any) {
      toast.error(err?.message || "Network error while syncing transaction");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={() => !syncing && onClose()}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#0b101b] rounded-3xl border border-slate-200 dark:border-white/10 p-6 shadow-2xl transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <RotateCcw size={16} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Sync Paymonetra Payment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Import missed direct transfers or reconcile by reference
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !syncing && onClose()}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          <div className="p-3 bg-sky-50/60 dark:bg-sky-500/5 border border-sky-100 dark:border-sky-500/10 rounded-xl text-sky-800 dark:text-sky-300">
            <p>
              <strong>Duplicate Protection:</strong> If this transaction was already recorded and credited, it will be skipped safely without adding duplicate balance.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Paymonetra Reference (Collection or Checkout Ref)
            </label>
            <input
              type="text"
              value={syncReference}
              onChange={(e) => setSyncReference(e.target.value)}
              placeholder="e.g. col_1234567890 or merchant reference"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-600 font-mono text-xs"
            />
          </div>

          <div className="text-center text-slate-400 font-medium">— OR —</div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Virtual Account Number (Optional fallback)
            </label>
            <input
              type="text"
              value={syncAccountNumber}
              onChange={(e) => setSyncAccountNumber(e.target.value)}
              placeholder="e.g. 9901234567 (10-digit virtual account)"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-600 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Amount in Naira (Optional if reference has amount)
            </label>
            <input
              type="number"
              step="0.01"
              value={syncAmount}
              onChange={(e) => setSyncAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-sky-600 text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={syncing}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={syncing}
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-60"
            >
              {syncing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  <span>Sync & Credit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
