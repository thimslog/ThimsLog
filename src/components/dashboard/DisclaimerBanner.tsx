import { AlertTriangle } from "lucide-react";

interface DisclaimerBannerProps {
  children: React.ReactNode;
}

const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ children }) => {
  return (
    <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 text-sm rounded-2xl px-5 py-3.5 shadow-2xs transition-colors">
      <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 shrink-0" />
      <p className="font-medium text-xs sm:text-sm">{children}</p>
    </div>
  );
};

export default DisclaimerBanner;