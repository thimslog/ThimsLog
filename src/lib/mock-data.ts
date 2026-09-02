import { AdminRecord, DashboardStat, InventoryItem, UserRecord } from "./types";

export const dashboardStats: DashboardStat[] = [
  { label: "Revenue (30d)", value: "$18,420", delta: "+12.4%", trend: "up" },
  { label: "Orders (30d)", value: "1,284", delta: "+6.1%", trend: "up" },
  { label: "Active users", value: "3,902", delta: "+2.8%", trend: "up" },
  { label: "Low stock items", value: "7", delta: "-3", trend: "down" },
];

export const inventorySnapshot: InventoryItem[] = [
  { id: "inv_01", category: "social", label: "Instagram — aged, PVA", price: 4.5, stock: 128, status: "in_stock" },
  { id: "inv_02", category: "social", label: "TikTok — US region", price: 6.0, stock: 12, status: "low_stock" },
  { id: "inv_03", category: "vpn", label: "VPN — 30 day key", price: 3.0, stock: 340, status: "in_stock" },
  { id: "inv_04", category: "vpn", label: "VPN — lifetime key", price: 22.0, stock: 0, status: "out_of_stock" },
  { id: "inv_05", category: "textplus", label: "TextPlus — verified number", price: 1.75, stock: 54, status: "in_stock" },
];

export const users: UserRecord[] = [
  { id: "usr_01", name: "James Eze", email: "james.eze@mail.com", ordersCount: 14, totalSpent: 210.5, status: "active", joinedAt: "2026-02-01T10:00:00Z" },
  { id: "usr_02", name: "Grace Adeyemi", email: "grace.a@mail.com", ordersCount: 3, totalSpent: 42.0, status: "active", joinedAt: "2026-05-11T10:00:00Z" },
  { id: "usr_03", name: "Wale Ogunleye", email: "wale.o@mail.com", ordersCount: 1, totalSpent: 6.0, status: "banned", joinedAt: "2026-06-19T10:00:00Z" },
  { id: "usr_04", name: "Ifeoma Nwosu", email: "ifeoma.n@mail.com", ordersCount: 27, totalSpent: 480.25, status: "active", joinedAt: "2025-12-30T10:00:00Z" },
];
