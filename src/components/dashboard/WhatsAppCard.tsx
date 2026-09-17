"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

interface HelpLink {
  id: string;
  title: string;
  description: string | null;
  url: string;
  section: string;
  iconType: string | null;
  isActive: boolean;
}

const DEFAULT_WHATSAPP_FALLBACK =
  process.env.NEXT_PUBLIC_WHATSAPP_URL ||
  process.env.NEXT_PUBLIC_TELEGRAM_URL ||
  "https://t.me/thimslog1";

export default function WhatsAppCard() {
  const [targetUrl, setTargetUrl] = useState<string>(DEFAULT_WHATSAPP_FALLBACK);
  const [cardTitle, setCardTitle] = useState<string>("ThimsLog News");
  const [cardSubtitle, setCardSubtitle] = useState<string>(
    "Get exclusive updates & drops"
  );

  useEffect(() => {
    let isMounted = true;

    async function loadLink() {
      try {
        const res = await fetch("/api/user/help-center", { cache: "no-store" });
        if (!res.ok) return;

        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const links: HelpLink[] = data.data;

          // Priority 1: Specifically WHATSAPP_CHANNEL section
          const whatsappChannel = links.find(
            (l) => l.section === "WHATSAPP_CHANNEL" && l.url
          );

          // Priority 2: Any link with whatsapp icon
          const whatsappIconLink = links.find(
            (l) => l.iconType?.toLowerCase() === "whatsapp" && l.url
          );

          // Priority 3: Community & Support group link
          const communityLink = links.find(
            (l) => l.section === "COMMUNITY_SUPPORT" && l.url
          );

          // Priority 4: Any first active link available
          const firstAvailable = links.find((l) => l.url);

          const chosen =
            whatsappChannel ||
            whatsappIconLink ||
            communityLink ||
            firstAvailable;

          if (chosen && isMounted) {
            setTargetUrl(chosen.url);
            if (chosen.title) setCardTitle(chosen.title);
            if (chosen.description) setCardSubtitle(chosen.description);
          }
        }
      } catch (err) {
        console.error("Failed to load WhatsApp link from backend:", err);
      }
    }

    loadLink();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative flex max-w-xs flex-col items-center overflow-hidden rounded-3xl border border-emerald-200/90 dark:border-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/20 px-5 py-6 text-center shadow-xs transition-all hover:shadow-md">
      {/* Background Watermark Icon */}
      <svg
        className="pointer-events-none absolute -right-6 -top-4 h-44 w-44 text-[#25D366]/10"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
      </svg>

      {/* Top Floating Circular Icon */}
      <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-md shadow-[#25D366]/30">
        <svg
          className="h-5.5 w-5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
          <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
        </svg>
      </div>

      {/* Text Content */}
      <div className="relative z-10 mt-3.5 space-y-0.5">
        <h3 className="text-[14.5px] font-bold tracking-tight text-emerald-950 dark:text-emerald-300 truncate max-w-[180px]">
          {cardTitle}
        </h3>
        <p className="text-[11.5px] font-medium text-emerald-700 dark:text-emerald-400 line-clamp-2">
          {cardSubtitle}
        </p>
      </div>

      {/* Action Button linking to backend WhatsApp / available link */}
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative z-10 mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#25D366] py-2 text-xs font-bold text-white shadow-[0_4px_14px_rgba(37,211,102,0.3)] transition duration-200 hover:bg-[#20ba59] active:scale-[0.98] cursor-pointer"
      >
        <span>Join Channel</span>
        <ExternalLink
          size={13}
          className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </a>
    </div>
  );
}
