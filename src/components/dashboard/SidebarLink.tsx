interface SidebarLinkProps {
  icon: React.ComponentType<{ size: number; className?: string }>;
  label: string;
  active?: boolean;
  badge?: string;
  href?: string;
}

const SidebarLink = ({
  icon: Icon,
  label,
  active,
  badge,
  href
}: SidebarLinkProps) => {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? "bg-sky-100 text-sky-700"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <Icon
        size={18}
        className={active ? "text-sky700" : "text-slate-500"}
      />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="bg-sky-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </a>
  );
};

export default SidebarLink;
