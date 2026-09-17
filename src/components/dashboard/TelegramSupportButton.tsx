"use client";

import { useState } from "react";
import { Headset, Send, MessageCircle } from "lucide-react";

interface TelegramSupportButtonProps {
  telegramUrl?: string;
  channelName?: string;
}

export default function TelegramSupportButton({
  telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/thimslog1",
  channelName = "Telegram Channel",
}: TelegramSupportButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <aside
      aria-label="Telegram Support"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-end"
    >
      <a
        href={telegramUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center cursor-pointer focus:outline-hidden"
        aria-label="Join our Telegram Channel"
      >
        {/* Animated Tooltip sliding from left */}
        <div
          className={`absolute right-16 flex items-center gap-2.5 rounded-2xl bg-white dark:bg-[#0b101b] px-3.5 py-2 shadow-xl border border-slate-200/80 dark:border-white/10 transition-all duration-300 ease-out whitespace-nowrap pointer-events-none ${
            isHovered
              ? "opacity-100 translate-x-0 scale-100"
              : "opacity-0 translate-x-4 scale-95"
          }`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
            <Send size={14} className="translate-x-px" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[12.5px] font-bold text-slate-900 dark:text-white leading-tight">
              {channelName}
            </span>
            <span className="flex items-center gap-1.5 text-[10.5px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Support &amp; Community
            </span>
          </div>
        </div>

        {/* Outer Pulsing Radar Ring on idle/hover */}
        <div className="absolute -inset-1.5 rounded-full bg-sky-500/20 dark:bg-sky-400/20 blur-xs animate-pulse group-hover:bg-sky-500/30 dark:group-hover:bg-sky-400/30 transition-all duration-300" />

        {/* Circular Button Container */}
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-[#0b101b] border-2 border-sky-500/20 dark:border-sky-400/30 shadow-lg shadow-sky-500/15 dark:shadow-black/50 transition-all duration-300 group-hover:scale-110 group-hover:border-sky-500 dark:group-hover:border-sky-400 group-hover:shadow-sky-500/30 group-active:scale-95">
          {/* Subtle brand gradient background on hover */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-sky-50 to-transparent dark:from-sky-500/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Headset Icon */}
          <Headset
            className="h-6 w-6 text-sky-600 dark:text-sky-400 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6"
            strokeWidth={2.3}
          />

          {/* Online active status indicator badge */}
          <span className="absolute bottom-1 right-1 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0b101b]" />
          </span>
        </div>
      </a>
    </aside>
  );
}
