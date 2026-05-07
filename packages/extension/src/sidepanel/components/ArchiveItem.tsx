import { ChevronRight } from 'lucide-react';

interface ArchiveItemProps {
  title: string;
  meta: string;
}

export default function ArchiveItem({ title, meta }: ArchiveItemProps) {
  return (
    <div className="flex items-center justify-between rounded-leaf border border-text-secondary/20 bg-surface-container p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-surface-highest" />
        <div className="min-w-0">
          <div className="truncate text-body-main-bold text-text-primary">{title}</div>
          <div className="text-caption uppercase text-text-secondary">{meta}</div>
        </div>
      </div>
      <ChevronRight size={18} className="text-text-secondary" aria-hidden="true" />
    </div>
  );
}
