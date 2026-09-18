"use client";

import { useEffect, useState, useCallback } from "react";
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [refreshingPaymonetra, setRefreshingPaymonetra] = useState(false);

  const handleRefreshPaymonetra = async () => {
    try {
      setRefreshingPaymonetra(true);
      const res = await fetch("/api/admin/paymonetra/balance", {
        method: "GET",
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                paymonetra: {
                  balance: json.balance,
                  collectedAmount: json.collectedAmount,
                  collectedReady: json.collectedReady,
                  collectedClearing: json.collectedClearing,
                  settledAmount: json.settledAmount,
                  ledgerBalance: json.ledgerBalance,
                  currency: json.currency,
                  mode: json.mode,
                  status: "connected",
                },
              }
            : prev
        );
        toast.success("Paymonetra balance updated!");
      } else {
        toast.error(json.message || "Failed to fetch Paymonetra balance");
      }
    } catch {
      toast.error("Network error refreshing Paymonetra balance");
    } finally {
      setRefreshingPaymonetra(false);
    }
  };

  const fetchDashboardData = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/dashboard", {
        method: "GET",
        cache: "no-store",
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        if (showToast) toast.success("Dashboard metrics refreshed");
      } else {
        toast.error(json.message || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error loading dashboard metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPageTitle({
      title: "Dashboard Overview",
      subtitle: "Live telemetry, revenue, inventory health, and operations",
    });
    fetchDashboardData();
  }, [setPageTitle, fetchDashboardData]);

  const handleQueryTransaction = async (txId: string) => {
    setVerifyingId(txId);
    try {
      const res = await fetch(`/api/admin/transactions/${txId}/verify`, {
        method: "POST",
      });
      const result = await res.json();
      if (result.updated) {
        toast.success(result.message || "Transaction settled successfully!");
      } else {
        toast.info(result.message || "Gateway reported transaction still pending.");
      }
      fetchDashboardData();
    } catch {
      toast.error("Error verifying payment with gateway");
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <main className="p-6 space-y-6 font-sans">
      {/* Top Status Bar & Refresh Control */}
      <DashboardHeader
        loading={loading}
        onRefresh={() => fetchDashboardData(true)}
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
        refreshing={refreshingPaymonetra}
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
