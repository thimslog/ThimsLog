import { Topbar } from "@/components/admin/topbar";
import { StatusPill } from "@/components/admin/status-pill";
import { users } from "@/lib/mock-data";

export default function UsersPage() {
  return (
    <>
      <Topbar title="Users" subtitle={`${users.length} registered customers`} />

      <main className="p-6 space-y-4">
        <section className="rounded-card border border-base-border bg-base-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11.5px] uppercase tracking-wider text-ink-faint">
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Orders</th>
                  <th className="px-5 py-3 font-medium">Total spent</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-base-border">
                    <td className="px-5 py-3 text-[13.5px] text-ink">{user.name}</td>
                    <td className="px-5 py-3 text-[13px] font-mono text-ink-muted">
                      {user.email}
                    </td>
                    <td className="px-5 py-3 text-[13px] font-mono text-ink-muted">
                      {user.ordersCount}
                    </td>
                    <td className="px-5 py-3 text-[13px] font-mono text-ink-muted">
                      ${user.totalSpent.toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill
                        label={user.status === "active" ? "Active" : "Banned"}
                        tone={user.status === "active" ? "good" : "bad"}
                      />
                    </td>
                    <td className="px-5 py-3 text-[13px] text-ink-muted">
                      {new Date(user.joinedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}
