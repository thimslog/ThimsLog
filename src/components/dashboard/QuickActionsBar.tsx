import { Plus, ShoppingCart, Smartphone, Mail, Wifi, Zap } from "lucide-react";

const QuickActionsBar = () => {
  const actions = [
    { icon: Plus, label: "Fund Account", primary: true },
    { icon: ShoppingCart, label: "Buy Accounts" },
    { icon: Smartphone, label: "Rent Number" },
    { icon: Mail, label: "Temp Email" },
    { icon: Wifi, label: "Buy Data" },
    { icon: Smartphone, label: "Airtime" },
    { icon: Zap, label: "VTU Top-Up" },
  ];

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1">
      {actions.map((a) => (
        <QuickActionPill key={a.label} {...a} />
      ))}
    </div>
  );
};

export default QuickActionsBar;

function QuickActionPill({ icon: Icon, label, primary }: any) {
  return (
    <button
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-all cursor-pointer shadow-2xs ${
        primary
          ? "bg-sky-50 dark:bg-sky-500/10 border-sky-200 dark:border-sky-500/20 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-500/20"
          : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white"
      }`}
    >
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center ${
          primary
            ? "bg-sky-600 text-white dark:bg-sky-400 dark:text-slate-950"
            : "bg-sky-50 dark:bg-white/10 text-sky-600 dark:text-sky-400"
        }`}
      >
        <Icon size={13} />
      </span>
      {label}
    </button>
  );
}
