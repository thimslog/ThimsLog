"use client";

import { Suspense } from "react";
import DashboardContent from "@/components/DashboardContent";
import { useAuth } from "@/context/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Suspense fallback={null}>
      <DashboardContent user={user} />
    </Suspense>
  );
}
