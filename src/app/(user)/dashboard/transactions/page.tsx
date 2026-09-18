"use client";

import { useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import TransferFundsModal from "@/components/dashboard/TransferFundsModal";
import { useAuth } from "@/context/auth-context";
import {
  TransactionRow,
  TransactionsHeader,
  TransactionsTable,
  TransactionDetailsModal,
} from "@/components/dashboard/transactions";

export default function TransactionsPage() {
  const { user, refreshUser } = useAuth();
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<TransactionRow | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  const refetchTransactions = async () => {
    try {
      const res = await fetch("/api/wallet/transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error("Failed to refresh transactions:", err);
    }
  };

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/wallet/transactions");
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
        toast.success("Transactions updated!");
      } else {
        toast.error("Failed to refresh transactions");
      }
      await refreshUser();
    } catch (err) {
      console.error("Failed to refresh transactions:", err);
      toast.error("Network error while refreshing transactions");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/wallet/transactions");
        if (!res.ok) throw new Error("Could not load transaction history");
        const data = await res.json();
        setTransactions(data.transactions || []);
      } catch (err) {
        setError((err as Error).message);
        toast.error((err as Error).message || "Could not load transaction history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      const res = await fetch(`/api/wallet/transactions/${id}/verify`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.message || "Could not verify transaction");
        return;
      }

      if (data.updated) {
        toast.success(
          data.message || "Transaction verified successfully! Wallet balance updated."
        );
      } else {
        toast.info(
          data.message || "Transaction is still pending on payment gateway."
        );
      }

      await refetchTransactions();
      await refreshUser();
    } catch (err: any) {
      toast.error(err?.message || "Network error while querying transaction");
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <TransactionsHeader
        refreshing={refreshing}
        onRefresh={handleManualRefresh}
        onOpenSendMoney={() => setShowTransferModal(true)}
      />

      {/* 2. Transfer Funds Modal */}
      <TransferFundsModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        availableBalance={Number(user?.wallet?.balance ?? 0)}
        onSuccess={() => {
          refetchTransactions();
          refreshUser();
        }}
      />

      {/* 3. Transactions Table */}
      <TransactionsTable
        transactions={transactions}
        loading={loading}
        error={error}
        verifyingId={verifyingId}
        onSelectTransaction={setSelected}
        onVerifyTransaction={handleVerify}
      />

      {/* 4. Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
