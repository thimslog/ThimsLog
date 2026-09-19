"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiMutate } from "@/lib/api-client";
import { useAdminPage } from "@/context/admin-page-context";
import { toast } from "@/components/ui/toast";
import {
  DashboardData,
  DashboardHeader,
  PaymonetraBalanceCard,
  DashboardKpiCards,
  RecentOrdersCard,
  InventoryHealthCard,
  RecentTransactionsCard,
  RecentTicketsCard,
} from "@/components/admin/dashboard";

export default function AdminDashboardPage() {
  const { setPageTitle } = useAdminPage();
  const queryClient = useQueryClient();
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const {
    data,
    isLoading: loading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: async () => {
      const res = await apiGet<{ success: boolean; data: DashboardData }>(
        "/api/admin/dashboard"
      );
      return res.data;
    },
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchInterval: 15000,
  });

  const paymonetraMutation = useMutation({
    mutationFn: () =>
      apiGet<{
        success: boolean;
        balance: number;
        collectedAmount?: number;
        collectedReady?: number;
        collectedClearing?: number;
        settledAmount?: number;
        ledgerBalance?: number;
        currency?: string;
        mode?: string;
        message?: string;
      }>("/api/admin/paymonetra/balance"),
    onSuccess: (json) => {
      if (json.success) {
        queryClient.setQueryData<DashboardData>(
          ["admin", "dashboard"],
          (old) => {
            if (!old) return old;
            return {
              ...old,
              paymonetra: {
                balance: json.balance,
                collectedAmount: json.collectedAmount,
                collectedReady: json.collectedReady,
                collectedClearing: json.collectedClearing,
                settledAmount: json.settledAmount,
                ledgerBalance: json.ledgerBalance,
                currency: json.currency || "NGN",
                mode: json.mode,
                status: "connected",
              },
            };
          }
        );
        toast.success("Paymonetra balance updated!");
      } else {
        toast.error(json.message || "Failed to fetch Paymonetra balance");
      }
    },
    onError: () => {
      toast.error("Network error refreshing Paymonetra balance");
    },
  });

  const verifyMutation = useMutation({
    mutationFn: (txId: string) =>
      apiMutate<{ updated: boolean; message?: string }>(
        `/api/admin/transactions/${txId}/verify`,
        "POST"
      ),
    onSuccess: (result) => {
      if (result.updated) {
        toast.success(result.message || "Transaction settled successfully!");
      } else {
        toast.info(result.message || "Gateway reported transaction still pending.");
      }
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: () => {
      toast.error("Error verifying payment with gateway");
    },
    onSettled: () => {
      setVerifyingId(null);
    },
  });

  useEffect(() => {
    setPageTitle({
      title: "Dashboard Overview",
      subtitle: "Live telemetry, revenue, inventory health, and operations",
    });
  }, [setPageTitle]);

  const handleRefresh = async () => {
    await refetch();
    toast.success("Dashboard metrics refreshed");
  };

  const handleRefreshPaymonetra = () => {
    paymonetraMutation.mutate();
  };

  const handleQueryTransaction = (txId: string) => {
    setVerifyingId(txId);
    verifyMutation.mutate(txId);
  };

  return (
    <main className="p-6 space-y-6 font-sans">
      {/* Top Status Bar & Refresh Control */}
      <DashboardHeader
        loading={loading || isRefetching}
        onRefresh={handleRefresh}
      />

      {/* 0. PAYMONETRA GATEWAY LIVE BALANCE SINGLE CARD (PROMINENT AT TOP) */}
      <PaymonetraBalanceCard
        balance={data?.paymonetra?.balance ?? 0}
        collectedAmount={data?.paymonetra?.collectedAmount}
        collectedReady={data?.paymonetra?.collectedReady}
        collectedClearing={data?.paymonetra?.collectedClearing}
        settledAmount={data?.paymonetra?.settledAmount}
        ledgerBalance={data?.paymonetra?.ledgerBalance}
        currency={data?.paymonetra?.currency}
        mode={data?.paymonetra?.mode}
        refreshing={paymonetraMutation.isPending}
        disabled={loading}
        onRefresh={handleRefreshPaymonetra}
      />

      {/* 1. TOP KPI METRICS CARDS */}
      <DashboardKpiCards
        settledRevenue={data?.financials.totalSettledRevenue || 0}
        settledCount={data?.financials.successCount ?? 0}
        walletLiability={data?.financials.totalWalletLiability || 0}
        totalUsers={data?.users.totalUsers ?? 0}
        accountsAvailable={data?.sales.accountsAvailable ?? 0}
        accountsSold={data?.sales.accountsSold ?? 0}
        pendingTransactionsCount={data?.financials.pendingTransactionsCount ?? 0}
        openTicketsCount={data?.support.openTicketsCount ?? 0}
      />

      {/* 2. RECENT ORDERS (60%) & LOW STOCK RESTOCK ALERTS (40%) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <RecentOrdersCard
          orders={data?.recentOrders || []}
          totalOrdersCount={data?.sales.totalOrdersCount ?? 0}
          loading={loading}
        />
        <InventoryHealthCard
          lowStockProducts={data?.lowStockProducts || []}
        />
      </section>

      {/* 3. RECENT TRANSACTIONS & URGENT SUPPORT TICKETS QUEUE */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <RecentTransactionsCard
          transactions={data?.recentTransactions || []}
          loading={loading}
          verifyingId={verifyingId}
          onQueryTransaction={handleQueryTransaction}
        />
        <RecentTicketsCard
          tickets={data?.recentTickets || []}
          openTicketsCount={data?.support.openTicketsCount ?? 0}
        />
      </section>
    </main>
  );
}
