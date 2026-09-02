"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/admin-auth-context";
import { Sidebar } from "@/components/admin/sidebar";
import { AdminAuthProvider } from "@/context/admin-auth-context";

import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { admin, loading, signOut } = useAuth();
    const router = useRouter();
  
    useEffect(() => {
      if (!loading && !admin) {
        router.replace("/admin/login");
      }
    }, [loading, admin, router]);
  
    if (loading || !admin) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-sky-900 animate-spin " />
        </div>
      );
    }

  return (
    <div className="min-h-screen bg-white text-sky-900">
      <Sidebar admin={admin} />
      <div className="md:pl-64"><AdminAuthProvider>{children}</AdminAuthProvider></div>
    </div>
  );
}
