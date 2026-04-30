import { LeafCard } from '@san/ui';
import { useArchiveCards } from '../hooks/useArchiveCards';

export function ArchiveSection() {
  const { cards, isPending, isError } = useArchiveCards();

  return (
    <section className="px-8 pb-16">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-[#fbfffa]">Archive</h2>
          <p className="mt-0.5 text-sm text-[#83958c]">Saved knowledge cards</p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e5056]/60 text-[#83958c] transition-all hover:border-[#00ffc2]/40 hover:text-[#00ffc2]"
            aria-label="Previous"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1e5056]/60 text-[#83958c] transition-all hover:border-[#00ffc2]/40 hover:text-[#00ffc2]"
            aria-label="Next"
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      {isPending && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-leaf bg-[#181c1f]" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-[#83958c]">Failed to load archive cards.</p>
        </div>
      )}

      {!isPending && !isError && cards.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <p className="text-center text-sm leading-relaxed text-[#83958c]">
            No saved cards yet.
            <br />
            Add scraps from the extension to build your archive.
          </p>
        </div>
      )}

      {!isPending && !isError && cards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <LeafCard
              key={card.card_id}
              card={card}
              variant="full"
              onClick={() => {
                if (card.source_url) window.open(card.source_url, '_blank');
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
