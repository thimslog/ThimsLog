export interface LowStockProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  available: number;
}

export interface RecentOrder {
  id: string;
  productName: string;
  categoryName: string;
  buyerName: string;
  buyerEmail: string;
  quantity: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface RecentTransaction {
  id: string;
  customerName: string;
  customerEmail: string;
  type: "FUNDING" | "PAYMENT" | "REFUND";
  status: "PENDING" | "SUCCESS" | "FAILED" | "UNDERPAID" | "OVERPAID" | "EXPIRED";
  amountRequested: number;
  amount: number | null;
  merchantReference: string;
  createdAt: string;
}

export interface RecentTicket {
  id: string;
  subject: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  customerName: string;
  customerEmail: string;
  createdAt: string;
}

export interface DashboardData {
  paymonetra?: {
    balance: number;
    collectedAmount?: number;
    collectedReady?: number;
    collectedClearing?: number;
    settledAmount?: number;
    ledgerBalance?: number;
    currency: string;
    mode?: string;
    status: "connected" | "error";
  };
  financials: {
    totalSettledRevenue: number;
    totalWalletLiability: number;
    pendingTransactionsCount: number;
    pendingTransactionsVolume: number;
    successCount: number;
    allTransactionsCount: number;
  };
  sales: {
    totalOrdersCount: number;
    totalSalesVolume: number;
    accountsSold: number;
    accountsAvailable: number;
    totalInventory: number;
  };
  users: {
    totalUsers: number;
    newUsersThisWeek: number;
  };
  support: {
    openTicketsCount: number;
    urgentTicketsCount: number;
  };
  lowStockProducts: LowStockProduct[];
  recentOrders: RecentOrder[];
  recentTransactions: RecentTransaction[];
  recentTickets: RecentTicket[];
}

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "₦0.00";
  return `₦${currencyFormatter.format(Number(value))}`;
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function getToneForStatus(status: string): "good" | "warn" | "bad" | "neutral" {
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

export function getPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case "URGENT":
      return "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20";
    case "HIGH":
      return "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20";
    case "MEDIUM":
      return "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400 border-sky-200 dark:border-sky-500/20";
    default:
      return "bg-slate-50 text-slate-600 dark:bg-white/5 dark:text-slate-400 border-slate-200 dark:border-white/10";
  }
}
