import { useRef } from 'react';
import { ArrowLeft, ArrowRight, Brain, FlaskConical, NotebookText } from 'lucide-react';
import { useArchiveCards } from '../hooks/useArchiveCards';

export function ArchiveSection() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const { cards, isPending, isError } = useArchiveCards({ limit: 12 });

  const scrollCarousel = (direction: 'previous' | 'next') => {
    const carousel = carouselRef.current;

    if (!carousel) {
      return;
    }

    carousel.scrollBy({
      left: carousel.clientWidth * (direction === 'previous' ? -1 : 1),
      behavior: 'smooth',
    });
  };

  return (
    <section className="w-full min-w-0 overflow-hidden pb-[clamp(3rem,6vw,5rem)]">
      <div className="mb-[clamp(1.5rem,3vw,2.5rem)] flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-3xl font-black text-[#fbfffa] sm:text-4xl">Archive</h2>
          <p className="mt-2 text-base text-[#b9cbc1] sm:text-xl">Saved fragments from your knowledge map</p>
        </div>

        <div className="flex shrink-0 gap-3">
          {[ArrowLeft, ArrowRight].map((Icon, index) => (
            <button
              key={index}
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#3a4a43] bg-[#181c1f]/40 text-[#b9cbc1] transition hover:border-[#00ffc2]/60 hover:text-[#00ffc2] sm:h-12 sm:w-12"
              onClick={() => scrollCarousel(index === 0 ? 'previous' : 'next')}
              aria-label={index === 0 ? 'Previous archive page' : 'Next archive page'}
            >
              <Icon size={20} />
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-0 rounded-3xl bg-[radial-gradient(circle_at_center,rgba(0,255,194,0.08),transparent_64%)]">
        <div
          ref={carouselRef}
          className="flex w-full min-w-0 snap-x snap-mandatory gap-[clamp(1rem,2vw,2rem)] overflow-x-auto scroll-smooth px-1 pb-5"
        >
          {isPending ? (
            <StatusCard message="Loading archive cards..." />
          ) : null}

          {isError ? (
            <StatusCard message="Archive cards could not be loaded." tone="error" />
          ) : null}

          {!isPending && !isError && cards.length === 0 ? (
            <StatusCard message="No archive cards yet." />
          ) : null}

          {!isPending && !isError ? cards.map((card) => {
            const Icon = getCardIcon(card.category_name ?? card.tags[0]?.name);
            const date = formatDate(card.created_at);

            return (
              <article
                key={card.card_id}
                className="flex min-h-80 w-[min(88vw,28rem)] min-w-0 shrink-0 snap-start flex-col justify-between rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg border border-[#83958c]/10 bg-[#1c2023]/60 p-[clamp(1.5rem,2.5vw,2.25rem)] shadow-[0_40px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl md:w-[calc((100%-clamp(1rem,2vw,2rem))/2)] xl:w-[calc((100%-2*clamp(1rem,2vw,2rem))/3)]"
              >
                <div>
                  <div className="mb-7 flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg bg-[#1e5056]/30 text-[#00ffc2]">
                      <Icon size={22} />
                    </div>

                    <time className="text-xs font-bold uppercase tracking-widest text-[#b9cbc1]">
                      {date}
                    </time>
                  </div>

                  <h3 className="text-xl font-bold leading-snug text-[#fbfffa]">{card.title}</h3>

                  <p className="mt-4 text-sm font-medium leading-7 text-[#b9cbc1]">
                    {card.summary ?? 'No summary has been generated yet.'}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {card.tags.map((tag) => (
                    <span
                      key={tag.tag_id}
                      className="rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg bg-[#313539]/50 px-3 py-1.5 text-xs text-[#b9cbc1]"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </article>
            );
          }) : null}
        </div>
      </div>
    </section>
  );
}

function getCardIcon(seed?: string | null) {
  const normalized = seed?.toLowerCase() ?? '';

  if (normalized.includes('design') || normalized.includes('color') || normalized.includes('system')) {
    return FlaskConical;
  }

  if (normalized.includes('research') || normalized.includes('cognition')) {
    return Brain;
  }

  return NotebookText;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function StatusCard({ message, tone = 'default' }: { message: string; tone?: 'default' | 'error' }) {
  return (
    <div
      className={[
        'flex min-h-80 w-[min(88vw,28rem)] shrink-0 snap-start items-center justify-center rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg border bg-[#1c2023]/60 p-8 text-center text-sm font-medium backdrop-blur-xl md:w-[calc((100%-clamp(1rem,2vw,2rem))/2)] xl:w-[calc((100%-2*clamp(1rem,2vw,2rem))/3)]',
        tone === 'error' ? 'border-red-400/20 text-red-300' : 'border-[#83958c]/10 text-[#b9cbc1]',
      ].join(' ')}
    >
      {message}
    </div>
  );
}
