import { ExternalLink, FileText, Link } from 'lucide-react';
import { IconBox, TagBadge } from '@san/ui';

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
      <article className="overflow-hidden rounded-leaf bg-surface-container shadow-neon-sm">
        <div className="relative h-32 bg-surface-highest">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt=""
              className="h-full w-full object-cover opacity-60"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container to-transparent" />
        </div>

        <div className="space-y-sm p-md">
          <h3 className="text-body-lg-bold text-text-primary">{item.title}</h3>
          <p className="text-body-main text-text-secondary">{item.subtitle}</p>
        </div>
      </article>
    );
  }

  return (
    <article
      className={[
        'rounded-leaf p-md',
        item.type === 'link'
          ? 'border border-text-secondary/10 bg-surface-highest/40 backdrop-blur-xl'
          : 'bg-surface-container shadow-neon-sm',
      ].join(' ')}
    >
      <div className="flex items-start gap-3">
        <IconBox variant="leaf" size="sm" className="text-primary-signal">
          {item.type === 'link' ? <Link size={20} /> : <FileText size={20} />}
        </IconBox>

        <div className="min-w-0 flex-1">
          <h3 className="text-body-lg-bold text-text-primary">{item.title}</h3>
          {item.timeLabel ? (
            <p className="text-caption text-text-secondary">{item.timeLabel}</p>
          ) : null}
        </div>

        {item.type === 'text' ? (
          <ExternalLink size={20} className="shrink-0 text-text-secondary" />
        ) : null}
      </div>

      {item.excerpt ? (
        <p className="mt-sm line-clamp-3 text-body-sm text-text-secondary">
          {item.excerpt}
        </p>
      ) : null}

      {item.tag ? (
        <div className="mt-sm flex items-center justify-between">
          <TagBadge label={item.tag} />
        </div>
      ) : null}
    </article>
  );
}
