"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, AlertCircle, X, Loader2 } from "lucide-react";
import DisclaimerBanner from "./dashboard/DisclaimerBanner";
import QuickActionsBar from "./dashboard/QuickActionsBar";
import BalanceCard from "./dashboard/BalanceCard";
import { useAuth } from "@/context/auth-context";

interface DashboardContentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userName: string;
  createdAt: Date | string;
  wallet?: { balance: any };
}

interface DashboardContentProps {
  user: DashboardContentUser;
}

const DashboardContent: React.FC<DashboardContentProps> = ({ user }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [paymentNotice, setPaymentNotice] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  useEffect(() => {
    // Refresh user balance on dashboard mount
    refreshUser();

    const paymentStatus = searchParams.get("payment");
    const amount = searchParams.get("amount");

    if (paymentStatus === "success") {
      const formattedAmount = amount
        ? `₦${Number(amount).toLocaleString()}`
        : "your funds";
      setPaymentNotice({
        type: "success",
        message: `Payment successful! ${formattedAmount} has been credited to your wallet balance.`,
      });

      // Poll/refresh user to ensure latest balance is loaded
      refreshUser();
      const timer = setTimeout(() => {
        refreshUser();
      }, 1500);

      // Clean query params from URL
      router.replace("/dashboard");

      return () => clearTimeout(timer);
    } else if (paymentStatus === "failed") {
      setPaymentNotice({
        type: "error",
        message: "Payment could not be completed or was cancelled.",
      });
      router.replace("/dashboard");
    } else if (paymentStatus === "processing") {
      setPaymentNotice({
        type: "info",
        message: "Your payment is currently processing. Your balance will update automatically once confirmed.",
      });
      router.replace("/dashboard");
    }
  }, [searchParams, refreshUser, router]);

  return (
    <main className="space-y-6">
      {paymentNotice && (
        <div
          className={`flex items-center justify-between gap-3 px-5 py-4 rounded-2xl border transition-all ${
            paymentNotice.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300"
              : paymentNotice.type === "error"
              ? "bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300"
              : "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-500/20 text-sky-800 dark:text-sky-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {paymentNotice.type === "success" && (
              <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            {paymentNotice.type === "error" && (
              <AlertCircle size={20} className="text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            {paymentNotice.type === "info" && (
              <Loader2 size={20} className="text-sky-600 dark:text-sky-400 animate-spin shrink-0" />
            )}
            <p className="text-sm font-medium">{paymentNotice.message}</p>
          </div>
          <button
            type="button"
            onClick={() => setPaymentNotice(null)}
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <DisclaimerBanner>
        This platform provides digital tools for legitimate use only. Users are
        responsible.
      </DisclaimerBanner>

      <QuickActionsBar />

      <BalanceCard
        name={user.firstName}
        balance={Number(user?.wallet?.balance ?? 0)}
      />

      {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <CommunicationToolsCard />
            <SocialMediaMarketplaceCard />
            <BillPaymentsCard />
          </div> */}
    </main>
  );
};

export default DashboardContent;
