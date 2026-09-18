"use client";

import React from "react";
import {
  CreditCard,
  CheckCircle,
  Lock,
  Loader2,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
} from "lucide-react";

interface WalletOnlineFundCardProps {
  showManualFund: boolean;
  setShowManualFund: (show: boolean | ((prev: boolean) => boolean)) => void;
  manualAmount: string;
  setManualAmount: (val: string) => void;
  amountPresets: number[];
  paymentMethod: string;
  setPaymentMethod: (val: string) => void;
  isSubmittingManual: boolean;
  manualError: string | null;
  setManualError: (err: string | null) => void;
  handleManualFundSubmit: () => void;
}

export default function WalletOnlineFundCard({
  showManualFund,
  setShowManualFund,
  manualAmount,
  setManualAmount,
  amountPresets,
  paymentMethod,
  setPaymentMethod,
  isSubmittingManual,
  manualError,
  setManualError,
  handleManualFundSubmit,
}: WalletOnlineFundCardProps) {
  return (
    <div className="pt-6 space-y-6 max-w-xl mx-auto">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-white/10" />
        </div>
        <div className="relative bg-slate-50 dark:bg-[#060a14] px-4 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            OTHER PAYMENT OPTION
          </span>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center">
        Use an alternative method to fund your account manually.
      </p>

      {/* Toggle Button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowManualFund((prev) => !prev)}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold text-sm px-8 py-3 rounded-2xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/35 active:scale-[0.98] transition-all cursor-pointer"
        >
          {showManualFund ? (
            <>
              <X size={16} />
              <span>Close</span>
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              <Plus size={16} />
              <span>Fund Account</span>
              <ChevronDown size={16} />
            </>
          )}
        </button>
      </div>

      {/* Expandable Manual / Online Funding Card */}
      {showManualFund && (
        <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0b101b] p-6 sm:p-8 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6 transition-all animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Header */}
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-white/5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <CreditCard size={18} />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Funds (Manual / Online)
            </h3>
          </div>

          {/* Amount Field */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Amount (NGN)
            </label>

            <div className="relative flex items-center rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 overflow-hidden focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-600 dark:focus-within:border-sky-400 transition-all">
              <div className="px-4 py-3.5 bg-slate-100 dark:bg-white/10 border-r border-slate-300/80 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold text-base select-none">
                ₦
              </div>
              <input
                type="number"
                value={manualAmount}
                onChange={(e) => {
                  setManualAmount(e.target.value);
                  setManualError(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleManualFundSubmit()}
                placeholder="Enter amount (e.g. 5000)"
                className="w-full px-4 py-3.5 text-base font-semibold bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            {/* Quick Amount Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              {amountPresets.map((preset) => {
                const isSelected = manualAmount === String(preset);
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setManualAmount(String(preset));
                      setManualError(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                        : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10"
                    }`}
                  >
                    ₦{preset.toLocaleString()}
                  </button>
                );
              })}
            </div>

            {/* Fee Breakdown Display */}
            {Number(manualAmount) > 0 && (() => {
              const amt = Number(manualAmount);
              const gross =
                amt < 2500
                  ? Math.ceil((amt / 0.99) * 100) / 100
                  : ((amt + 100) / 0.99) * 0.01 + 100 >= 2000
                  ? amt + 2000
                  : Math.ceil(((amt + 100) / 0.99) * 100) / 100;
              const fee = Math.round((gross - amt) * 100) / 100;
              return (
                <div className="rounded-xl bg-slate-100/70 dark:bg-white/5 p-3 text-xs space-y-1 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/5">
                  <div className="flex justify-between">
                    <span>Deposit to wallet:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₦{amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gateway fee (1% + ₦100):</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      + ₦{fee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-white/10 font-bold text-slate-900 dark:text-white">
                    <span>Total charge:</span>
                    <span className="text-sky-600 dark:text-sky-400">
                      ₦{gross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Payment Method
            </label>
            <div className="relative">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-3.5 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 dark:focus:border-sky-400 transition-all cursor-pointer"
              >
                <option value="paymonetra" className="bg-white dark:bg-[#0b101b] text-slate-900 dark:text-white">
                  Paymonetra (Cards, Bank Transfer &amp; USSD)
                </option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Info & Security Box */}
          <div className="rounded-2xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200/70 dark:border-sky-500/20 p-4.5 space-y-2.5">
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <CheckCircle size={15} className="text-emerald-500 shrink-0" />
              <span>Funds will be added immediately after successful payment</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <CheckCircle size={15} className="text-emerald-500 shrink-0" />
              <span>
                Minimum deposit: <strong>₦1,000</strong> — Maximum: <strong>₦1,000,000</strong>
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
              <Lock size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>All transactions are secure and encrypted</span>
            </div>
          </div>

          {/* Error Message */}
          {manualError && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              {manualError}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowManualFund(false);
                setManualError(null);
              }}
              disabled={isSubmittingManual}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 text-sm font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleManualFundSubmit}
              disabled={isSubmittingManual}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-sky-500/25 hover:shadow-sky-500/40 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmittingManual ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Redirecting...</span>
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  <span>Pay Now</span>
                </>
              )}
            </button>
          </div>

          {/* Footer Support Link */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5">
            <span>Need help?</span>
            <a
              href="https://wa.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-600 dark:text-sky-400 font-semibold hover:underline"
            >
              Contact Support
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
