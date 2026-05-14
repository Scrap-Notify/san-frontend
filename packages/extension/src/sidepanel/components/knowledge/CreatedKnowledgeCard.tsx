import { useState } from 'react';
import { ChevronDown, FileText, Image, Link } from 'lucide-react';
import type { KnowledgeCardView } from '@san/shared';
import type { SavedInsight } from '@extension/types';

interface CreatedKnowledgeCardProps {
  card: KnowledgeCardView;
  source?: SavedInsight | null;
}

function getSourceContent(source: SavedInsight) {
  return source.raw_content ?? source.source_url ?? source.image_file_name ?? source.title;
}

function getSourceMeta(source: SavedInsight) {
  return source.source_url ?? source.domain ?? source.image_file_name ?? source.title;
}

function getSourceIcon(source: SavedInsight) {
  if (source.source_type === 'IMAGE') return Image;
  if (source.source_type === 'LINK') return Link;
  return FileText;
}

export function CreatedKnowledgeCard({ card, source }: CreatedKnowledgeCardProps) {
  const [isSourceOpen, setIsSourceOpen] = useState(Boolean(source));
  const SourceIcon = source ? getSourceIcon(source) : FileText;
  const sourceContent = source ? getSourceContent(source) : null;
  const sourceMeta = source ? getSourceMeta(source) : null;

  return (
    <section className="px-1 text-body-sm font-medium text-text-secondary">
      <div className="mb-2 text-body-sm font-medium text-text-secondary/85">
        지식카드 생성
      </div>

      <article className="flex flex-col gap-4 overflow-hidden rounded-leaf border border-text-secondary/12 bg-surface-container/80 p-5 shadow-neon-sm">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 cursor-text select-text text-body-main-bold text-text-primary">
            {card.title}
          </h3>

          {source ? (
            <button
              type="button"
              onClick={() => setIsSourceOpen((current) => !current)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-signal/15 bg-primary-signal/8 text-primary-signal transition hover:border-primary-signal/30 hover:bg-primary-signal/12"
              aria-label={isSourceOpen ? 'Hide source origin' : 'Show source origin'}
              aria-expanded={isSourceOpen}
            >
              <ChevronDown
                size={16}
                strokeWidth={1.8}
                className={['transition-transform', isSourceOpen ? 'rotate-180' : ''].join(' ')}
                aria-hidden="true"
              />
            </button>
          ) : null}
        </div>

        {source && isSourceOpen ? (
          <div className="rounded-leaf border-l-2 border-primary-signal bg-background/35 p-4">
            <div className="mb-2 flex items-center gap-2 text-primary-signal">
              <SourceIcon size={13} strokeWidth={1.8} aria-hidden="true" />
              <span className="text-caption-bold uppercase">Source origin</span>
            </div>

            {sourceMeta ? (
              <p className="line-clamp-1 cursor-text select-text text-caption text-text-secondary/75">
                {sourceMeta}
              </p>
            ) : null}

            {source.image_preview_url ? (
              <img
                src={source.image_preview_url}
                alt={source.title}
                className="mt-3 max-h-24 w-full rounded-leaf object-cover"
              />
            ) : sourceContent ? (
              <p className="mt-2 max-h-16 overflow-y-auto whitespace-pre-wrap text-body-sm italic leading-5 text-text-primary/85 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {sourceContent}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col gap-4 pt-1">
          <p className="line-clamp-3 cursor-text select-text text-body-sm leading-6 text-text-secondary/85">
            {card.summary}
          </p>

          {card.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {card.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.tag_id}
                  className="inline-flex items-center rounded-full border border-primary-signal/20 bg-primary-signal/8 px-2.5 py-1 text-[10px] font-bold uppercase text-primary-signal"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    </section>
  );
}
