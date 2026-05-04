import { useRef } from 'react';
import { ArrowLeft, ArrowRight, Brain, FlaskConical, NotebookText } from 'lucide-react';

const archiveCards = [
  {
    title: 'Memory relationship mapping',
    date: '2024. 05. 21',
    summary: 'A design note about navigating knowledge as connected nodes instead of a flat chronological list.',
    tags: ['#Psychology', '#Cognition'],
    icon: Brain,
  },
  {
    title: 'Bioluminescence system',
    date: '2024. 05. 18',
    summary: 'A visual system inspired by low-light forests, luminous contrast, and calm interface feedback.',
    tags: ['#Colors', '#Systems'],
    icon: FlaskConical,
  },
  {
    title: 'Biophilic UI patterns',
    date: '2024. 05. 24',
    summary: 'Research notes on applying organic rhythm, rounded geometry, and readable density to product UI.',
    tags: ['#Design', '#Research'],
    icon: NotebookText,
  },
];

export function ArchiveSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

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

      <div className="relative min-w-0">
        <div className="pointer-events-none absolute inset-x-0 -top-8 bottom-0 rounded-3xl bg-[radial-gradient(circle_at_center,rgba(0,255,194,0.12),transparent_62%)] blur-2xl" />

        <div
          ref={carouselRef}
          className="relative flex w-full min-w-0 snap-x snap-mandatory gap-[clamp(1rem,2vw,2rem)] overflow-x-auto scroll-smooth pb-5"
        >
          {archiveCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="flex min-h-80 w-[min(85vw,28rem)] min-w-0 shrink-0 snap-start flex-col justify-between rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg border-l border-t border-[#83958c]/10 bg-[#1c2023]/60 p-[clamp(1.5rem,2.5vw,2.25rem)] shadow-[0_40px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl md:w-[calc((100%-clamp(1rem,2vw,2rem))/2)] xl:w-[calc((100%-2*clamp(1rem,2vw,2rem))/3)]"
              >
                <div>
                  <div className="mb-7 flex items-start justify-between gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg bg-[#1e5056]/30 text-[#00ffc2]">
                      <Icon size={22} />
                    </div>

                    <time className="text-xs font-bold uppercase tracking-widest text-[#b9cbc1]">
                      {card.date}
                    </time>
                  </div>

                  <h3 className="text-xl font-bold leading-snug text-[#fbfffa]">{card.title}</h3>

                  <p className="mt-4 text-sm font-medium leading-7 text-[#b9cbc1]">
                    {card.summary}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg bg-[#313539]/50 px-3 py-1.5 text-xs text-[#b9cbc1]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
