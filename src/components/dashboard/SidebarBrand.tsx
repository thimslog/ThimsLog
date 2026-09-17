"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import { useTheme } from "@/context/theme-context";

interface SidebarBrandProps {
  onClose?: () => void;
}

const SidebarBrand: React.FC<SidebarBrandProps> = ({ onClose }) => {
  const { theme } = useTheme();

  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 dark:border-white/10">
      <Link
        href="/dashboard"
        onClick={onClose}
        className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
      >
        <Image
          src={theme === "dark" ? "/thimslog.png" : "/thimslogblack.png"}
          alt="ThimsLog"
          width={36}
          height={36}
          className="w-8 h-8 object-contain"
        />
        <div>
          <p className="font-display font-bold text-slate-900 dark:text-white leading-tight text-sm">
            Thims<span className="text-sky-600 dark:text-sky-400">Log</span>
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
            Escrow &amp; Logs Marketplace
          </p>
        </div>
      </Link>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default SidebarBrand;
