"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface AdminPage {
  title: string;
  subtitle?: string;
}

interface AdminPageContextValue {
  pageTitle: AdminPage;
  setPageTitle: (page: AdminPage) => void;
}

const AdminPageContext = createContext<AdminPageContextValue | undefined>(
  undefined,
);

export function AdminPageProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState<AdminPage>({
    title: "Dashboard",
    subtitle: "Snapshot of sales, users and inventory",
  });

  return (
    <AdminPageContext.Provider value={{ pageTitle, setPageTitle }}>
      {children}
    </AdminPageContext.Provider>
  );
}

export function useAdminPage() {
  const context = useContext(AdminPageContext);

  if (!context) {
    throw new Error("useAdminPage must be used inside AdminPageProvider");
  }

  return context;
}
