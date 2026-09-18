export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  userName?: string;
}

export interface TransactionRecord {
  id: string;
  walletId: string;
  type: "FUNDING" | "PAYMENT" | "REFUND" | "TRANSFER_SENT" | "TRANSFER_RECEIVED" | string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "UNDERPAID" | "OVERPAID" | "EXPIRED";
  amountRequested: string | number;
  amount: string | number | null;
  merchantReference: string;
  paymonetraReference?: string | null;
  collectionReference?: string | null;
  provider: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
  wallet: {
    user: UserInfo;
    balance?: string | number;
  };
}

export interface Metrics {
  totalCountAll: number;
  totalSuccessVolume: number;
  successCount: number;
  pendingCount: number;
  failedCount: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "₦0.00";
  return `₦${currencyFormatter.format(Number(value))}`;
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function getToneForStatus(
  status: string
): "good" | "warn" | "bad" | "neutral" {
  switch (status) {
    case "SUCCESS":
      return "good";
    case "PENDING":
      return "warn";
    case "FAILED":
    case "EXPIRED":
      return "bad";
    default:
      return "neutral";
  }
}
