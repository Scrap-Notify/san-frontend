import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Clock, ExternalLink, Filter } from 'lucide-react';
import type { SearchCardResult, SearchParams } from '@san/shared';
import { searchApi } from '../api/client';
import heroImage from '../assets/hero.png';

type SortKey = 'latest' | 'relevance';

interface SearchFilters {
  tag: string;
  fromDate: string;
  toDate: string;
}

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
  filters: SearchFilters;
  sort: SortKey;
  isPending?: boolean;
  isError?: boolean;
  hasNext?: boolean;
  onFilterChange: (filters: SearchFilters) => void;
  onSortChange: (sort: SortKey) => void;
  onLoadMore: () => void;
}

export function ResultPage() {
  const [searchParams] = useSearchParams();
  const [sort, setSort] = useState<SortKey>('latest');
  const [filters, setFilters] = useState<SearchFilters>({
    tag: '',
    fromDate: '',
    toDate: '',
  });
  const [page, setPage] = useState(0);
  const [accumulatedCards, setAccumulatedCards] = useState<SearchCardResult[]>([]);

  const size = 12;
  const keyword = searchParams.get('query')?.trim() ?? '';
  const normalizedTag = normalizeTag(filters.tag);
  const filterKey = `${keyword}|${normalizedTag}|${filters.fromDate}|${filters.toDate}`;

  useEffect(() => {
    setPage(0);
    setAccumulatedCards([]);
  }, [filterKey]);

  const searchQuery = useQuery({
    queryKey: ['knowledge-search', keyword, normalizedTag, filters.fromDate, filters.toDate, page, size],
    queryFn: () => searchApi.search(toSearchParams(keyword, normalizedTag, filters, page, size)),
    enabled: Boolean(keyword),
  });

  useEffect(() => {
    if (!searchQuery.data) return;

    setAccumulatedCards((current) => {
      const nextCards = page === 0 ? searchQuery.data.results : [...current, ...searchQuery.data.results];
      return dedupeByCardId(nextCards);
    });
  }, [page, searchQuery.data]);

  const results = useMemo(
    () => mapCardsToSearchResults(accumulatedCards, keyword, sort),
    [accumulatedCards, keyword, sort],
  );

  return (
    <SearchPage
      keyword={keyword || '검색어 없음'}
      totalCount={searchQuery.data?.totalCount ?? results.length}
      results={results}
      filters={filters}
      sort={sort}
      isPending={searchQuery.isPending && Boolean(keyword)}
      isError={searchQuery.isError}
      hasNext={searchQuery.data?.hasNext ?? false}
      onFilterChange={setFilters}
      onSortChange={setSort}
      onLoadMore={() => setPage((current) => current + 1)}
    />
  );
}

function SearchPage({
  keyword,
  totalCount,
  results,
  filters,
  sort,
  isPending = false,
  isError = false,
  hasNext = false,
  onFilterChange,
  onSortChange,
  onLoadMore,
}: SearchPageProps) {
  return (
    <section className="flex w-full min-w-0 flex-col gap-dashboard-gap py-dashboard-gap text-text-primary">
      <SearchHeader keyword={keyword} totalCount={totalCount} />

      <SearchToolbar
        filters={filters}
        sort={sort}
        onFilterChange={onFilterChange}
        onSortChange={onSortChange}
      />

      {isPending ? <StateMessage message="검색 결과를 불러오는 중입니다." /> : null}
      {isError ? <StateMessage message="검색 결과를 불러오지 못했습니다." tone="error" /> : null}
      {!isPending && !isError && results.length === 0 ? (
        <StateMessage message="검색 결과가 없습니다." />
      ) : null}

      {!isPending && !isError && results.length > 0 ? (
        <ResultGrid results={results} keyword={keyword} />
      ) : null}

      <div className="flex flex-col items-center gap-md pt-xl">
        <button
          type="button"
          onClick={onLoadMore}
          disabled={!hasNext}
          className="inline-flex items-center gap-sm rounded-leaf border border-text-secondary/30 bg-surface-low px-xl py-md text-body-lg-bold uppercase text-text-primary/80 transition hover:border-primary-signal/30 hover:glow-neon disabled:cursor-not-allowed disabled:opacity-50"
        >
          더 보기
          <ChevronDown size={20} className="text-primary-signal" />
        </button>

        <p className="text-caption uppercase tracking-wide text-text-secondary/40">
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
    <header className="flex flex-col gap-sm">
      <h1 className="text-h1-bold">검색 결과</h1>

      <p className="text-body-main text-text-secondary">
        '<span className="font-medium text-primary-signal">{keyword}</span>'에 대한{' '}
        {totalCount}개의 지식 카드를 찾았습니다.
      </p>
    </header>
  );
}

function SearchToolbar({
  filters,
  sort,
  onFilterChange,
  onSortChange,
}: {
  filters: SearchFilters;
  sort: SortKey;
  onFilterChange?: (filters: SearchFilters) => void;
  onSortChange?: (sort: SortKey) => void;
}) {
  return (
    <div className="flex flex-col gap-md xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-md">
        <FilterGroup label="DATE">
          <FilterInput
            type="date"
            ariaLabel="시작일"
            value={filters.fromDate}
            onChange={(value) => onFilterChange?.({ ...filters, fromDate: value })}
          />
          <FilterInput
            type="date"
            ariaLabel="종료일"
            value={filters.toDate}
            onChange={(value) => onFilterChange?.({ ...filters, toDate: value })}
          />
        </FilterGroup>

        <FilterGroup label="TAG">
          <FilterInput
            type="text"
            ariaLabel="태그"
            placeholder="#Design"
            value={filters.tag}
            onChange={(value) => onFilterChange?.({ ...filters, tag: value })}
          />
        </FilterGroup>
      </div>

      <div className="flex shrink-0 items-center gap-sm">
        <div className="flex rounded-leaf bg-surface-low p-xs">
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
            관련도순
          </SegmentButton>
        </div>

        <div className="inline-flex items-center gap-sm rounded-leaf bg-surface-low p-sm text-caption-bold text-text-primary">
          <Filter size={20} className="text-text-secondary" />
          필터
        </div>
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
    <div className="flex flex-wrap items-center gap-sm rounded-leaf bg-surface-low px-md py-sm">
      <span className="text-caption-bold uppercase text-text-secondary/70">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterInput({
  type,
  value,
  onChange,
  ariaLabel,
  placeholder,
}: {
  type: 'date' | 'text';
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      aria-label={ariaLabel}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 min-w-0 rounded-leaf border border-text-secondary/20 bg-background/70 px-md text-caption text-text-primary outline-none placeholder:text-text-ghost focus:border-primary-signal/50"
    />
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
        'rounded-leaf px-md py-sm text-caption transition hover:glow-neon',
        active ? 'bg-primary-signal text-background' : 'text-text-secondary',
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
    <div className="grid gap-dashboard-gap sm:grid-cols-2 xl:grid-cols-3">
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
    <article className="group flex min-h-[480px] flex-col overflow-hidden rounded-leaf bg-surface-low transition hover:-translate-y-1 hover:glow-neon">
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.imageUrl}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        <StatusBadge />
        <SimilarityBadge value={item.similarity} />
      </div>

      <div className="flex flex-1 flex-col p-lg">
        <div className="space-y-xs pb-md">
          <p className="text-caption-bold uppercase text-primary-signal">
            {item.category}
          </p>

          <h2 className="text-body-lg-bold text-text-primary">
            {highlightText(item.title, item.highlightedKeyword ?? keyword)}
          </h2>
        </div>

        <p className="line-clamp-3 flex-1 text-body-sm text-text-secondary">
          {item.description}
        </p>

        <footer className="mt-lg flex items-center justify-between border-t border-text-secondary/10 pt-lg">
          <div className="flex items-center gap-sm text-caption text-text-secondary">
            <Clock size={20} />
            {item.createdLabel}
          </div>

          <button
            type="button"
            aria-label={`${item.title} 열기`}
            className="text-primary-signal transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            <ExternalLink size={20} />
          </button>
        </footer>
      </div>
    </article>
  );
}

function StatusBadge() {
  return (
    <div className="absolute left-md top-md inline-flex items-center gap-sm rounded-leaf border border-text-secondary/30 bg-background/60 px-sm py-xs backdrop-blur-xl">
      <span className="h-1 w-1 rounded-sm bg-primary-signal shadow-neon-sm" />
      <span className="text-caption-bold uppercase text-primary-signal">
        FIREFLY ACTIVE
      </span>
    </div>
  );
}

function SimilarityBadge({ value }: { value: number }) {
  return (
    <div className="absolute bottom-md right-md rounded-leaf bg-primary-signal px-sm py-xs text-caption-bold text-background">
      {value}% Similarity
    </div>
  );
}

function StateMessage({ message, tone = 'default' }: { message: string; tone?: 'default' | 'error' }) {
  return (
    <div
      className={[
        'rounded-leaf border bg-surface-low p-lg text-body-sm',
        tone === 'error'
          ? 'border-red-400/20 text-red-300'
          : 'border-text-secondary/30 text-text-secondary',
      ].join(' ')}
    >
      {message}
    </div>
  );
}

function toSearchParams(
  keyword: string,
  normalizedTag: string,
  filters: SearchFilters,
  page: number,
  size: number,
): SearchParams {
  return {
    keyword,
    page,
    size,
    ...(normalizedTag ? { tag: normalizedTag } : {}),
    ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
    ...(filters.toDate ? { toDate: filters.toDate } : {}),
  };
}

function normalizeTag(tag: string) {
  return tag.trim().replace(/^#/, '');
}

function dedupeByCardId(cards: SearchCardResult[]) {
  return Array.from(new Map(cards.map((card) => [card.cardId, card])).values());
}

function mapCardsToSearchResults(cards: SearchCardResult[], keyword: string, sort: SortKey) {
  const results = cards.map((card) => ({
    id: card.cardId,
    category: 'KNOWLEDGE',
    title: card.title,
    highlightedKeyword: keyword,
    description: card.summary ?? '요약이 아직 생성되지 않은 지식 카드입니다.',
    imageUrl: heroImage,
    similarity: calculateSimilarity(card, keyword),
    createdLabel: '저장된 지식',
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
      <span className="text-primary-signal">{text.slice(index, index + keyword.length)}</span>
      {text.slice(index + keyword.length)}
    </>
  );
}
