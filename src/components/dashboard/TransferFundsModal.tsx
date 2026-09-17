"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Send,
  UserCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

interface TransferFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  onSuccess?: (newBalance: number) => void;
}

interface VerifiedRecipient {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export default function TransferFundsModal({
  isOpen,
  onClose,
  availableBalance,
  onSuccess,
}: TransferFundsModalProps) {
  const [recipientInput, setRecipientInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<VerifiedRecipient | null>(null);
  const [lookupError, setLookupError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState<any | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setRecipientInput("");
      setAmountInput("");
      setNoteInput("");
      setVerifiedUser(null);
      setLookupError("");
      setSubmitError("");
      setTransferSuccess(null);
    }
  }, [isOpen]);

  // Debounced username verification
  useEffect(() => {
    const clean = recipientInput.trim().replace(/^@/, "");
    if (!clean || clean.length < 2) {
      setVerifiedUser(null);
      setLookupError("");
      return;
    }

    setIsVerifying(true);
    setLookupError("");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/wallet/transfer/lookup?username=${encodeURIComponent(clean)}`
        );
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.valid && data.user) {
          setVerifiedUser(data.user);
          setLookupError("");
        } else {
          setVerifiedUser(null);
          setLookupError(data.message || "Recipient not found");
        }
      } catch (err) {
        setVerifiedUser(null);
        setLookupError("Network error checking username");
      } finally {
        setIsVerifying(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [recipientInput]);

  const numericAmount = Number(amountInput) || 0;
  const isAmountValid = numericAmount > 0 && numericAmount <= availableBalance;

  const handleApplyPercentage = (pct: number) => {
    if (availableBalance <= 0) return;
    const calculated = Math.floor((availableBalance * pct) / 100);
    setAmountInput(calculated.toString());
  };

  const handleTransfer = async () => {
    if (!verifiedUser) {
      setSubmitError("Please enter and verify a valid recipient username");
      return;
    }

    if (numericAmount <= 0) {
      setSubmitError("Please enter a valid amount");
      return;
    }

    if (numericAmount > availableBalance) {
      setSubmitError("Amount exceeds your available wallet balance");
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientUsername: verifiedUser.userName,
          amount: numericAmount,
          note: noteInput.trim() || undefined,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || "Transfer failed");
      }

      setTransferSuccess(data);
      toast.success(
        `Sent ₦${numericAmount.toLocaleString()} to @${verifiedUser.userName}`
      );
      if (onSuccess && data.data?.newBalance !== undefined) {
        onSuccess(Number(data.data.newBalance));
      }
    } catch (err: any) {
      const msg = err?.message || "Transfer failed. Please try again.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-2xl transition-all relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 dark:bg-sky-400/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Send size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                Send Money
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Instant free transfer to any Thimslog user
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Transfer Success Screen */}
        {transferSuccess ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 size={36} className="animate-in zoom-in-75 duration-300" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Transfer Successful!
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                You sent{" "}
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₦{numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-sky-600 dark:text-sky-400">
                  @{verifiedUser?.userName}
                </span>
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-white/5 p-4 text-xs space-y-2 border border-slate-200 dark:border-white/5 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Recipient Name</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {verifiedUser?.fullName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Recipient Username</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  @{verifiedUser?.userName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Transfer Fee</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  ₦0.00 (Free)
                </span>
              </div>
              {noteInput && (
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-white/5">
                  <span className="text-slate-500 dark:text-slate-400">Note</span>
                  <span className="font-medium text-slate-900 dark:text-white italic">
                    "{noteInput}"
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-sky-600 hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 text-white text-sm font-semibold py-3 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Done
            </button>
          </div>
        ) : (
          /* Transfer Form */
          <div className="space-y-4">
            {/* Recipient Username Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Recipient Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                  @
                </span>
                <input
                  type="text"
                  autoFocus
                  placeholder="username"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  className="w-full pl-8 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 dark:focus:border-sky-400 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isVerifying && <Loader2 size={16} className="animate-spin text-sky-500" />}
                  {!isVerifying && verifiedUser && (
                    <UserCheck size={17} className="text-emerald-500" />
                  )}
                  {!isVerifying && lookupError && (
                    <AlertCircle size={17} className="text-rose-500" />
                  )}
                </div>
              </div>

              {/* Verified Recipient Card */}
              {verifiedUser && (
                <div className="mt-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white dark:bg-emerald-400 dark:text-slate-950 flex items-center justify-center text-xs font-bold">
                      {verifiedUser.firstName?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-950 dark:text-emerald-200 leading-tight">
                        {verifiedUser.fullName}
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        @{verifiedUser.userName}
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    <ShieldCheck size={12} />
                    Verified
                  </span>
                </div>
              )}

              {/* Lookup Error */}
              {lookupError && (
                <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertCircle size={13} />
                  {lookupError}
                </p>
              )}
            </div>

            {/* Transfer Amount Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Amount (₦)
                </label>
                <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Wallet size={12} />
                  <span>
                    Balance:{" "}
                    <strong className="text-slate-900 dark:text-white">
                      ₦{availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ₦
                </span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 dark:focus:border-sky-400 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
                />
              </div>

              {/* Percentage shortcut buttons */}
              <div className="flex items-center gap-2 mt-2">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handleApplyPercentage(pct)}
                    className="flex-1 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-white/5"
                  >
                    {pct === 100 ? "MAX" : `${pct}%`}
                  </button>
                ))}
              </div>

              {numericAmount > availableBalance && (
                <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
                  Insufficient balance. Available: ₦{availableBalance.toLocaleString()}
                </p>
              )}
            </div>

            {/* Note Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Note (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Account purchase payment"
                maxLength={80}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 dark:focus:border-sky-400 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
              />
            </div>

            {/* Summary Box */}
            {verifiedUser && numericAmount > 0 && isAmountValid && (
              <div className="rounded-xl bg-slate-50 dark:bg-white/5 p-3 text-xs space-y-1 border border-slate-200 dark:border-white/5">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Transfer Amount:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ₦{numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Internal Fee:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ₦0.00 (Free)
                  </span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-white/10 font-bold text-slate-900 dark:text-white">
                  <span>Total Debit:</span>
                  <span className="text-sky-600 dark:text-sky-400">
                    ₦{numericAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            )}

            {submitError && (
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                {submitError}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleTransfer}
              disabled={
                isSubmitting ||
                !verifiedUser ||
                !isAmountValid ||
                numericAmount <= 0
              }
              className="mt-2 w-full flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 text-white text-sm font-semibold py-3 rounded-xl shadow-sm hover:shadow-glow transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing Transfer...</span>
                </>
              ) : verifiedUser ? (
                <>
                  <span>Send ₦{numericAmount > 0 ? numericAmount.toLocaleString() : "0"} to @{verifiedUser.userName}</span>
                  <ArrowRight size={15} />
                </>
              ) : (
                "Verify Recipient to Continue"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
