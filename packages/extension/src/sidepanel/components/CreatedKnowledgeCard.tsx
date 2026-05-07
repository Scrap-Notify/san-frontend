import type { KnowledgeCardView } from '@san/shared';

interface CreatedKnowledgeCardProps {
  card: KnowledgeCardView;
}

export function CreatedKnowledgeCard({ card }: CreatedKnowledgeCardProps) {
  return (
    <article className="rounded-leaf border border-primary-signal/30 bg-primary-signal/10 p-popover-padding">
      <p className="text-caption font-bold uppercase tracking-[0.18em] text-primary-signal">
        Created card
      </p>
      <h3 className="mt-2 text-body-main-bold text-text-primary">{card.title}</h3>
      {card.summary ? (
        <p className="mt-2 line-clamp-3 text-caption leading-5 text-text-secondary">{card.summary}</p>
      ) : null}
      {card.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {card.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.tag_id}
              className="rounded-full border border-primary-signal/20 bg-background/70 px-2 py-1 text-caption font-bold text-primary-signal"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
