"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Plus, ArrowRight, X, Loader2, Send, Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/toast";
import TransferFundsModal from "./TransferFundsModal";
import { useAuth } from "@/context/auth-context";

interface BalanceCardProps {
  name: string;
  balance: number;
  currency?: string;
  username?: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  name,
  balance,
  currency = "NGN",
  username,
}) => {
  const { refreshUser } = useAuth();
  const [showBalance, setShowBalance] = useState(false);
  const [isFunding, setIsFunding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [error, setError] = useState("");
  const [copiedUsername, setCopiedUsername] = useState(false);

  const handleCopyUsername = () => {
    if (!username) return;
    navigator.clipboard.writeText(`@${username}`);
    setCopiedUsername(true);
    toast.success(`Copied @${username} to clipboard!`);
    setTimeout(() => setCopiedUsername(false), 2000);
  };

  // Handle browser back navigation or window refocus from payment checkout
  useEffect(() => {
    const handleReset = () => {
      setIsFunding(false);
    };

    window.addEventListener("pageshow", handleReset);
    window.addEventListener("focus", handleReset);

    return () => {
      window.removeEventListener("pageshow", handleReset);
      window.removeEventListener("focus", handleReset);
    };
  }, []);

  const openModal = () => {
    setAmountInput("");
    setError("");
    setIsFunding(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setIsFunding(false);
    setShowModal(false);
  };

  const handleAddFunds = async () => {
    const amount = Number(amountInput);
    if (!amount || amount <= 0) {
      setError("Enter a valid amount");
      toast.error("Please enter a valid amount");
      return;
    }

    setError("");
    setIsFunding(true);
    try {
      const res = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message ?? "Could not start funding");
      }

      if (!data.checkoutUrl) {
        throw new Error("Could not retrieve checkout URL");
      }

      // Close modal and reset state before navigating to gateway
      setShowModal(false);
      setIsFunding(false);

      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      const msg = err?.message || "Could not start funding";
      setError(msg);
      toast.error(msg);
      setIsFunding(false);
    }
  };

  const formattedBalance = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency,
  }).format(Number(balance) || 0);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 to-sky-900 text-white px-6 sm:px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
        <div className="absolute -right-10 -top-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="relative">
          <div className="flex items-center gap-2.5 flex-wrap">
            <p className="text-lg font-semibold flex items-center gap-2">
              Dashboard Overview, {name} <span>👋</span>
            </p>
            {username && (
              <button
                type="button"
                onClick={handleCopyUsername}
                className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold bg-white/10 hover:bg-white/20 text-sky-100 px-2.5 py-0.5 rounded-full border border-white/15 transition-colors cursor-pointer"
                title="Click to copy username"
              >
                <span>@{username}</span>
                {copiedUsername ? (
                  <Check size={11} className="text-emerald-300" />
                ) : (
                  <Copy size={11} className="text-sky-200" />
                )}
              </button>
            )}
          </div>
          <div className="mt-4 text-[11px] tracking-wider text-sky-200 flex items-center gap-2">
            <span>ACCOUNT BALANCE</span>
            <button
              type="button"
              onClick={() => setShowBalance((prev) => !prev)}
              className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              title={showBalance ? "Hide balance" : "Show balance"}
              aria-label={showBalance ? "Hide balance" : "Show balance"}
            >
              {showBalance ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
          </div>
          <p className="text-3xl sm:text-4xl font-bold mt-1 tracking-tight select-none">
            {showBalance ? formattedBalance : "••••••••"}
          </p>
        </div>

        <div className="relative flex flex-wrap items-center sm:flex-col sm:items-end gap-2.5">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={openModal}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white text-sky-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-sky-50 shadow-xs hover:shadow transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus size={15} />
              Add Funds
            </button>
            <button
              type="button"
              onClick={() => setShowTransferModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-sky-500/30 text-white border border-white/20 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-sky-500/40 shadow-xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Send size={14} />
              Send Money
            </button>
          </div>
          <Link
            href="/dashboard/transactions"
            className="flex items-center gap-1.5 bg-white/10 text-white text-xs sm:text-sm font-medium px-4 py-1.5 rounded-full hover:bg-white/20 transition-all"
          >
            History
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Transfer Funds Modal */}
      <TransferFundsModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        availableBalance={Number(balance) || 0}
        onSuccess={() => {
          refreshUser();
        }}
      />

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-2xl transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Add Funds
              </h2>
              <button
                onClick={closeModal}
                disabled={isFunding}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Amount ({currency})
            </label>
            <input
              type="number"
              autoFocus
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddFunds()}
              placeholder="0.00"
              className="w-full rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 px-4 py-3 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 dark:focus:border-sky-400 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all shadow-2xs"
            />
            {Number(amountInput) > 0 && (() => {
              const amt = Number(amountInput);
              const gross = amt < 2500 ? Math.ceil((amt / 0.99) * 100) / 100 : (amt + 100) / 0.99 * 0.01 + 100 >= 2000 ? amt + 2000 : Math.ceil(((amt + 100) / 0.99) * 100) / 100;
              const fee = Math.round((gross - amt) * 100) / 100;
              return (
                <div className="mt-2.5 rounded-xl bg-slate-100/80 dark:bg-white/5 p-2.5 text-xs space-y-1 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/5">
                  <div className="flex justify-between">
                    <span>Deposit:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₦{amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fee (1% + ₦100):</span>
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
            {error && <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400">{error}</p>}

            <button
              onClick={handleAddFunds}
              disabled={isFunding}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 text-white text-sm font-semibold py-3 rounded-xl shadow-sm hover:shadow-glow transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isFunding ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Redirecting to payment...</span>
                </>
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default BalanceCard;
