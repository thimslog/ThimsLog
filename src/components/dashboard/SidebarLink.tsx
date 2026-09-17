import Link from "next/link";

interface SidebarLinkProps {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  active?: boolean;
  badge?: string;
  href?: string;
  onClick?: () => void;
}

const SidebarLink = ({
  icon: Icon,
  label,
  active,
  badge,
  href,
  onClick,
}: SidebarLinkProps) => {
  return (
    <Link
      href={href!}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 font-semibold shadow-2xs"
          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/5"
      }`}
    >
      <Icon
        size={18}
        className={active ? "text-sky-600 dark:text-sky-400" : "text-slate-400 dark:text-slate-500"}
      />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="bg-sky-600 dark:bg-sky-400 text-white dark:text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
};

export default SidebarLink;

