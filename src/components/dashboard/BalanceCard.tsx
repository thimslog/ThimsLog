import { Eye, Plus, ArrowRight } from "lucide-react";

interface BalanceCardProps {
  name: string;
  balance: number;
  currencySymbol?: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({
  name,
  balance,
  currencySymbol = "\u20A6",
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-600 to-sky-900 text-white px-8 py-7 flex items-center justify-between">
      <div className="absolute -right-10 -top-16 w-64 h-64 rounded-full bg-white/5" />
      <div className="relative">
        <p className="text-lg font-semibold flex items-center gap-2">
          Dashboard Overview, {name} <span>👋</span>
        </p>
        <p className="mt-4 text-[11px] tracking-wider text-sky-200 flex items-center gap-2">
          ACCOUNT BALANCE
          <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
            <Eye size={11} />
          </span>
        </p>
        <p className="text-4xl font-bold mt-1">
          {currencySymbol}
          {balance.toFixed(2)}
        </p>
      </div>

      <div className="relative flex flex-col items-end gap-2">
        <button className="flex items-center gap-1.5 bg-white text-sky-700 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-sky-50">
          <Plus size={15} />
          Add Funds
        </button>
        <button className="flex items-center gap-1.5 bg-white/10 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-white/20">
          History
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default BalanceCard;
