import { ExternalLink, FileText, Link } from 'lucide-react';

export interface CollectedDataItem {
  id: string;
  type: 'text' | 'image' | 'link';
  title: string;
  subtitle?: string;
  timeLabel?: string;
  excerpt?: string;
  tag?: string;
  imageUrl?: string;
}

export function CollectedDataCard({ item }: { item: CollectedDataItem }) {
  if (item.type === 'image') {
    return (
      <article className="overflow-hidden rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] bg-[#1c2023] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]">
        <div className="relative h-32 bg-[#262a2e]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover opacity-60"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#1c2023] to-transparent" />
        </div>

        <div className="space-y-2 p-4">
          <h3 className="text-xl font-bold text-[#e0e3e7]">{item.title}</h3>
          <p className="text-base text-[#b9cbc1]">{item.subtitle}</p>
        </div>
      </article>
    );
  }

  return (
    <article
      className={[
        'rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] p-4',
        item.type === 'link'
          ? 'border border-[#3a4a43]/10 bg-[#313539]/40 backdrop-blur-xl'
          : 'bg-[#1c2023] shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1)]',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#262a2e] text-[#36ffc4]">
          {item.type === 'link' ? <Link size={20} /> : <FileText size={20} />}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold text-[#e0e3e7]">{item.title}</h3>
          {item.timeLabel ? (
            <p className="text-[10px] text-[#b9cbc1]">{item.timeLabel}</p>
          ) : null}
        </div>

        {item.type === 'text' ? (
          <ExternalLink size={14} className="shrink-0 text-[#b9cbc1]" />
        ) : null}
      </div>

      {item.excerpt ? (
        <p className="mt-3 line-clamp-3 text-xs leading-5 text-[#b9cbc1]">
          {item.excerpt}
        </p>
      ) : null}

      {item.tag ? (
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] text-[#9ecfd6]">{item.tag}</span>
        </div>
      ) : null}
    </article>
  );
}