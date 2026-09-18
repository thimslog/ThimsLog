export interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  phoneNumber: string;
  referralCode?: string;
  referredBy?: {
    id: string;
    firstName?: string;
    lastName?: string;
    userName: string;
    email?: string;
  } | null;
  _count?: {
    referrals: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WalletDetail {
  id: string;
  balance: number;
  currency: string;
  paymonetraCustomer: string | null;
  bankName: string | null;
  accountNumber: string | null;
  accountName: string | null;
  virtualAccountReference: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionDetail {
  id: string;
  walletId: string;
  type: string;
  status: string;
  amountRequested: number | string;
  amount: number | string | null;
  merchantReference: string;
  paymonetraReference?: string | null;
  collectionReference?: string | null;
  provider: string;
  metadata?: any;
  createdAt: string;
}

export interface OrderAccount {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  url?: string | null;
  country?: string | null;
  followers?: number | null;
  status: string;
  notes?: string | null;
  loginInstructions?: string | null;
}

export interface OrderDetail {
  id: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  accountType: {
    id: string;
    name: string;
    category?: string;
  } | null;
  accounts: OrderAccount[];
}

export interface UserStats {
  totalTransactions: number;
  totalOrders: number;
  totalFunded: number;
  totalSpent: number;
  successCount: number;
  pendingCount: number;
  failedCount: number;
}
