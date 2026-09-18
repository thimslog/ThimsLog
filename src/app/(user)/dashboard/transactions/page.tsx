"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  Plus,
  X,
  RefreshCw,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/toast";
import TransferFundsModal from "@/components/dashboard/TransferFundsModal";
import { useAuth } from "@/context/auth-context";

interface TransactionRow {
  id: string;
  type: string;
  status: string;
  amount: string;
  merchantReference: string;
  serviceId: string | null;
  provider: string;
  balanceBefore: string;
  balanceAfter: string;
  metadata?: any;
  createdAt: string;
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoney(value: string) {
  return `₦${currencyFormatter.format(Number(value))}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toISOString().slice(0, 10);
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}

function formatType(type: string) {
  switch (type) {
    case "TRANSFER_SENT":
      return "Transfer Sent";
    case "TRANSFER_RECEIVED":
      return "Transfer Received";
    case "FUNDING":
      return "Wallet Deposit";
    case "PAYMENT":
      return "Product Purchase";
    case "REFUND":
      return "Refund";
    default:
      return type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ");
  }
}

const statusStyles: Record<string, string> = {
  SUCCESS: "text-emerald-600 dark:text-emerald-400",
  FAILED: "text-red-600 dark:text-red-400",
  PENDING: "text-amber-600 dark:text-amber-400",
  EXPIRED: "text-slate-500 dark:text-slate-400",
  UNDERPAID: "text-orange-600 dark:text-orange-400",
  OVERPAID: "text-blue-600 dark:text-blue-400",
};

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

  const getTxIcon = (type: string) => {
    switch (type) {
      case "TRANSFER_SENT":
        return <ArrowUpRight size={15} className="text-rose-500" />;
      case "TRANSFER_RECEIVED":
        return <ArrowDownLeft size={15} className="text-emerald-500" />;
      case "FUNDING":
        return <Wallet size={15} className="text-sky-500" />;
      case "PAYMENT":
        return <ShoppingCart size={15} className="text-rose-500" />;
      default:
        return <CreditCard size={15} className="text-sky-500" />;
    }
  };

  const isDebit = (type: string) =>
    type === "PAYMENT" || type === "TRANSFER_SENT";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Wallet History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Track all your deposits, transfers, purchases and account activity
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-sm font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 transition-all shadow-2xs cursor-pointer disabled:opacity-60"
            title="Refresh Transactions"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-sky-500" : "text-slate-500"} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTransferModal(true)}
            className="inline-flex items-center gap-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Send size={14} />
            Send Money
          </button>
          <Link
            href="/dashboard/wallet"
            className="inline-flex items-center gap-1.5 bg-sky-600 hover:bg-sky-700 dark:bg-sky-400 dark:text-slate-950 dark:hover:bg-sky-300 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-glow cursor-pointer"
          >
            <Plus size={15} />
            Fund Account
          </Link>
        </div>
      </div>

      {/* Transfer Funds Modal */}
      <TransferFundsModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        availableBalance={Number(user?.wallet?.balance ?? 0)}
        onSuccess={() => {
          refetchTransactions();
          refreshUser();
        }}
      />

      {/* Transactions Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] overflow-hidden shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 text-[11px] font-bold tracking-wider uppercase border-b border-slate-200 dark:border-white/10">
                <th className="text-left px-6 py-4">View</th>
                <th className="text-left px-6 py-4">Type</th>
                <th className="text-left px-6 py-4">Amount</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Balance</th>
                <th className="text-left px-6 py-4">Details</th>
                <th className="text-left px-6 py-4">Reference</th>
                <th className="text-left px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {loading && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                  >
                    Loading transactions...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-rose-600 dark:text-rose-400 font-medium">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && transactions.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                  >
                    No transactions yet.
                  </td>
                </tr>
              )}

              {!loading &&
                !error &&
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelected(tx)}
                        className="bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-sky-100 dark:hover:bg-sky-500/20 transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                          {getTxIcon(tx.type)}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {formatType(tx.type)}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-500">
                            {formatDateTime(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      <span
                        className={
                          isDebit(tx.type)
                            ? "text-rose-600 dark:text-rose-400 font-bold"
                            : "text-emerald-600 dark:text-emerald-400 font-bold"
                        }
                      >
                        {isDebit(tx.type) ? "-" : "+"}
                        {formatMoney(tx.amount)}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 font-semibold ${statusStyles[tx.status] ?? "text-slate-500 dark:text-slate-400"}`}
                    >
                      {formatType(tx.status)}
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      <span className="line-through text-slate-400 dark:text-slate-600">
                        {formatMoney(tx.balanceBefore)}
                      </span>
                      <span className="mx-1">→</span>
                      <span
                        className={
                          isDebit(tx.type)
                            ? "text-slate-900 dark:text-white font-semibold"
                            : "text-sky-600 dark:text-sky-400 font-semibold"
                        }
                      >
                        {formatMoney(tx.balanceAfter)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 text-xs">
                      {tx.type === "TRANSFER_SENT" && tx.metadata?.recipientUsername ? (
                        <span>To: <strong className="text-sky-600 dark:text-sky-400">@{tx.metadata.recipientUsername}</strong></span>
                      ) : tx.type === "TRANSFER_RECEIVED" && tx.metadata?.senderUsername ? (
                        <span>From: <strong className="text-emerald-600 dark:text-emerald-400">@{tx.metadata.senderUsername}</strong></span>
                      ) : (
                        <span>{tx.serviceId ?? "—"}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {tx.merchantReference ? tx.merchantReference.slice(0, 12) + "..." : tx.id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4">
                      {tx.status === "PENDING" && tx.provider !== "thimslog_internal" && (
                        <button
                          onClick={() => handleVerify(tx.id)}
                          disabled={verifyingId === tx.id}
                          className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 disabled:opacity-60 cursor-pointer transition-colors"
                        >
                          <RefreshCw
                            size={11}
                            className={
                              verifyingId === tx.id ? "animate-spin" : ""
                            }
                          />
                          {verifyingId === tx.id ? "Checking..." : "Requery"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Details Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0b101b] border border-slate-200 dark:border-white/10 p-6 sm:p-7 shadow-2xl transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Transaction Details
              </h2>
              <button
                onClick={() => setSelected(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <dt className="text-slate-500 dark:text-slate-400">Type</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {formatType(selected.type)}
                </dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <dt className="text-slate-500 dark:text-slate-400">Status</dt>
                <dd
                  className={`font-semibold ${statusStyles[selected.status] ?? "text-slate-900 dark:text-white"}`}
                >
                  {formatType(selected.status)}
                </dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <dt className="text-slate-500 dark:text-slate-400">Amount</dt>
                <dd
                  className={`font-bold ${
                    isDebit(selected.type)
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {isDebit(selected.type) ? "-" : "+"}
                  {formatMoney(selected.amount)}
                </dd>
              </div>

              {/* Recipient Details for Sent Transfers */}
              {selected.type === "TRANSFER_SENT" && selected.metadata?.recipientUsername && (
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                  <dt className="text-slate-500 dark:text-slate-400">Recipient</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white text-right">
                    {selected.metadata.recipientName}{" "}
                    <span className="text-sky-600 dark:text-sky-400">
                      (@{selected.metadata.recipientUsername})
                    </span>
                  </dd>
                </div>
              )}

              {/* Sender Details for Received Transfers */}
              {selected.type === "TRANSFER_RECEIVED" && selected.metadata?.senderUsername && (
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                  <dt className="text-slate-500 dark:text-slate-400">Sender</dt>
                  <dd className="font-semibold text-slate-900 dark:text-white text-right">
                    {selected.metadata.senderName}{" "}
                    <span className="text-emerald-600 dark:text-emerald-400">
                      (@{selected.metadata.senderUsername})
                    </span>
                  </dd>
                </div>
              )}

              {/* Note */}
              {selected.metadata?.note && (
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                  <dt className="text-slate-500 dark:text-slate-400">Note</dt>
                  <dd className="font-medium text-slate-900 dark:text-white italic text-right max-w-[200px]">
                    "{selected.metadata.note}"
                  </dd>
                </div>
              )}

              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <dt className="text-slate-500 dark:text-slate-400">Provider</dt>
                <dd className="font-semibold text-slate-900 dark:text-white">
                  {selected.provider === "thimslog_internal" ? "Thimslog P2P" : selected.provider}
                </dd>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-white/5">
                <dt className="text-slate-500 dark:text-slate-400">Reference</dt>
                <dd className="font-mono text-xs text-slate-900 dark:text-white truncate ml-4">
                  {selected.merchantReference}
                </dd>
              </div>
              <div className="flex justify-between py-1.5">
                <dt className="text-slate-500 dark:text-slate-400">Date</dt>
                <dd className="font-medium text-slate-900 dark:text-white">
                  {formatDateTime(selected.createdAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}
