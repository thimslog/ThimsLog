"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { toast } from "@/components/ui/toast";
import TransferFundsModal from "@/components/dashboard/TransferFundsModal";
import {
  WalletData,
  WalletHeroCard,
  WalletVirtualAccountCard,
  WalletOnlineFundCard,
} from "@/components/dashboard/wallet";

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
  const [showTransferModal, setShowTransferModal] = useState(false);
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

  // Handle URL payment return status or transfer action
  useEffect(() => {
    const payment = searchParams.get("payment");
    const amount = searchParams.get("amount");
    const action = searchParams.get("action");

    if (action === "transfer") {
      setShowTransferModal(true);
    }

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
      toast.success("Virtual account generated successfully!");
      await refreshUser();
    } catch (err: any) {
      console.error("Generate account error:", err);
      const msg = err?.message || "Failed to generate virtual account";
      setError(msg);
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success("Copied to clipboard!");
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleManualFundSubmit = async () => {
    const amount = Number(manualAmount);
    if (!amount || amount < 1000) {
      const msg = "Minimum deposit amount is ₦1,000";
      setManualError(msg);
      toast.error(msg);
      return;
    }
    if (amount > 1000000) {
      const msg = "Maximum deposit amount is ₦1,000,000";
      setManualError(msg);
      toast.error(msg);
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
      const msg = err?.message || "Failed to initiate payment";
      setManualError(msg);
      toast.error(msg);
      setIsSubmittingManual(false);
    }
  };

  const currentBalance = wallet?.balance ?? Number(user?.wallet?.balance ?? 0);
  const currentCurrency = wallet?.currency || "NGN";

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
      <WalletHeroCard
        balance={currentBalance}
        currency={currentCurrency}
        loading={loading}
        refreshing={refreshing}
        onRefresh={() => fetchWallet(true)}
        userName={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
        onOpenTransfer={() => setShowTransferModal(true)}
      />

      {/* Transfer Funds Modal */}
      <TransferFundsModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        availableBalance={currentBalance}
        onSuccess={() => {
          fetchWallet(true);
        }}
      />

      {/* Virtual Account Card */}
      <WalletVirtualAccountCard
        loading={loading}
        generating={generating}
        wallet={wallet}
        userName={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
        copiedField={copiedField}
        onGenerateAccount={handleGenerateAccount}
        onCopyField={copyToClipboard}
      />

      {/* Online / Manual Gateway Funding */}
      <WalletOnlineFundCard
        showManualFund={showManualFund}
        setShowManualFund={setShowManualFund}
        manualAmount={manualAmount}
        setManualAmount={setManualAmount}
        amountPresets={amountPresets}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        isSubmittingManual={isSubmittingManual}
        manualError={manualError}
        setManualError={setManualError}
        handleManualFundSubmit={handleManualFundSubmit}
      />
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
