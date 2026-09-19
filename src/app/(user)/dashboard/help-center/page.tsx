"use client";

import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import Link from "next/link";
import { ExternalLink, Loader2, Video, Send, MessageSquare } from "lucide-react";

interface HelpCenterLink {
  id: string;
  title: string;
  description: string | null;
  url: string;
  section: string;
  iconType: string | null;
  order: number;
  isActive: boolean;
}

// Authentic High-Fidelity WhatsApp Vector Icon
function WhatsAppVectorIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.71 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// Crisp Community Multi-User Vector Icon
function CommunityVectorIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

export default function HelpCenterPage() {
  const { data, isLoading: loading } = useQuery({
    queryKey: ["help-center", "links"],
    queryFn: () =>
      apiGet<{ success: boolean; data: HelpCenterLink[] }>("/api/user/help-center"),
    staleTime: 10 * 60 * 1000,
  });

  const links = data?.data || [];

  // Filter links into sections
  const tutorialLinks = links.filter((l) => l.section === "TUTORIALS_CHANNEL");
  const channelLinks = links.filter((l) => l.section === "WHATSAPP_CHANNEL");
  const communityLinks = links.filter((l) => l.section === "COMMUNITY_SUPPORT");
  const otherLinks = links.filter(
    (l) =>
      l.section !== "TUTORIALS_CHANNEL" &&
      l.section !== "WHATSAPP_CHANNEL" &&
      l.section !== "COMMUNITY_SUPPORT"
  );

  const renderIcon = (iconType: string | null, customClass?: string) => {
    switch (iconType?.toLowerCase()) {
      case "whatsapp":
        return <WhatsAppVectorIcon className={customClass || "w-5 h-5"} />;
      case "community":
      case "users":
        return <CommunityVectorIcon className={customClass || "w-5 h-5"} />;
      case "youtube":
      case "video":
        return <Video className={customClass || "w-5 h-5"} />;
      case "telegram":
        return <Send className={customClass || "w-5 h-5"} />;
      default:
        return <WhatsAppVectorIcon className={customClass || "w-5 h-5"} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16">
      {/* Page Title & Quick Action Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Help Center
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/help-center/tickets"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200/80 dark:border-purple-500/25 text-[#7c3aed] dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <MessageSquare size={15} className="text-[#7c3aed] dark:text-purple-400" />
            <span>View My Tickets</span>
          </Link>

          <Link
            href="/dashboard/help-center/tickets/create"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <span>+ Open Ticket</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-28 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-400">
            <Loader2 size={24} className="animate-spin text-sky-600 dark:text-sky-400" />
            <span className="text-sm font-medium">Loading resources...</span>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-[#0b101b] border border-slate-200/90 dark:border-white/10 p-6 sm:p-9 shadow-xs space-y-8">
          {/* ========================================================= */}
          {/* SECTION 1: TUTORIALS CHANNEL                              */}
          {/* ========================================================= */}
          {tutorialLinks.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none pl-0.5">
                TUTORIALS CHANNEL
              </h2>

              <div className="space-y-3">
                {tutorialLinks.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#ebfbee] dark:bg-[#062817]/40 border border-[#bbf7d0] dark:border-emerald-500/30 hover:border-[#86efac] dark:hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Squircle Badge */}
                      <div className="w-11 h-11 rounded-2xl bg-[#d4f8e0] dark:bg-emerald-500/20 text-[#16a34a] dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        {renderIcon(item.iconType || "whatsapp", "w-5 h-5 text-[#16a34a] dark:text-emerald-400")}
                      </div>

                      {/* Content */}
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-bold text-[#14532d] dark:text-emerald-100 tracking-tight truncate">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-[12.5px] font-semibold text-[#16a34a] dark:text-emerald-400/90 mt-0.5 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* External Link Icon */}
                    <div className="text-[#22c55e] dark:text-emerald-400 group-hover:text-[#15803d] dark:group-hover:text-emerald-300 p-1.5 shrink-0 transition-colors">
                      <ExternalLink
                        size={18}
                        className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 2: WHATSAPP CHANNEL                               */}
          {/* ========================================================= */}
          {channelLinks.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none pl-0.5">
                WHATSAPP CHANNEL
              </h2>

              <div className="space-y-3">
                {channelLinks.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#f5edfd] dark:bg-[#20103a]/40 border border-[#e9d5ff] dark:border-purple-500/30 hover:border-[#d8b4fe] dark:hover:border-purple-400 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      {/* Squircle Badge */}
                      <div className="w-11 h-11 rounded-2xl bg-[#eeddfe] dark:bg-purple-500/20 text-[#9333ea] dark:text-purple-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        {renderIcon(item.iconType || "whatsapp", "w-5 h-5 text-[#9333ea] dark:text-purple-400")}
                      </div>

                      {/* Content */}
                      <div className="min-w-0">
                        <h3 className="text-[15px] font-bold text-[#581c87] dark:text-purple-100 tracking-tight truncate">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-[12.5px] font-semibold text-[#9333ea] dark:text-purple-400/90 mt-0.5 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* External Link Icon */}
                    <div className="text-[#a855f7] dark:text-purple-400 group-hover:text-[#7e22ce] dark:group-hover:text-purple-300 p-1.5 shrink-0 transition-colors">
                      <ExternalLink
                        size={18}
                        className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 3: COMMUNITY & SUPPORT (2 Cards side by side)     */}
          {/* ========================================================= */}
          {communityLinks.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none pl-0.5">
                COMMUNITY &amp; SUPPORT
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {communityLinks.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-between p-4 sm:p-4.5 rounded-2xl bg-[#ebfbee] dark:bg-[#062817]/40 border border-[#bbf7d0] dark:border-emerald-500/30 hover:border-[#86efac] dark:hover:border-emerald-400 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Community Badge */}
                      <div className="w-10 h-10 rounded-2xl bg-[#d4f8e0] dark:bg-emerald-500/20 text-[#16a34a] dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        {renderIcon(item.iconType || "community", "w-5 h-5 text-[#16a34a] dark:text-emerald-400")}
                      </div>

                      {/* Content */}
                      <div className="min-w-0">
                        <h3 className="text-[14px] font-bold text-[#14532d] dark:text-emerald-100 tracking-tight truncate">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-[12px] font-semibold text-[#16a34a] dark:text-emerald-400/90 mt-0.5 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-[#22c55e] dark:text-emerald-400 group-hover:text-[#15803d] dark:group-hover:text-emerald-300 pl-2 shrink-0 transition-colors">
                      <ExternalLink
                        size={17}
                        className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SECTION 4: EXTRA CUSTOM SECTIONS (IF ANY FROM ADMIN)      */}
          {/* ========================================================= */}
          {otherLinks.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none pl-0.5">
                ADDITIONAL RESOURCES
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {otherLinks.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex items-center justify-between p-4 sm:p-4.5 rounded-2xl bg-sky-50/70 dark:bg-sky-950/25 border border-sky-200/80 dark:border-sky-500/25 hover:border-sky-400 dark:hover:border-sky-400 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 cursor-pointer overflow-hidden"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                        {renderIcon(item.iconType || "link", "w-4.5 h-4.5 text-sky-600 dark:text-sky-400")}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-[14px] font-bold text-sky-950 dark:text-sky-100 tracking-tight truncate">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-[12px] font-semibold text-sky-700/90 dark:text-sky-400/90 mt-0.5 truncate">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-sky-500 group-hover:text-sky-700 dark:group-hover:text-sky-300 pl-2 shrink-0 transition-colors">
                      <ExternalLink
                        size={17}
                        className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* FOOTER CALLOUT: SUPPORT TICKET LINK                      */}
          {/* ========================================================= */}
          <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Need personalized assistance?
                </span>
                <Link
                  href="/dashboard/help-center/tickets/create"
                  className="font-bold text-xs text-[#7c3aed] dark:text-purple-400 hover:text-[#6d28d9] hover:underline"
                >
                  Open a ticket →
                </Link>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Our team usually responds to inquiries within a few minutes.
              </p>
            </div>

            <Link
              href="/dashboard/help-center/tickets"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 border border-purple-200/80 dark:border-purple-500/30 text-[#7c3aed] dark:text-purple-300 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <MessageSquare size={15} />
              <span>View My Tickets</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
