"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/toast";
import TransferFundsModal from "@/components/dashboard/TransferFundsModal";
import { useAuth } from "@/context/auth-context";
import { apiGet, apiMutate } from "@/lib/api-client";
import {
  TransactionRow,
  TransactionsHeader,
  TransactionsTable,
  TransactionDetailsModal,
} from "@/components/dashboard/transactions";

export default function TransactionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<TransactionRow | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // 1. React Query for transactions list
  const {
    data: transactionsData,
    isLoading: loading,
    isFetching: refreshing,
    error,
    refetch,
  } = useQuery({
    queryKey: ["wallet", "transactions"],
    queryFn: () => apiGet<{ transactions: TransactionRow[] }>("/api/wallet/transactions"),
    staleTime: 30 * 1000,
  });

  const transactions = transactionsData?.transactions || [];

  // 2. React Query Mutation for verifying a transaction
  const verifyMutation = useMutation({
    mutationFn: (id: string) =>
      apiMutate<{ updated?: boolean; message?: string }>(
        `/api/wallet/transactions/${id}/verify`,
        { method: "POST" }
      ),
    onSuccess: (data) => {
      if (data.updated) {
        toast.success(
          data.message || "Transaction verified successfully! Wallet balance updated."
        );
      } else {
        toast.info(
          data.message || "Transaction is still pending on payment gateway."
        );
      }
      queryClient.invalidateQueries({ queryKey: ["wallet", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "virtual-account"] });
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Network error while querying transaction");
    },
  });

  const handleManualRefresh = async () => {
    try {
      await refetch();
      await queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      toast.success("Transactions updated!");
    } catch {
      toast.error("Failed to refresh transactions");
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
          queryClient.invalidateQueries({ queryKey: ["wallet", "transactions"] });
          queryClient.invalidateQueries({ queryKey: ["wallet", "virtual-account"] });
          queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
        }}
      />

      {/* 3. Transactions Table */}
      <TransactionsTable
        transactions={transactions}
        loading={loading}
        error={error ? (error as Error).message : ""}
        verifyingId={verifyMutation.isPending ? (verifyMutation.variables as string) : null}
        onSelectTransaction={setSelected}
        onVerifyTransaction={(id) => verifyMutation.mutate(id)}
      />

      {/* 4. Transaction Details Modal */}
      <TransactionDetailsModal
        transaction={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
