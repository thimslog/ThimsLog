interface SidebarSectionLabelProps {
  children: React.ReactNode;
}

const SidebarSectionLabel: React.FC<SidebarSectionLabelProps> = ({
  children,
}) => {
  return (
    <p className="px-4 pt-5 pb-1 text-[11px] font-semibold tracking-wider text-slate-400">
      {children}
    </p>
  );
};

export default SidebarSectionLabel;
