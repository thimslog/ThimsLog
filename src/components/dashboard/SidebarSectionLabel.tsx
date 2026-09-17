interface SidebarSectionLabelProps {
  children: React.ReactNode;
}

const SidebarSectionLabel: React.FC<SidebarSectionLabelProps> = ({
  children,
}) => {
  return (
    <p className="px-4 pt-5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
      {children}
    </p>
  );
};

export default SidebarSectionLabel;
