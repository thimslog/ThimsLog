import {
  FaTiktok,
  FaSquareFacebook,
  FaRedditAlien,
  FaXTwitter,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa6";
import {
  Mail,
  ShieldCheck,
  MonitorSmartphone,
  MessageSquareText,
  Headphones,
  LucideProps,
} from "lucide-react";
import type { IconType } from "react-icons";

// Generic component type compatible with both react-icons and lucide-react
export type IconComponent =
  | IconType
  | React.ComponentType<LucideProps>
  | React.ComponentType<{ size?: number | string; className?: string }>;

export type IconConfig =
  | { type: "icon"; bg: string; Icon: IconComponent }
  | { type: "image"; bg?: string; imageSrc: string; alt?: string };

// type IconConfig = { bg: string; Icon: IconType | React.ComponentType<any> };

// Order matters: more specific phrases must be checked before generic ones
// (e.g. "pc vpn" before "vpn") since we do substring matching.
const KEYWORD_RULES: { keywords: string[]; config: IconConfig }[] = [
  {
    keywords: ["vpn pc"],
    config: {
      type: "image",
      bg: "bg-slate-700",
      imageSrc: "/pcvpn.png",
      alt: "PC VPN",
    },
  },
  {
    keywords: ["vpn"],
    config: {
      type: "image",
      bg: "bg-indigo-600",
      imageSrc: "/vpn.png",
      alt: "VPN",
    },
  },
  {
    keywords: ["instagram", " ig "],
    config: { type: "icon", bg: "bg-pink-500", Icon: FaInstagram },
  },
  {
    keywords: ["twitter"],
    config: { type: "icon", bg: "bg-black", Icon: FaXTwitter },
  },
  {
    keywords: ["mail"],
    config: { type: "icon", bg: "bg-red-500", Icon: Mail },
  },
  {
    keywords: ["reddit"],
    config: { type: "icon", bg: "bg-orange-600", Icon: FaRedditAlien },
  },
  {
    keywords: ["youtube", "netflix", "streaming"],
    config: { type: "icon", bg: "bg-red-600", Icon: FaYoutube },
  },
  {
    keywords: ["google voice", "talkatone", "textplus", "texting"],
    config: { type: "icon", bg: "bg-teal-500", Icon: MessageSquareText },
  },
  {
    keywords: ["tiktok", "tik tok"],
    config: { type: "icon", bg: "bg-black", Icon: FaTiktok },
  },
  {
    keywords: ["facebook", " fb", "fb "],
    config: { type: "icon", bg: "bg-blue-600", Icon: FaSquareFacebook },
  },
];

const DEFAULT_CONFIG: IconConfig = {
  type: "icon",
  bg: "bg-slate-400",
  Icon: Headphones,
};

export function getPlatformConfig(name: string): IconConfig {
  const lower = ` ${name.toLowerCase()} `;
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.config;
  }
  return DEFAULT_CONFIG;
}

export function PlatformIcon({
  name,
  size = 20,
  className = "w-10 h-10 rounded-xl",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const config = getPlatformConfig(name);
  const bgClass = config.bg ?? "bg-slate-500";

  return (
    <div
      className={`${className} ${bgClass} flex items-center justify-center shrink-0 overflow-hidden`}
    >
      {config.type === "image" ? (
        <img
          src={config.imageSrc}
          alt={config.alt ?? name}
          className="w-3/5 h-3/5 object-contain"
        />
      ) : (
        <config.Icon size={size} className="text-white" />
      )}
    </div>
  );
}