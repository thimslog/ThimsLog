"use client";

import { useState } from "react";
import { CategoryPanel } from "@/components/inventory/CategoryPanel";
import { AccountTypePanel } from "@/components/inventory/AccountTypePanel";
import { AccountPanel } from "@/components/inventory/AccountPanel";

const Inventory = () => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [selectedAccountTypeId, setSelectedAccountTypeId] = useState<
    string | null
  >(null);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <h1 className="text-xl font-bold text-slate-900 mb-1">Inventory</h1>
      <p className="text-sm text-slate-500 mb-6">
        Categories, account types, and accounts — manage the full chain.
      </p>

      <div className="grid grid-cols-1 gap-5 items-start">
        <CategoryPanel
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />
        <AccountTypePanel
          categoryId={selectedCategoryId}
          selectedId={selectedAccountTypeId}
          onSelect={setSelectedAccountTypeId}
        />
        <AccountPanel accountTypeId={selectedAccountTypeId} />
      </div>
    </div>
  );
};

export default Inventory;
