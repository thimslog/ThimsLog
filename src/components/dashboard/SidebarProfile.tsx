"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface SidebarProfileProps {
  name: string;
  email: string;
  username?: string;
  onClick?: () => void;
}

const SidebarProfile: React.FC<SidebarProfileProps> = ({
  name,
  email,
  username,
  onClick,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyUsername = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!username) return;

    navigator.clipboard.writeText(`@${username}`);
    setCopied(true);
    toast.success(`Copied @${username} to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Link
      href="/dashboard/settings"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200/80 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
    >
      <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-500/20 flex items-center justify-center text-sky-700 dark:text-sky-300 font-semibold overflow-hidden border border-slate-200 dark:border-white/10 shrink-0">
        <Image
          src="/male.jpg"
          alt={name}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-1">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
            {name}
          </p>
        </div>

        {username ? (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400 truncate">
              @{username}
            </span>
            <button
              type="button"
              onClick={handleCopyUsername}
              className="w-4 h-4 rounded flex items-center justify-center text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-200/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Copy username"
            >
              {copied ? (
                <Check size={10} className="text-emerald-500" />
              ) : (
                <Copy size={10} />
              )}
            </button>
          </div>
        ) : (
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {email}
          </p>
        )}
      </div>
    </Link>
  );
};

export default SidebarProfile;