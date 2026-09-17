"use client";

import Link from "next/link";
import { Plus, ShoppingCart, RotateCcw, ListChecks, MessageCircle } from "lucide-react";

const QuickActionsBar = () => {
  const actions = [
    { icon: Plus, label: "Fund Wallet", href: "/dashboard/wallet", primary: true },
    { icon: ShoppingCart, label: "Buy Accounts", href: "/dashboard/products" },
    { icon: RotateCcw, label: "Order History", href: "/dashboard/order-history" },
    { icon: ListChecks, label: "Transactions", href: "/dashboard/transactions" },
    { icon: MessageCircle, label: "24/7 Support", href: "https://wa.me/2348000000000", external: true },
  ];

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
      {actions.map((a) => (
        <QuickActionPill key={a.label} {...a} />
      ))}
    </div>
  );
};

export default QuickActionsBar;

function QuickActionPill({ icon: Icon, label, href, primary, external }: any) {
  const Component = external ? "a" : Link;
  const extraProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Component
      href={href}
      {...extraProps}
      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all cursor-pointer shadow-2xs ${
        primary
          ? "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-500/20"
          : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
      }`}
    >
      <span
        className={`w-5 h-5 rounded-lg flex items-center justify-center ${
          primary
            ? "bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950"
            : "bg-sky-50 dark:bg-white/10 text-sky-600 dark:text-sky-400"
        }`}
      >
        <Icon size={12} />
      </span>
      {label}
    </Component>
  );
}
