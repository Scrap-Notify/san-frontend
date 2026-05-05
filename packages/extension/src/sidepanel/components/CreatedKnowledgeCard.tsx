import type { KnowledgeCardView } from '@san/shared';

interface CreatedKnowledgeCardProps {
  card: KnowledgeCardView;
}

export function CreatedKnowledgeCard({ card }: CreatedKnowledgeCardProps) {
  return (
    <article className="rounded-[22px] border border-[#00ffc2]/30 bg-[#00ffc2]/10 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#00ffc2]">
        Created card
      </p>
      <h3 className="mt-2 text-sm font-black text-[#e0e3e7]">{card.title}</h3>
      {card.summary ? (
        <p className="mt-2 line-clamp-3 text-xs leading-5 text-[#b9cbc1]">{card.summary}</p>
      ) : null}
      {card.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {card.tags.slice(0, 3).map((tag) => (
            <span
              key={tag.tag_id}
              className="rounded-md border border-white/5 bg-[#101417]/70 px-2 py-0.5 text-[9px] font-bold text-[#b9cbc1]"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
