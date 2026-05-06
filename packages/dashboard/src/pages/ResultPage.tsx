import { useSearchParams } from 'react-router-dom';
import { useArchiveCards } from '../hooks/useArchiveCards';

export function ResultPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') ?? '';
  const date = searchParams.get('date') ?? '';
  const tags = searchParams.get('tags')?.split(',').filter(Boolean) ?? [];

  const { cards, isPending, isError } = useArchiveCards({
    search: query || undefined,
    date: date || undefined,
    tags: tags.length > 0 ? tags : undefined,
    limit: 20,
  });

  return (
    <section className="w-full min-w-0 py-[clamp(2rem,5vw,3.5rem)]">
      <div className="grid w-full gap-8 rounded-3xl border border-[#3a4a43]/30 bg-[#181c1f]/50 p-[clamp(1.5rem,3vw,2.5rem)]">
        <header className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#00ffc2]">
          Search
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#fbfffa] sm:text-4xl">
          Search results
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#83958c]">
          This local placeholder reads search filters from the URL and runs them against mock cards.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <FilterChip label="Query" value={query || 'All'} />
          <FilterChip label="Date" value={date || 'Any'} />
          <FilterChip label="Tags" value={tags.length > 0 ? tags.join(', ') : 'Any'} />
        </div>
        </header>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {isPending ? <StateMessage message="Loading search results..." /> : null}
          {isError ? <StateMessage message="Search results could not be loaded." tone="error" /> : null}
          {!isPending && !isError && cards.length === 0 ? (
            <StateMessage message="No matching cards found." />
          ) : null}

          {!isPending && !isError
            ? cards.map((card) => (
                <article
                  key={card.card_id}
                  className="flex min-h-48 min-w-0 flex-col rounded-2xl border border-white/5 bg-[#101417]/60 p-4"
                >
                  <h2 className="text-base font-bold text-[#fbfffa]">{card.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#b9cbc1]">
                    {card.summary ?? 'No summary has been generated yet.'}
                  </p>
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    {card.tags.map((tag) => (
                      <span
                        key={tag.tag_id}
                        className="rounded-full bg-[#313539]/70 px-3 py-1 text-xs text-[#b9cbc1]"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </article>
              ))
            : null}
        </div>
      </div>
    </section>
  );
}

function FilterChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-full border border-[#3a4a43]/50 bg-[#101417]/50 px-3 py-1.5 text-xs text-[#b9cbc1]">
      <span className="font-bold text-[#00ffc2]">{label}:</span> {value}
    </span>
  );
}

function StateMessage({ message, tone = 'default' }: { message: string; tone?: 'default' | 'error' }) {
  return (
    <div
      className={[
        'rounded-2xl border p-4 text-sm font-medium md:col-span-2 xl:col-span-3',
        tone === 'error'
          ? 'border-red-400/20 bg-red-400/5 text-red-300'
          : 'border-white/5 bg-[#101417]/60 text-[#b9cbc1]',
      ].join(' ')}
    >
      {message}
    </div>
  );
}
