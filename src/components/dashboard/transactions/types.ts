export interface TransactionRow {
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

export function formatMoney(value: string | number) {
  return `₦${currencyFormatter.format(Number(value || 0))}`;
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toISOString().slice(0, 10);
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date} ${time}`;
}

export function formatType(type: string) {
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
      return type ? type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ") : "Transaction";
  }
}

export const statusStyles: Record<string, string> = {
  SUCCESS: "text-emerald-600 dark:text-emerald-400",
  FAILED: "text-red-600 dark:text-red-400",
  PENDING: "text-amber-600 dark:text-amber-400",
  EXPIRED: "text-slate-500 dark:text-slate-400",
  UNDERPAID: "text-orange-600 dark:text-orange-400",
  OVERPAID: "text-blue-600 dark:text-blue-400",
};

export const isDebit = (type: string) =>
  type === "PAYMENT" || type === "TRANSFER_SENT";
