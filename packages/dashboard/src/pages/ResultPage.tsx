import { useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { SearchCardResult } from '@san/shared';
import { searchApi } from '../api/client';
import heroImage from '../assets/hero.png';

type SortKey = 'latest' | 'relevance';

interface SearchResultItem {
  id: string;
  category: string;
  title: string;
  highlightedKeyword?: string;
  description: string;
  imageUrl: string;
  similarity: number;
  createdLabel: string;
}

interface SearchPageProps {
  keyword: string;
  totalCount: number;
  results: SearchResultItem[];
  sort: SortKey;
  isPending?: boolean;
  isError?: boolean;
  hasNext?: boolean;
  onSortChange: (sort: SortKey) => void;
  onLoadMore: () => void;
  onFilterClick?: () => void;
}

export function ResultPage() {
  const [searchParams] = useSearchParams();
  const [sort, setSort] = useState<SortKey>('latest');
  const [page, setPage] = useState(0);
  const size = 12;
  const keyword = searchParams.get('query')?.trim() ?? '';

  const searchQuery = useQuery({
    queryKey: ['knowledge-search', keyword, page, size],
    queryFn: () => searchApi.search({ keyword, page, size }),
    enabled: Boolean(keyword),
  });

  const results = useMemo(
    () => mapCardsToSearchResults(searchQuery.data?.results ?? [], keyword, sort),
    [searchQuery.data?.results, keyword, sort],
  );

  return (
    <SearchPage
      keyword={keyword || '검색어'}
      totalCount={searchQuery.data?.totalCount ?? results.length}
      results={results}
      sort={sort}
      isPending={searchQuery.isPending && Boolean(keyword)}
      isError={searchQuery.isError}
      hasNext={searchQuery.data?.hasNext ?? false}
      onSortChange={setSort}
      onLoadMore={() => setPage((current) => current + 1)}
    />
  );
}

function SearchPage({
  keyword,
  totalCount,
  results,
  sort,
  isPending = false,
  isError = false,
  hasNext = false,
  onSortChange,
  onLoadMore,
  onFilterClick,
}: SearchPageProps) {
  return (
    <section className="flex w-full min-w-0 flex-col gap-8 py-6 text-[#fbfffa]">
      <SearchHeader keyword={keyword} totalCount={totalCount} />

      <SearchToolbar
        sort={sort}
        onSortChange={onSortChange}
        onFilterClick={onFilterClick}
      />

      {isPending ? <StateMessage message="검색 결과를 불러오는 중입니다." /> : null}
      {isError ? <StateMessage message="검색 결과를 불러오지 못했습니다." tone="error" /> : null}
      {!isPending && !isError && results.length === 0 ? (
        <StateMessage message="검색어와 유사한 지식카드를 찾지 못했습니다." />
      ) : null}

      {!isPending && !isError && results.length > 0 ? (
        <ResultGrid results={results} keyword={keyword} />
      ) : null}

      <div className="flex flex-col items-center gap-4 pt-8">
        <button
          type="button"
          onClick={onLoadMore}
          disabled={!hasNext}
          className="inline-flex items-center gap-3 rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] border border-[#3a4a43]/30 bg-[#181c1f] px-8 py-4 text-xl font-bold uppercase text-[#fbfffa]/80 transition hover:border-[#00ffc2]/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          더 탐색하기
          <ChevronDownIcon />
        </button>

        <p className="text-[10px] uppercase tracking-wide text-[#b9cbc1]/40">
          END OF DISCOVERED FRAGMENTS
        </p>
      </div>
    </section>
  );
}

function SearchHeader({
  keyword,
  totalCount,
}: {
  keyword: string;
  totalCount: number;
}) {
  return (
    <header className="flex flex-col gap-2">
      <h1 className="text-4xl font-semibold tracking-[-0.04em]">검색 결과</h1>

      <p className="text-base text-[#b9cbc1]">
        '<span className="font-medium text-[#00ffc2]">{keyword}</span>'에 대한{' '}
        {totalCount}개의 신호가 발견되었습니다.
      </p>
    </header>
  );
}

function SearchToolbar({
  sort,
  onSortChange,
  onFilterClick,
}: {
  sort: SortKey;
  onSortChange?: (sort: SortKey) => void;
  onFilterClick?: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-4">
        <FilterGroup label="DATE">
          <FilterPill active>이번 주</FilterPill>
          <FilterPill>한 달 이내</FilterPill>
        </FilterGroup>

        <FilterGroup label="TAGS">
          <FilterPill>#React</FilterPill>
          <FilterPill>#Performance</FilterPill>
          <FilterPill>#UI</FilterPill>
        </FilterGroup>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <div className="flex rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] bg-[#181c1f] p-1">
          <SegmentButton
            active={sort === 'latest'}
            onClick={() => onSortChange?.('latest')}
          >
            최신순
          </SegmentButton>
          <SegmentButton
            active={sort === 'relevance'}
            onClick={() => onSortChange?.('relevance')}
          >
            관련성순
          </SegmentButton>
        </div>

        <button
          type="button"
          onClick={onFilterClick}
          className="inline-flex items-center gap-2 rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] bg-[#181c1f] p-3 text-xs font-medium text-[#e0e3e7] transition hover:bg-[#22282c]"
        >
          <FilterIcon />
          필터
        </button>
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-full bg-[#181c1f] px-4 py-2">
      <span className="text-xs font-bold uppercase text-[#b9cbc1]/70">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterPill({
  active = false,
  children,
}: {
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={[
        'rounded-full px-4 py-1 text-xs font-medium transition',
        active
          ? 'bg-[#00ffc2] text-[#007255]'
          : 'border border-[#3a4a43] text-[#b9cbc1] hover:border-[#00ffc2]/40',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function SegmentButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] px-4 py-2 text-xs font-medium transition',
        active ? 'bg-[#00ffc2] text-[#007255]' : 'text-[#b9cbc1]',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function ResultGrid({
  results,
  keyword,
}: {
  results: SearchResultItem[];
  keyword: string;
}) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
      {results.map((item) => (
        <SearchResultCard key={item.id} item={item} keyword={keyword} />
      ))}
    </div>
  );
}

function SearchResultCard({
  item,
  keyword,
}: {
  item: SearchResultItem;
  keyword: string;
}) {
  return (
    <article className="group flex min-h-[480px] flex-col overflow-hidden rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] bg-[#181c1f] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(0,255,194,0.08)]">
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.imageUrl}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        <StatusBadge />
        <SimilarityBadge value={item.similarity} />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="space-y-1 pb-4">
          <p className="text-xs font-bold uppercase text-[#00ffc2]">
            {item.category}
          </p>

          <h2 className="text-xl font-medium leading-snug text-[#fbfffa]">
            {highlightText(item.title, item.highlightedKeyword ?? keyword)}
          </h2>
        </div>

        <p className="line-clamp-3 flex-1 text-sm font-medium leading-7 text-[#b9cbc1]">
          {item.description}
        </p>

        <footer className="mt-6 flex items-center justify-between border-t border-[#3a4a43]/10 pt-6">
          <div className="flex items-center gap-2 text-xs font-medium text-[#b9cbc1]">
            <ClockIcon />
            {item.createdLabel}
          </div>

          <button
            type="button"
            aria-label={`${item.title} 열기`}
            className="text-[#00ffc2] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            <ExternalArrowIcon />
          </button>
        </footer>
      </div>
    </article>
  );
}

function StatusBadge() {
  return (
    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] border border-[#3a4a43]/30 bg-[#101417]/60 px-3 py-1 backdrop-blur-xl">
      <span className="h-1 w-1 rounded-sm bg-[#00ffc2] shadow-[0_0_8px_#00ffc2]" />
      <span className="text-[10px] font-bold uppercase text-[#00ffc2]">
        FIREFLY ACTIVE
      </span>
    </div>
  );
}

function SimilarityBadge({ value }: { value: number }) {
  return (
    <div className="absolute bottom-4 right-4 rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] bg-[#00ffc2] px-3 py-1 text-xs font-bold text-[#007255]">
      {value}% Similarity
    </div>
  );
}

function StateMessage({ message, tone = 'default' }: { message: string; tone?: 'default' | 'error' }) {
  return (
    <div
      className={[
        'rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] border bg-[#181c1f] p-6 text-sm font-medium',
        tone === 'error'
          ? 'border-red-400/20 text-red-300'
          : 'border-[#3a4a43]/30 text-[#b9cbc1]',
      ].join(' ')}
    >
      {message}
    </div>
  );
}

function mapCardsToSearchResults(cards: SearchCardResult[], keyword: string, sort: SortKey) {
  const results = cards.map((card) => ({
    id: card.cardId,
    category: 'KNOWLEDGE',
    title: card.title,
    highlightedKeyword: keyword,
    description: card.summary ?? '요약이 아직 생성되지 않은 지식카드입니다.',
    imageUrl: heroImage,
    similarity: calculateSimilarity(card, keyword),
    createdLabel: '방금 전',
  }));

  return results.sort((a, b) => {
    if (sort === 'relevance') {
      return b.similarity - a.similarity;
    }
    return 0;
  });
}

function calculateSimilarity(card: SearchCardResult, keyword: string) {
  const normalizedKeyword = keyword.toLowerCase();
  if (!normalizedKeyword) {
    return 0;
  }

  const values = [card.title, card.summary ?? ''].map((value) => value.toLowerCase());
  const exactMatches = values.filter((value) => value.includes(normalizedKeyword)).length;
  const titleBoost = card.title.toLowerCase().includes(normalizedKeyword) ? 25 : 0;

  return Math.min(99, 55 + exactMatches * 8 + titleBoost);
}

function highlightText(text: string, keyword: string) {
  const normalizedKeyword = keyword.toLowerCase();
  if (!normalizedKeyword) return text;

  const index = text.toLowerCase().indexOf(normalizedKeyword);

  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <span className="text-[#00ffc2]">{text.slice(index, index + keyword.length)}</span>
      {text.slice(index + keyword.length)}
    </>
  );
}

function FilterIcon() {
  return (
    <svg width="11" height="7" viewBox="0 0 11 7" fill="none" className="shrink-0">
      <path
        d="M4.08333 7V5.83333H6.41667V7H4.08333ZM1.75 4.08333V2.91667H8.75V4.08333H1.75ZM0 1.16667V0H10.5V1.16667H0Z"
        fill="#E0E3E7"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0">
      <path
        d="M7.75833 8.575L8.575 7.75833L6.41667 5.6V2.91667H5.25V6.06667L7.75833 8.575ZM5.83333 11.6667C5.02639 11.6667 4.26806 11.5135 3.55833 11.2073C2.84861 10.901 2.23125 10.4854 1.70625 9.96042C1.18125 9.43542 0.765625 8.81806 0.459375 8.10833C0.153125 7.39861 0 6.64028 0 5.83333C0 5.02639 0.153125 4.26806 0.459375 3.55833C0.765625 2.84861 1.18125 2.23125 1.70625 1.70625C2.23125 1.18125 2.84861 0.765625 3.55833 0.459375C4.26806 0.153125 5.02639 0 5.83333 0C6.64028 0 7.39861 0.153125 8.10833 0.459375C8.81806 0.765625 9.43542 1.18125 9.96042 1.70625C10.4854 2.23125 10.901 2.84861 11.2073 3.55833C11.5135 4.26806 11.6667 5.02639 11.6667 5.83333C11.6667 6.64028 11.5135 7.39861 11.2073 8.10833C10.901 8.81806 10.4854 9.43542 9.96042 9.96042C9.43542 10.4854 8.81806 10.901 8.10833 11.2073C7.39861 11.5135 6.64028 11.6667 5.83333 11.6667Z"
        fill="#B9CBC1"
      />
    </svg>
  );
}

function ExternalArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" className="shrink-0">
      <path d="M1.4 13L0 11.6L9.6 2H1V0H13V12H11V3.4L1.4 13Z" fill="#00FFC2" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" className="shrink-0">
      <path d="M6 7.4L0 1.4L1.4 0L6 4.6L10.6 0L12 1.4L6 7.4Z" fill="#00FFC2" />
    </svg>
  );
}
