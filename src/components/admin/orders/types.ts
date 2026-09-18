export interface DeliveredAccount {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  url?: string | null;
  country?: string | null;
  followers?: number | null;
  notes?: string | null;
  loginInstructions?: string | null;
  status: string;
}

export interface AdminOrderRecord {
  id: string;
  buyerId?: string;
  buyerName: string;
  buyerUsername: string;
  buyerEmail: string;
  buyerPhone?: string;
  productId?: string;
  productName: string;
  platform: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  accounts: DeliveredAccount[];
}

export interface OrderMetrics {
  totalOrdersCount: number;
  totalSalesVolume: number;
  totalAccountsDelivered: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
