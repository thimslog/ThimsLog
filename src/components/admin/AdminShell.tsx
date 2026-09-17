"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/admin-auth-context";
import { AdminPageProvider, useAdminPage } from "@/context/admin-page-context";

import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";

import { AdminThemeProvider, useAdminTheme } from "@/context/admin-theme-context";

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminThemeProvider>
      <AdminPageProvider>
        <AuthenticatedAdminShell>{children}</AuthenticatedAdminShell>
      </AdminPageProvider>
    </AdminThemeProvider>
  );
}

function AuthenticatedAdminShell({ children }: { children: React.ReactNode }) {
  const { admin, loading } = useAuth();
  const { theme } = useAdminTheme();
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
      <div className="min-h-screen bg-slate-50 dark:bg-[#060a14] flex items-center justify-center transition-colors">
        <Loader2 className="w-6 h-6 text-sky-600 dark:text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060a14] text-slate-900 dark:text-slate-200 font-sans">
      <Sidebar
        admin={admin}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen md:pl-64 flex flex-col">
        <Topbar
          title={pageTitle.title}
          subtitle={pageTitle.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 pt-16">{children}</main>
      </div>
    </div>
  );
}
