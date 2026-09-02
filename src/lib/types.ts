export type ProductCategory = "social" | "vpn" | "textplus";

export type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

export type AdminRole = "super_admin" | "admin" | "support";

export interface AdminRecord {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: "active" | "suspended";
  lastActive: string;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
  status: "active" | "banned";
  joinedAt: string;
}

export interface InventoryItem {
  id: string;
  category: ProductCategory;
  label: string;
  price: number;
  stock: number;
  status: StockStatus;
}

export interface DashboardStat {
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down" | "flat";
}
