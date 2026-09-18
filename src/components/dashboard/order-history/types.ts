export interface PurchasedAccount {
  id: string;
  name?: string | null;
  username: string;
  email?: string | null;
  url?: string | null;
  country?: string | null;
  followers?: number | null;
  notes?: string | null;
  loginInstructions?: string | null;
  status?: string | null;
}

export interface OrderItem {
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
  accounts: PurchasedAccount[];
}
