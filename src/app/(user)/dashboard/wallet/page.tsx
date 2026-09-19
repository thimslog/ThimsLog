"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { toast } from "@/components/ui/toast";
import TransferFundsModal from "@/components/dashboard/TransferFundsModal";
import { apiGet, apiMutate } from "@/lib/api-client";
import {
  WalletData,
  WalletHeroCard,
  WalletVirtualAccountCard,
  WalletOnlineFundCard,
} from "@/components/dashboard/wallet";

function WalletContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Manual / Online funding form state
  const amountPresets = [1000, 2500, 5000, 10000, 20000, 50000];
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showManualFund, setShowManualFund] = useState(false);
  const [manualAmount, setManualAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("paymonetra");
  const [manualError, setManualError] = useState<string | null>(null);

  // 1. React Query for Virtual Account & Balance
  const {
    data: walletResponse,
    isLoading: loading,
    isFetching: refreshing,
    refetch,
  } = useQuery({
    queryKey: ["wallet", "virtual-account"],
    queryFn: () => apiGet<{ success: boolean; wallet: WalletData }>("/api/wallet/virtual-account"),
    staleTime: 30 * 1000,
  });

  const wallet: WalletData | null = walletResponse?.wallet || (user?.wallet ? {
    balance: Number(user.wallet.balance ?? 0),
    currency: "NGN",
    bankName: user.wallet.bankName ?? null,
    accountNumber: user.wallet.accountNumber ?? null,
    accountName: user.wallet.accountName ?? null,
    virtualAccountReference: user.wallet.virtualAccountReference ?? null,
  } : null);

  // 2. React Query Mutation: Generate Virtual Account
  const generateAccountMutation = useMutation({
    mutationFn: () =>
      apiMutate<{ success: boolean; message?: string; wallet: WalletData }>(
        "/api/wallet/virtual-account",
        { method: "POST" }
      ),
    onSuccess: () => {
      setSuccess("Virtual account generated successfully!");
      toast.success("Virtual account generated successfully!");
      queryClient.invalidateQueries({ queryKey: ["wallet", "virtual-account"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
    onError: (err: any) => {
      const msg = err?.message || "Failed to generate virtual account";
      setNotificationError(msg);
      toast.error(msg);
    },
  });

  // 3. React Query Mutation: Online Fund Wallet
  const fundWalletMutation = useMutation({
    mutationFn: (amount: number) =>
      apiMutate<{ checkoutUrl: string; message?: string }>("/api/wallet/fund", {
        method: "POST",
        body: { amount },
      }),
    onSuccess: (data) => {
      if (!data.checkoutUrl) {
        throw new Error("No checkout URL returned from payment provider");
      }
      setManualAmount("");
      setShowManualFund(false);
      window.location.href = data.checkoutUrl;
    },
    onError: (err: any) => {
      const msg = err?.message || "Failed to initiate payment";
      setManualError(msg);
      toast.error(msg);
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ["wallet", "virtual-account"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      router.replace("/dashboard/wallet");
    } else if (payment === "failed") {
      setNotificationError("Payment could not be completed or was cancelled.");
      router.replace("/dashboard/wallet");
    }
  }, [searchParams, queryClient, router]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success("Copied to clipboard!");
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleManualFundSubmit = () => {
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
    fundWalletMutation.mutate(amount);
  };

  const handleManualRefresh = async () => {
    try {
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      toast.success("Balance updated!");
    } catch {
      toast.error("Failed to refresh balance");
    }
  };

  const currentBalance = wallet?.balance ?? Number(user?.wallet?.balance ?? 0);
  const currentCurrency = wallet?.currency || "NGN";

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Notifications */}
      {notificationError && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 transition-all">
          <AlertCircle size={20} className="shrink-0 text-rose-600 dark:text-rose-400" />
          <p className="text-sm font-medium flex-1">{notificationError}</p>
          <button
            type="button"
            onClick={() => setNotificationError(null)}
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
        onRefresh={handleManualRefresh}
        userName={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
        onOpenTransfer={() => setShowTransferModal(true)}
      />

      {/* Transfer Funds Modal */}
      <TransferFundsModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        availableBalance={currentBalance}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["wallet", "virtual-account"] });
          queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
        }}
      />

      {/* Virtual Account Card */}
      <WalletVirtualAccountCard
        loading={loading}
        generating={generateAccountMutation.isPending}
        wallet={wallet}
        userName={`${user?.firstName || ""} ${user?.lastName || ""}`.trim()}
        copiedField={copiedField}
        onGenerateAccount={() => generateAccountMutation.mutate()}
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
        isSubmittingManual={fundWalletMutation.isPending}
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
