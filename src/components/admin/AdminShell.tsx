"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/admin-auth-context";
import { AdminPageProvider, useAdminPage } from "@/context/admin-page-context";

import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminPageProvider>
      <AuthenticatedAdminShell>{children}</AuthenticatedAdminShell>
    </AdminPageProvider>
  );
}

function AuthenticatedAdminShell({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuth();
  const router = useRouter();

  const { pageTitle } = useAdminPage();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !admin) {
      router.replace("/admin/login");
    }
  }, [loading, admin, router]);

  if (loading || !admin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-sky-900 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-sky-900">
      <Sidebar
        admin={admin}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen md:pl-64">
        <Topbar
          title={pageTitle.title}
          subtitle={pageTitle.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="pt-16">{children}</main>
      </div>
    </div>
  );
}
