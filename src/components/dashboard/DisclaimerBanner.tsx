import { AlertTriangle } from "lucide-react";

interface DisclaimerBannerProps {
  children: React.ReactNode;
}

const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ children }) => {
  return (
    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
      <AlertTriangle size={18} className="text-amber-500 shrink-0" />
      <p className="font-medium">{children}</p>
    </div>
  );
};

export default DisclaimerBanner