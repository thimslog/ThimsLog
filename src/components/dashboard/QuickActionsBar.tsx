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
      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap border transition-colors ${
        primary
          ? "bg-sky-50 border-sky-100 text-sky-700"
          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center ${
          primary ? "bg-sky-600 text-white" : "bg-sky-50 text-sky-600"
        }`}
      >
        <Icon size={13} />
      </span>
      {label}
    </button>
  );
}
