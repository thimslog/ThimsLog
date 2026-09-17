"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  RotateCw,
  Landmark,
  Copy,
  Check,
  Zap,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Building2,
  User,
  ArrowDownToLine,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  CreditCard,
  CheckCircle,
  Lock,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface WalletData {
  id?: string;
  balance: number;
  currency: string;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  virtualAccountReference: string | null;
}

function WalletContent() {
  const { user, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Manual / Online funding state
  const amountPresets = [1000, 2500, 5000, 10000, 20000, 50000];
  const [showManualFund, setShowManualFund] = useState(false);
  const [manualAmount, setManualAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("paymonetra");
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  const fetchWallet = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);

    try {
      const res = await fetch("/api/wallet/virtual-account", {
        cache: "no-store",
      });
      const data = await res.json();

      if (data.success && data.wallet) {
        setWallet(data.wallet);
      } else {
        // Fallback to user auth wallet
        setWallet({
          balance: Number(user?.wallet?.balance ?? 0),
          currency: "NGN",
          bankName: user?.wallet?.bankName ?? null,
          accountNumber: user?.wallet?.accountNumber ?? null,
          accountName: user?.wallet?.accountName ?? null,
          virtualAccountReference: user?.wallet?.virtualAccountReference ?? null,
        });
      }
      if (isManualRefresh) {
        await refreshUser();
      }
    } catch (err: any) {
      console.error("Fetch wallet error:", err);
    } finally {
      setLoading(false);
      if (isManualRefresh) setRefreshing(false);
    }
  }, [user, refreshUser]);

  useEffect(() => {
    fetchWallet();
  }, []);

  // Listen to browser back button (pageshow) and window focus to reset inputs and refresh balance
  useEffect(() => {
    const handleResetAndRefresh = () => {
      setIsSubmittingManual(false);
      setManualAmount("");
      setManualError(null);
      fetchWallet(true);
    };

    window.addEventListener("pageshow", handleResetAndRefresh);
    window.addEventListener("focus", handleResetAndRefresh);

    return () => {
      window.removeEventListener("pageshow", handleResetAndRefresh);
      window.removeEventListener("focus", handleResetAndRefresh);
    };
  }, [fetchWallet]);

  // Handle URL payment return status
  useEffect(() => {
    const payment = searchParams.get("payment");
    const amount = searchParams.get("amount");

    if (payment === "success") {
      const formatted = amount
        ? `₦${Number(amount).toLocaleString()}`
        : "your funds";
      setSuccess(`Payment successful! ${formatted} has been credited to your wallet.`);
      fetchWallet(true);
      router.replace("/dashboard/wallet");
    } else if (payment === "failed") {
      setError("Payment could not be completed or was cancelled.");
      router.replace("/dashboard/wallet");
    }
  }, [searchParams, fetchWallet, router]);

  const handleGenerateAccount = async () => {
    setGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/wallet/virtual-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to generate virtual account. Please ensure your provider key is set up."
        );
      }

      setWallet(data.wallet);
      setSuccess("Virtual account generated successfully!");
      await refreshUser();
    } catch (err: any) {
      console.error("Generate account error:", err);
      setError(err?.message || "Failed to generate virtual account");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleManualFundSubmit = async () => {
    const amount = Number(manualAmount);
    if (!amount || amount < 1000) {
      setManualError("Minimum deposit amount is ₦1,000");
      return;
    }
    if (amount > 1000000) {
      setManualError("Maximum deposit amount is ₦1,000,000");
      return;
    }

    setManualError(null);
    setIsSubmittingManual(true);

    try {
      const res = await fetch("/api/wallet/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message ?? "Could not initiate payment");
      }

      if (!data.checkoutUrl) {
        throw new Error("No checkout URL returned from payment provider");
      }

      // Reset form state before navigating away
      setManualAmount("");
      setIsSubmittingManual(false);
      setShowManualFund(false);

      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setManualError(err?.message || "Failed to initiate payment");
      setIsSubmittingManual(false);
    }
  };

  const formattedBalance = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: wallet?.currency || "NGN",
  }).format(wallet?.balance ?? Number(user?.wallet?.balance ?? 0));

  const hasVirtualAccount = Boolean(wallet?.accountNumber);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Notifications */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 transition-all">
          <AlertCircle size={20} className="shrink-0 text-rose-600 dark:text-rose-400" />
          <p className="text-sm font-medium flex-1">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-xs font-semibold px-2 py-1 rounded-lg hover:bg-rose-100 dark:hover:bg-white/10 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 transition-all">
          <ShieldCheck size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-medium flex-1">{success}</p>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            className="text-xs font-semibold px-2 py-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-white/10 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Available Funds Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-600 via-sky-500 to-sky-700 dark:from-sky-700 dark:via-sky-800 dark:to-slate-900 text-white p-8 sm:p-10 shadow-lg shadow-sky-600/15 transition-all">
        {/* Decorative Background Circles */}
        <div className="absolute -left-12 -top-12 w-48 h-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-sky-100 opacity-90">
              AVAILABLE FUNDS
            </span>
            <button
              type="button"
              onClick={() => fetchWallet(true)}
              disabled={refreshing}
              className="p-1 rounded-full text-sky-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Balance"
              aria-label="Refresh Balance"
            >
              <RotateCw
                size={14}
                className={refreshing ? "animate-spin text-white" : ""}
              />
            </button>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight select-none">
            {loading ? "••••••••" : formattedBalance}
          </h1>

          <p className="text-xs sm:text-sm text-sky-100/90 font-medium">
            Account Owner: <span className="font-semibold text-white">{user?.firstName} {user?.lastName}</span>
          </p>
        </div>
      </div>

      {/* Instant Funding Section Header */}
      <div className="text-center space-y-1.5 pt-2">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-2">
          <Zap size={22} className="text-sky-600 dark:text-sky-400 fill-sky-500" />
          Instant Funding
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Transfer to any of these virtual accounts to fund your wallet instantly.
        </p>
      </div>

      {/* Virtual Account Container */}
      <div className="max-w-xl mx-auto">
        {loading ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 p-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 size={32} className="text-sky-600 dark:text-sky-400 animate-spin" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Loading wallet details...
            </p>
          </div>
        ) : !hasVirtualAccount ? (
          /* Empty State: No Virtual Account Yet */
          <div className="rounded-3xl border-2 border-dashed border-sky-300 dark:border-sky-500/30 bg-sky-50/40 dark:bg-sky-950/20 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-5 transition-all shadow-xs">
            {/* Center Bank Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-sky-600 dark:from-sky-500 dark:to-sky-700 text-white flex items-center justify-center shadow-md shadow-sky-500/30">
              <Landmark size={30} />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                No Virtual Account Yet
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Generate a dedicated virtual account to receive instant transfers
                and auto-fund your wallet.
              </p>
            </div>

            <button
              type="button"
              onClick={handleGenerateAccount}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-600 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Generating Account...</span>
                </>
              ) : (
                <span>+ Generate Virtual Account</span>
              )}
            </button>
          </div>
        ) : (
          /* Active Virtual Account Card */
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#0b101b] p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none transition-all space-y-6">
              {/* Card Header with Bank and Active Badge */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Bank Provider</p>
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      {wallet?.bankName || "Wema Bank"}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Instant Credit
                </span>
              </div>

              {/* Account Number Display */}
              <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-5 border border-slate-200/70 dark:border-white/10 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                    Account Number
                  </p>
                  <p className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-900 dark:text-white tracking-wider select-all">
                    {wallet?.accountNumber}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard(wallet?.accountNumber || "", "accountNumber")}
                  className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                >
                  {copiedField === "accountNumber" ? (
                    <>
                      <Check size={15} />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Account Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Account Name</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {wallet?.accountName || `${user?.firstName} ${user?.lastName}`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(wallet?.accountName || `${user?.firstName} ${user?.lastName}`, "accountName")}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="Copy account name"
                  >
                    {copiedField === "accountName" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Bank Name</p>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {wallet?.bankName || "Wema Bank"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(wallet?.bankName || "Wema Bank", "bankName")}
                    className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                    title="Copy bank name"
                  >
                    {copiedField === "bankName" ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Instructions Note */}
              <div className="rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-500/20 p-4.5 space-y-2">
                <div className="flex items-center gap-2 text-sky-900 dark:text-sky-300 font-bold text-xs">
                  <Zap size={14} className="fill-sky-500 text-sky-500" />
                  <span>How to Fund Your Wallet:</span>
                </div>
                <ol className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-decimal list-inside pl-1">
                  <li>Open your bank app or internet banking.</li>
                  <li>Transfer any amount to <strong>{wallet?.accountNumber}</strong> ({wallet?.bankName || "Wema Bank"}).</li>
                  <li>Your wallet balance will credit automatically within seconds.</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Other Payment Option Section Divider */}
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
                const gross = amt < 2500 ? Math.ceil((amt / 0.99) * 100) / 100 : (amt + 100) / 0.99 * 0.01 + 100 >= 2000 ? amt + 2000 : Math.ceil(((amt + 100) / 0.99) * 100) / 100;
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
                <span>Minimum deposit: <strong>₦1,000</strong> — Maximum: <strong>₦1,000,000</strong></span>
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
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={null}>
      <WalletContent />
    </Suspense>
  );
}
