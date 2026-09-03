import AdminShell from "@/components/admin/AdminShell";
import { AdminAuthProvider } from "@/context/admin-auth-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}