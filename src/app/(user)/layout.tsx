import { AuthProvider } from "@/context/auth-context";
import { SocketProvider } from "@/context/socket-context";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <SocketProvider>
        {children}
      </SocketProvider>
    </AuthProvider>
  );
}