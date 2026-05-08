import { useEffect, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Filter, Search } from 'lucide-react';
import type { SearchCardResult, SearchParams } from '@san/shared';
import { searchApi } from '../api/client';

interface SearchFilters {
  tag: string;
  fromDate: string;
  toDate: string;
}

interface SearchPageProps {
  keyword: string;
  totalCount: number;
  results: SearchCardResult[];
  filters: SearchFilters;
  isPending?: boolean;
  isError?: boolean;
  hasNext?: boolean;
  onFilterChange: (filters: SearchFilters) => void;
  onLoadMore: () => void;
}

export function ResultPage() {
  const [searchParams] = useSearchParams();
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

  return (
    <SearchPage
      keyword={keyword}
      totalCount={searchQuery.data?.totalCount ?? accumulatedCards.length}
      results={accumulatedCards}
      filters={filters}
      isPending={searchQuery.isPending && Boolean(keyword)}
      isError={searchQuery.isError}
      hasNext={searchQuery.data?.hasNext ?? false}
      onFilterChange={setFilters}
      onLoadMore={() => setPage((current) => current + 1)}
    />
  );
}

function SearchPage({
  keyword,
  totalCount,
  results,
  filters,
  isPending = false,
  isError = false,
  hasNext = false,
  onFilterChange,
  onLoadMore,
}: SearchPageProps) {
  return (
    <section className="flex w-full min-w-0 flex-col gap-dashboard-gap py-dashboard-gap text-text-primary">
      <SearchHeader keyword={keyword} totalCount={totalCount} />

      <SearchToolbar
        filters={filters}
        onFilterChange={onFilterChange}
      />

      {!keyword ? <StateMessage message="Enter a keyword to search your knowledge cards." /> : null}
      {isPending ? <StateMessage message="Searching knowledge cards..." /> : null}
      {isError ? <StateMessage message="Search failed. Please try again." tone="error" /> : null}
      {keyword && !isPending && !isError && results.length === 0 ? (
        <StateMessage message="No matching knowledge cards found." />
      ) : null}

      {!isPending && !isError && results.length > 0 ? (
        <ResultGrid results={results} keyword={keyword} />
      ) : null}

      {keyword && results.length > 0 ? (
        <div className="flex flex-col items-center gap-md pt-xl">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={!hasNext}
            className="inline-flex items-center gap-sm rounded-leaf border border-text-secondary/30 bg-surface-low px-xl py-md text-body-lg-bold uppercase text-text-primary/80 transition hover:border-primary-signal/30 hover:glow-neon disabled:cursor-not-allowed disabled:opacity-50"
          >
            Load more
            <ChevronDown size={20} className="text-primary-signal" />
          </button>

          <p className="text-caption uppercase tracking-wide text-text-secondary/40">
            {hasNext ? 'More results available' : 'End of results'}
          </p>
        </div>
      ) : null}
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
      <h1 className="text-h1-bold">Search Results</h1>

      <p className="text-body-main text-text-secondary">
        {keyword ? (
          <>
            <span className="font-medium text-primary-signal">{keyword}</span>
            {' '}matched {totalCount} knowledge cards.
          </>
        ) : (
          'Search your saved knowledge cards.'
        )}
      </p>
    </header>
  );
}

function SearchToolbar({
  filters,
  onFilterChange,
}: {
  filters: SearchFilters;
  onFilterChange?: (filters: SearchFilters) => void;
}) {
  return (
    <div className="flex flex-col gap-md xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 flex-wrap items-center gap-md">
        <FilterGroup label="DATE">
          <FilterInput
            type="date"
            ariaLabel="From date"
            value={filters.fromDate}
            onChange={(value) => onFilterChange?.({ ...filters, fromDate: value })}
          />
          <FilterInput
            type="date"
            ariaLabel="To date"
            value={filters.toDate}
            onChange={(value) => onFilterChange?.({ ...filters, toDate: value })}
          />
        </FilterGroup>

        <FilterGroup label="TAG">
          <FilterInput
            type="text"
            ariaLabel="Tag"
            placeholder="#Design"
            value={filters.tag}
            onChange={(value) => onFilterChange?.({ ...filters, tag: value })}
          />
        </FilterGroup>
      </div>

      <div className="inline-flex w-fit items-center gap-sm rounded-leaf bg-surface-low p-sm text-caption-bold text-text-primary">
        <Filter size={20} className="text-text-secondary" />
        Filters
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

function ResultGrid({
  results,
  keyword,
}: {
  results: SearchCardResult[];
  keyword: string;
}) {
  return (
    <div className="grid gap-dashboard-gap sm:grid-cols-2 xl:grid-cols-3">
      {results.map((item) => (
        <SearchResultCard key={item.cardId} item={item} keyword={keyword} />
      ))}
    </div>
  );
}

function SearchResultCard({
  item,
  keyword,
}: {
  item: SearchCardResult;
  keyword: string;
}) {
  return (
    <article className="group flex min-h-64 flex-col rounded-leaf border border-text-secondary/10 bg-surface-low p-lg transition hover:-translate-y-1 hover:border-primary-signal/30 hover:glow-neon">
      <div className="flex items-start gap-md">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-leaf bg-primary-signal/10 text-primary-signal">
          <Search size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="break-words text-body-lg-bold text-text-primary">
            {highlightText(item.title, keyword)}
          </h2>
          <p className="mt-xs break-all font-mono text-caption text-text-secondary/50">
            {item.cardId}
          </p>
        </div>
      </div>

      <p className="mt-lg line-clamp-5 flex-1 break-words text-body-sm leading-6 text-text-secondary">
        {item.summary ?? 'No summary provided.'}
      </p>
    </article>
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
