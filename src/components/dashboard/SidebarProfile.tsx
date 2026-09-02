interface SidebarProfileProps {
  name: string;
  email: string;
}

const SidebarProfile: React.FC<SidebarProfileProps> = ({ name, email }) => {
  return (
    <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
      <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700 font-semibold">
        {name?.[0] ?? "U"}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
        <p className="text-xs text-slate-400 truncate">{email}</p>
      </div>
    </div>
  );
};

export default SidebarProfile