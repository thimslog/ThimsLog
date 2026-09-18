export interface ExportableAccount {
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

export interface ExportableOrder {
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
  accounts: ExportableAccount[];
}

/**
 * Cleanly extracts credential combo (e.g., username:password:2fa or email:password:notes)
 */
export function extractComboString(acc: ExportableAccount): string {
  const login = (acc.loginInstructions || "").trim();
  const username = (acc.username || "").trim();
  const email = (acc.email || "").trim();
  const notes = (acc.notes || "").trim();

  // If login already contains a colon or delimiter combo like user:pass:2fa
  if (login.includes(":") || login.includes("|")) {
    return login;
  }

  // Build standard combo
  const primaryId = username || email || "user";
  const parts = [primaryId];
  if (login) parts.push(login);
  if (notes) parts.push(notes);

  return parts.join(":");
}

/**
 * Exports single or multiple accounts to a .txt file download
 */
export function downloadOrderAsTxt(order: ExportableOrder) {
  const title = order.accountType?.name || "Social Account Pack";
  const dateStr = new Date(order.createdAt).toISOString().split("T")[0];

  const lines: string[] = [
    `=========================================================`,
    `ThimsLog Order Delivery: ${title}`,
    `Order ID: ${order.id}`,
    `Date: ${new Date(order.createdAt).toLocaleString()}`,
    `Delivered Accounts: ${order.accounts.length} pcs`,
    `=========================================================`,
    "",
  ];

  order.accounts.forEach((acc, idx) => {
    lines.push(`----------------- Account #${idx + 1} -----------------`);
    if (acc.username) lines.push(`Username: ${acc.username}`);
    if (acc.email) lines.push(`Email: ${acc.email}`);
    if (acc.loginInstructions) lines.push(`Credentials / Pass: ${acc.loginInstructions}`);
    if (acc.country) lines.push(`Country: ${acc.country}`);
    if (acc.followers) lines.push(`Followers: ${acc.followers.toLocaleString()}`);
    if (acc.url) lines.push(`Profile URL: ${acc.url}`);
    if (acc.notes) lines.push(`Notes & 2FA: ${acc.notes}`);
    lines.push(`Combo Format: ${extractComboString(acc)}`);
    lines.push("");
  });

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const filename = `thimslog-order-${order.id.slice(0, 8)}-${dateStr}.txt`;
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports an order's accounts into a structured .csv spreadsheet
 */
export function downloadOrderAsCsv(order: ExportableOrder) {
  const title = order.accountType?.name || "Social Account Pack";
  const dateStr = new Date(order.createdAt).toISOString().split("T")[0];

  const headers = [
    "Index",
    "Product Type",
    "Username",
    "Email",
    "Credentials / Password",
    "Notes & 2FA",
    "Country",
    "Followers",
    "Profile URL",
    "Raw Combo",
    "Purchase Date",
  ];

  const rows = order.accounts.map((acc, idx) => [
    `#${idx + 1}`,
    `"${title.replace(/"/g, '""')}"`,
    `"${(acc.username || "").replace(/"/g, '""')}"`,
    `"${(acc.email || "").replace(/"/g, '""')}"`,
    `"${(acc.loginInstructions || "").replace(/"/g, '""')}"`,
    `"${(acc.notes || "").replace(/"/g, '""')}"`,
    `"${(acc.country || "").replace(/"/g, '""')}"`,
    acc.followers ?? "",
    `"${(acc.url || "").replace(/"/g, '""')}"`,
    `"${extractComboString(acc).replace(/"/g, '""')}"`,
    `"${new Date(order.createdAt).toISOString()}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `thimslog-order-${order.id.slice(0, 8)}-${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads all orders in account log CSV
 */
export function downloadAllOrdersAsCsv(orders: ExportableOrder[]) {
  const headers = [
    "Order ID",
    "Product Name",
    "Username",
    "Email",
    "Login Credentials",
    "Notes / 2FA",
    "Country",
    "Followers",
    "Raw Combo",
    "Purchase Date",
  ];

  const rows: string[][] = [];
  orders.forEach((order) => {
    const title = order.accountType?.name || "Social Account Pack";
    order.accounts.forEach((acc) => {
      rows.push([
        order.id.slice(0, 8),
        `"${title.replace(/"/g, '""')}"`,
        `"${(acc.username || "").replace(/"/g, '""')}"`,
        `"${(acc.email || "").replace(/"/g, '""')}"`,
        `"${(acc.loginInstructions || "").replace(/"/g, '""')}"`,
        `"${(acc.notes || "").replace(/"/g, '""')}"`,
        `"${(acc.country || "").replace(/"/g, '""')}"`,
        `${acc.followers ?? ""}`,
        `"${extractComboString(acc).replace(/"/g, '""')}"`,
        `"${new Date(order.createdAt).toISOString()}"`,
      ]);
    });
  });

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `thimslog-all-orders-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
