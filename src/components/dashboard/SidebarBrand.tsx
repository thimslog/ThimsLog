const SidebarBrand = () => {
  return (
    <div className="flex items-center gap-2 px-4 py-5 border-b border-slate-100">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="w-4 h-4 bg-white rounded-sm" />
      </div>
      <div>
        <p className="font-bold text-slate-900 leading-tight text-sm">
          Ultimate Logs <br /> Marketplace
        </p>
        <p className="text-[10px] text-slate-400 leading-tight">
          Digital solutions for every market
        </p>
      </div>
    </div>
  );
};

export default SidebarBrand;
