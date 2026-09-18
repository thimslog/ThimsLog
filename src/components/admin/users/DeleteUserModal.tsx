"use client";

import React from "react";
import { Trash2, AlertTriangle, Loader2, X } from "lucide-react";
import { UserRecord } from "./types";

interface DeleteUserModalProps {
  userToDelete: UserRecord | null;
  deleting: boolean;
  onClose: () => void;
  onConfirmDelete: () => void;
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "₦0.00";
  return `₦${currencyFormatter.format(Number(value))}`;
}

export default function DeleteUserModal({
  userToDelete,
  deleting,
  onClose,
  onConfirmDelete,
}: DeleteUserModalProps) {
  if (!userToDelete) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#0b101b] rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Trash2 size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Delete User Account
              </h3>
              <p className="text-xs text-slate-400">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => !deleting && onClose()}
            disabled={deleting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to permanently delete the account of{" "}
            <strong className="text-slate-900 dark:text-white font-bold">
              {userToDelete.name}
            </strong>{" "}
            (
            <span className="font-mono text-sky-600 dark:text-sky-400">
              @{userToDelete.username}
            </span>
            )?
          </p>

          {/* User Summary Pill */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Email:</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                {userToDelete.email}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span>Wallet Balance:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatMoney(userToDelete.balance)}
              </span>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200/80 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
            <AlertTriangle
              size={16}
              className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
            />
            <p className="leading-normal text-[11.5px]">
              All associated wallet transactions, support tickets, and
              notifications will be deleted. Any un-transferred balances will be
              removed.
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            disabled={deleting}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={13} />
                <span>Delete User</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
