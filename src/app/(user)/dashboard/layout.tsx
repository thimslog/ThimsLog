"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { ThemeProvider, useTheme } from "@/context/theme-context";

import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

function DashboardContainer({
  children,
  user,
}: {
  children: React.ReactNode;
  user: any;
}) {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "dark bg-[#060a14] text-slate-200"
          : "bg-slate-50 text-slate-900"
      } font-sans transition-colors duration-200`}
    >
      <Sidebar
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64 flex flex-col min-h-screen">
        <TopBar
          user={user}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <main className="flex-1 px-4 sm:px-8 pb-8 pt-4">{children}</main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#060a14] flex items-center justify-center transition-colors">
        <Loader2 className="w-12 h-12 text-sky-600 dark:text-sky-400 animate-spin" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <DashboardContainer user={user}>{children}</DashboardContainer>
    </ThemeProvider>
  );
}
