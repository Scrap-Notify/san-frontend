interface ArchiveItemProps {
  title: string;
  meta: string;
}

export default function ArchiveItem({ title, meta }: ArchiveItemProps) {
  return (
    <div className="flex items-center justify-between rounded-[20px] border border-white/5 bg-[#181c1f] p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-[#313539]" />
        <div className="min-w-0">
          <div className="truncate text-xs font-bold text-[#e0e3e7]">{title}</div>
          <div className="text-[10px] uppercase text-[#b9cbc1]">{meta}</div>
        </div>
      </div>
      <div className="text-[#b9cbc1]">...</div>
    </div>
  );
}
