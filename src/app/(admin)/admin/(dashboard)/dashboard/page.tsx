import { Topbar } from "@/components/admin/topbar";
import { StatCard } from "@/components/admin/stat-card";
import { StatusPill } from "@/components/admin/status-pill";
import { dashboardStats, inventorySnapshot } from "@/lib/mock-data";

const statusMap = {
  in_stock: { label: "In stock", tone: "good" as const },
  low_stock: { label: "Low stock", tone: "warn" as const },
  out_of_stock: { label: "Out of stock", tone: "bad" as const },
};

const categoryLabel = {
  inventory: "Inventory",
  // vpn: "VPN",
  // textplus: "TextPlus",
};

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" subtitle="Snapshot of sales, users and inventory" />

      <main className="p-6 space-y-6">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardStats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </section>

        <section className="rounded-card border border-base-border bg-base-surface">
          <div className="flex items-center justify-between px-5 py-4 border-b border-base-border">
            <h2 className="font-display text-[15px] text-ink">Inventory snapshot</h2>
            <a href="/admin/inventory/social" className="text-[12.5px] text-brand hover:underline">
              View catalog
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11.5px] uppercase tracking-wider text-ink-faint">
                  <th className="px-5 py-3 font-medium">Item</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventorySnapshot.map((item) => {
                  const status = statusMap[item.status];
                  return (
                    <tr key={item.id} className="border-t border-base-border">
                      <td className="px-5 py-3 text-[13.5px] text-ink">{item.label}</td>
                      <td className="px-5 py-3 text-[13px] text-ink-muted">
                        {/* {categoryLabel[item.category]} */}
                      </td>
                      <td className="px-5 py-3 text-[13px] font-mono text-ink-muted">
                        ${item.price.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-[13px] font-mono text-ink-muted">
                        {item.stock}
                      </td>
                      <td className="px-5 py-3">
                        <StatusPill label={status.label} tone={status.tone} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
