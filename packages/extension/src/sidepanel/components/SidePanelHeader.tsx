export default function SidePanelHeader() {
  return (
    <div className="flex items-center justify-between px-4 h-14 bg-[#101417]/80 border-t border-[#00ffc2]/10 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <div className="text-[#00ffc2] font-bold text-lg">SAN</div>
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full border border-[#00ffc2]/30 flex items-center justify-center text-[#b9cbc1]">
          ◻
        </div>
        <div className="w-8 h-8 rounded-full bg-[#262a2e]" />
      </div>
    </div>
  );
}
