import { useRef } from 'react';
import { ArrowLeft, ArrowRight, Brain, FlaskConical, NotebookText } from 'lucide-react';
import { IconBox, TagBadge } from '@san/ui';
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
    <section className="w-full min-w-0 overflow-hidden pb-xl">
      <div className="mb-dashboard-gap flex flex-col gap-dashboard-gap sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-h1-bold text-text-primary">Archive</h2>
          <p className="mt-sm text-body-main text-text-secondary">Saved fragments from your knowledge map</p>
        </div>

        <div className="flex shrink-0 gap-sm">
          {[ArrowLeft, ArrowRight].map((Icon, index) => (
            <button
              key={index}
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-leaf border border-text-secondary/30 bg-surface-low/40 text-text-secondary transition hover:border-primary-signal/60 hover:text-primary-signal hover:glow-neon"
              onClick={() => scrollCarousel(index === 0 ? 'previous' : 'next')}
              aria-label={index === 0 ? 'Previous archive page' : 'Next archive page'}
            >
              <Icon size={20} />
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-0 rounded-leaf bg-primary-signal/5">
        <div
          ref={carouselRef}
          className="flex w-full min-w-0 snap-x snap-mandatory gap-dashboard-gap overflow-x-auto scroll-smooth px-xs pb-lg"
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
                className="flex min-h-80 w-[min(88vw,28rem)] min-w-0 shrink-0 snap-start flex-col justify-between rounded-leaf border border-text-ghost/10 bg-surface-container/60 p-lg shadow-neon-sm backdrop-blur-xl md:w-[calc((100%-theme(spacing.dashboard-gap))/2)] xl:w-[calc((100%-2*theme(spacing.dashboard-gap))/3)]"
              >
                <div>
                  <div className="mb-lg flex items-start justify-between gap-md">
                    <IconBox variant="leaf" size="md" className="text-primary-signal">
                      <Icon size={20} />
                    </IconBox>

                    <time className="text-caption-bold uppercase tracking-wide text-text-secondary">
                      {date}
                    </time>
                  </div>

                  <h3 className="text-body-lg-bold text-text-primary">{card.title}</h3>

                  <p className="mt-md text-body-sm text-text-secondary">
                    {card.summary ?? 'No summary has been generated yet.'}
                  </p>
                </div>

                <div className="mt-xl flex flex-wrap gap-sm">
                  {card.tags.map((tag) => (
                    <TagBadge key={tag.tag_id} label={tag.name} />
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
        'flex min-h-80 w-[min(88vw,28rem)] shrink-0 snap-start items-center justify-center rounded-leaf border bg-surface-container/60 p-xl text-center text-body-sm backdrop-blur-xl md:w-[calc((100%-theme(spacing.dashboard-gap))/2)] xl:w-[calc((100%-2*theme(spacing.dashboard-gap))/3)]',
        tone === 'error' ? 'border-red-400/20 text-red-300' : 'border-text-ghost/10 text-text-secondary',
      ].join(' ')}
    >
      {message}
    </div>
  );
}
