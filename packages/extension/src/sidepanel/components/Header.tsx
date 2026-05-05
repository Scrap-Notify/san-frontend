interface HeaderProps {
  isAuthenticated: boolean;
}

export function Header({ isAuthenticated }: HeaderProps) {
  return (
    <header className="p-5 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse shadow-[0_0_10px_#4ADE80]" />
        <h1 className="text-xl font-black tracking-tighter text-white">SAN</h1>
      </div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
        {isAuthenticated ? 'Synced' : 'Guest mode'}
      </div>
    </header>
  );
}
