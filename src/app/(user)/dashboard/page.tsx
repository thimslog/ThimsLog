"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
// import { getCurrentUser } from '@/lib/get-current-user';
import { useAuth } from "@/context/auth-context";

import { Loader2 } from "lucide-react";
import DashboardContent from "@/components/DashboardContent";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signin");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-sky-900 animate-spin bg-white" />
      </div>
    );
  }

  return <DashboardContent user={user} />;
}
