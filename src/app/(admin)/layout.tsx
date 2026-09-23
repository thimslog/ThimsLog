import { AdminAuthProvider } from "@/context/admin-auth-context";
import { SocketProvider } from "@/context/socket-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <SocketProvider>
        {children}
      </SocketProvider>
    </AdminAuthProvider>
  );
}