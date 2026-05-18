import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { ErrorFallback } from '@san/ui';
import { authTokenStorage } from '@dashboard/api/client';
import { useArchiveCards } from '@dashboard/main/hooks/useArchiveCards';
import { HomeKnowledgeCardsEmptyState } from './HomeEmptyStates';
import { HomeSectionTitle } from '../layout/HomeSectionTitle';

export function ArchiveSection() {
  const navigate = useNavigate();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { cards, isPending, isError } = useArchiveCards({ limit: 12 }, { enabled: isAuthenticated });
  const visibleCards = cards.slice(0, 12);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel || visibleCards.length === 0) return;
    const pageIndex = Math.round(carousel.scrollLeft / carousel.clientWidth);
    setActiveIndex(pageIndex);
  }, [visibleCards.length]);

  const scrollCarousel = useCallback((direction: 'previous' | 'next') => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    if (direction === 'next' && carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
      carousel.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }

    if (direction === 'previous' && carousel.scrollLeft <= 0) {
      return;
    }

    carousel.scrollBy({
      left: carousel.clientWidth * (direction === 'previous' ? -1 : 1),
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated || isPending || isError || visibleCards.length === 0 || isHovered || !isPlaying) return;
    const interval = setInterval(() => {
      scrollCarousel('next');
    }, 4000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isError, isHovered, isPending, isPlaying, scrollCarousel, visibleCards.length]);

  useEffect(() => {
    let ignore = false;

    authTokenStorage.getToken()
      .then((token) => {
        if (ignore) return;
        setIsAuthenticated(Boolean(token));
      })
      .finally(() => {
        if (ignore) return;
        setIsCheckingAuth(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const totalPages = Math.max(1, Math.ceil(visibleCards.length / 3));
  const hasCards = isAuthenticated && !isPending && !isError && visibleCards.length > 0;

  return (
    <section className="w-full min-w-0 overflow-hidden pb-xl">
      <div className="flex flex-col gap-dashboard-gap">
        <div className="flex flex-col gap-dashboard-gap sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <HomeSectionTitle>
              나의 지식 아카이브
            </HomeSectionTitle>
          </div>

          {isAuthenticated ? (
          <div className="flex shrink-0 items-center gap-3 rounded-full border border-text-secondary/10 glass-card bg-surface-container/80 px-3 py-1.5 shadow-sm">
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-full text-text-primary/40 transition hover:bg-surface-container/90 bg-surface-container/80 hover:text-text-primary disabled:opacity-20"
              onClick={() => setIsPlaying((current) => !current)}
              disabled={!hasCards}
              aria-label={isPlaying ? '일시정지' : '재생'}
            >
              {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
            </button>
            <div className="h-3 w-[1px] glass-card bg-surface-container/80" />

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollCarousel('previous')}
                className="flex h-6 w-6 items-center justify-center rounded-full text-text-primary/40 transition hover:bg-surface-container/90 bg-surface-container/80 hover:text-text-primary disabled:opacity-20"
                disabled={!hasCards || activeIndex === 0}
                aria-label="이전 페이지"
              >
                <ChevronLeft size={14} />
              </button>

              <div className="flex items-center gap-2 px-1">
                {hasCards ? Array.from({ length: totalPages }).map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      const carousel = carouselRef.current;
                      if (!carousel) return;
                      carousel.scrollTo({ left: carousel.clientWidth * index, behavior: 'smooth' });
                    }}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? 'w-5 bg-action-accent shadow-[0_0_10px_rgba(74,222,128,0.5)]'
                        : 'w-2.5 bg-surface-highest/70 hover:bg-surface-container/90'
                    }`}
                    aria-label={`${index + 1}번째 페이지로 이동`}
                  />
                )) : null}
              </div>

              <button
                type="button"
                onClick={() => scrollCarousel('next')}
                className="flex h-6 w-6 items-center justify-center rounded-full text-text-primary/40 transition hover:bg-surface-container/90 bg-surface-container/80 hover:text-text-primary disabled:opacity-20"
                disabled={!hasCards || activeIndex === totalPages - 1}
                aria-label="다음 페이지"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          ) : null}
        </div>

        <div
          className="min-w-0"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex w-full min-w-0 snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {isCheckingAuth ? (
              <StatusCard message="로그인 상태를 확인하는 중..." />
            ) : null}

            {!isCheckingAuth && !isAuthenticated ? (
              <div className="flex min-h-[400px] w-full shrink-0 snap-start items-center justify-center">
                <ErrorFallback
                  type="auth"
                  variant="full"
                  onRetry={() => navigate('/login', { state: { from: '/' } })}
                />
              </div>
            ) : null}

            {isAuthenticated && isPending ? (
              <StatusCard message="아카이브 카드를 불러오는 중..." />
            ) : null}

            {isAuthenticated && isError ? (
              <StatusCard message="아카이브 카드를 불러올 수 없습니다." tone="error" />
            ) : null}

            {isAuthenticated && !isPending && !isError && visibleCards.length === 0 ? (
              <HomeKnowledgeCardsEmptyState
                primaryAction={{
                  label: '분석 시작',
                  onClick: () => navigate('/til'),
                }}
              />
            ) : null}

            {hasCards ? visibleCards.map((card) => {
              const date = formatRelativeDate(card.created_at);
              const categoryName = card.category_name ?? card.tags[0]?.name ?? 'Uncategorized';

              return (
                <article
                  key={card.card_id}
                  onClick={() => navigate(`/cards/${card.card_id}`)}
                  className="group relative flex h-[280px] w-[min(88vw,24rem)] min-w-0 shrink-0 cursor-pointer snap-start flex-col justify-between rounded-tl-[32px] rounded-br-[32px] rounded-tr-2xl rounded-bl-2xl glass-card bg-surface-container/80 p-6 shadow-md transition-all hover:bg-surface-container md:w-[calc((100%-24px)/2)] xl:w-[calc((100%-48px)/3)]"
                >
                  <div>
                    <div className="mb-6 flex items-center justify-between">
                      <span className="flex items-center justify-center rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm border border-action-accent/20 bg-action-accent/5 px-3 py-1.5 text-[11px] font-bold tracking-wide text-action-accent">
                        {categoryName}
                      </span>

                      <time className="text-[11px] font-medium text-text-secondary/70">
                        {date}
                      </time>
                    </div>

                    <h3 className="line-clamp-2 text-xl font-bold leading-snug text-text-primary">
                      {card.title}
                    </h3>

                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-text-secondary">
                      {card.summary ?? '요약 내용이 아직 생성되지 않았습니다.'}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <div className="flex h-11 w-11 items-center justify-center rounded-tl-[20px] rounded-br-[20px] rounded-tr-md rounded-bl-md glass-panel bg-surface-lowest/70 text-text-secondary transition-colors group-hover:bg-action-accent/10 group-hover:text-action-accent">
                      <ArrowRight size={18} />
                    </div>
                  </div>
                </article>
              );
            }) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 1) {
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    return diffInMins <= 0 ? '방금 전' : `${diffInMins}분 전`;
  }
  if (diffInHours < 24) {
    return `${diffInHours}시간 전`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}일 전`;
  }

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function StatusCard({ message, tone = 'default' }: { message: string; tone?: 'default' | 'error' }) {
  return (
    <div
      className={[
        'flex h-[280px] w-[min(88vw,24rem)] shrink-0 snap-start items-center justify-center rounded-tl-[32px] rounded-br-[32px] rounded-tr-2xl rounded-bl-2xl glass-card bg-surface-container/80 p-xl text-center text-body-sm md:w-[calc((100%-24px)/2)] xl:w-[calc((100%-48px)/3)]',
        tone === 'error' ? 'text-red-400' : 'text-text-secondary',
      ].join(' ')}
    >
      {message}
    </div>
  );
}
