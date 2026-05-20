import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, CalendarDays, Hash, Search } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useArchiveCategoryCards, type SearchCardResult, type SearchParams } from '@san/shared';
import { searchApi } from '../../api/client';
import { ContentEmptyState } from '../../components/shared/empty/ContentEmptyState';
import { ArchiveSummary } from '../components/archive/ArchiveSummary';

interface Filters {
  tag: string;
  fromDate: string;
  toDate: string;
}

export function ArchiveCategoryPage() {
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get('query')?.trim() ?? '';
  const [filters, setFilters] = useState<Filters>({ tag: '', fromDate: '', toDate: '' });
  const archiveQuery = useArchiveCategoryCards(categoryId);
  const categoryName = archiveQuery.data?.categoryName ?? '';
  const size = 12;

  const searchQuery = useInfiniteQuery({
    queryKey: ['archive-category-search', categoryId, categoryName, keyword, filters.tag, filters.fromDate, filters.toDate, size],
    queryFn: ({ pageParam }) => searchApi.search(toSearchParams(keyword, categoryName, filters, pageParam, size)),
    enabled: Boolean(keyword && categoryName),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => (lastPage.hasNext ? allPages.length : undefined),
  });

  const searchResults = useMemo(
    () => dedupeByCardId(searchQuery.data?.pages.flatMap((page) => page.results) ?? []),
    [searchQuery.data],
  );

  const archiveCards = archiveQuery.data?.cards ?? [];
  const isSearching = Boolean(keyword);

  return (
    <section className="flex w-full min-w-0 flex-col gap-8 py-12 text-text-primary">
      <header className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => navigate('/archive')}
          className="flex w-fit items-center gap-2 text-sm font-bold text-text-primary/45 transition hover:text-text-primary"
        >
          <ArrowLeft size={16} />
          전체 archive
        </button>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">{categoryName || 'Archive'}</h1>
          <p className="mt-3 text-text-primary/50">이 폴더 안의 지식카드를 찾고, 좁히고, 다시 꺼내볼 수 있습니다.</p>
        </div>
      </header>

      <FilterPanel
        keyword={keyword}
        filters={filters}
        onKeywordChange={(value) => setSearchParams(value ? { query: value } : {})}
        onFilterChange={setFilters}
      />

      {!isSearching ? (
        archiveQuery.isPending ? (
          <p className="py-16 text-center text-sm text-text-primary/40">지식카드를 불러오는 중입니다...</p>
        ) : archiveQuery.isError ? (
          <p className="py-16 text-center text-sm text-red-400">지식카드를 불러오지 못했습니다.</p>
        ) : archiveCards.length === 0 ? (
          <ContentEmptyState title="이 폴더는 아직 비어 있습니다" description="카드가 쌓이면 이곳에 차곡차곡 모입니다." />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {archiveCards.map((card) => (
              <ArchiveCard
                key={card.cardId}
                title={card.title}
                summary={null}
                tags={card.tags.map((tag) => tag.tagName)}
                categoryName={categoryName}
                createdAt={card.createdAt}
                onClick={() => navigate(`/cards/${card.cardId}`)}
              />
            ))}
          </div>
        )
      ) : searchQuery.isPending && searchResults.length === 0 ? (
        <p className="py-16 text-center text-sm text-text-primary/40">검색 중입니다...</p>
      ) : searchQuery.isError ? (
        <p className="py-16 text-center text-sm text-red-400">검색 결과를 불러오지 못했습니다.</p>
      ) : searchResults.length === 0 ? (
        <ContentEmptyState title="검색 결과가 없습니다" description="검색어 또는 조건을 조금 느슨하게 바꿔보세요." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {searchResults.map((card) => (
              <ArchiveCard
                key={card.cardId}
                title={card.title}
                summary={card.summary}
                tags={[]}
                categoryName={categoryName}
                onClick={() => navigate(`/cards/${card.cardId}`)}
              />
            ))}
          </div>
          {searchQuery.hasNextPage ? (
            <div className="flex justify-center pt-8">
              <button
                type="button"
                onClick={() => void searchQuery.fetchNextPage()}
                className="rounded-2xl border border-text-secondary/10 bg-text-primary/5 px-6 py-3 text-sm font-bold text-text-primary/75 transition hover:border-action-accent/40 hover:text-text-primary"
              >
                더 보기
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

function FilterPanel({
  keyword,
  filters,
  onKeywordChange,
  onFilterChange,
}: {
  keyword: string;
  filters: Filters;
  onKeywordChange: (value: string) => void;
  onFilterChange: (filters: Filters) => void;
}) {
  const [inputValue, setInputValue] = useState(keyword);

  useEffect(() => {
    setInputValue(keyword);
  }, [keyword]);

  useEffect(() => {
    if (inputValue.trim() === keyword) return;
    const timer = window.setTimeout(() => onKeywordChange(inputValue.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [inputValue, keyword, onKeywordChange]);

  return (
    <div className="flex flex-col gap-5 rounded-[32px] border border-text-secondary/5 glass-card bg-surface-container/80 p-6">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-primary/25" />
        <input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="이 폴더 안에서 검색"
          className="w-full rounded-2xl border border-text-secondary/5 bg-text-primary/[0.03] py-4 pl-11 pr-4 text-sm outline-none transition focus:border-primary-signal/30"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <input
          value={filters.tag}
          onChange={(event) => onFilterChange({ ...filters, tag: event.target.value })}
          placeholder="#태그"
          className="rounded-2xl border border-text-secondary/5 bg-text-primary/[0.03] px-4 py-3 text-sm outline-none"
        />
        <input
          type="date"
          value={filters.fromDate}
          onChange={(event) => onFilterChange({ ...filters, fromDate: event.target.value })}
          className="rounded-2xl border border-text-secondary/5 bg-text-primary/[0.03] px-4 py-3 text-sm outline-none"
        />
        <input
          type="date"
          value={filters.toDate}
          onChange={(event) => onFilterChange({ ...filters, toDate: event.target.value })}
          className="rounded-2xl border border-text-secondary/5 bg-text-primary/[0.03] px-4 py-3 text-sm outline-none"
        />
      </div>
    </div>
  );
}

function ArchiveCard({
  title,
  summary,
  tags,
  categoryName,
  createdAt,
  onClick,
}: {
  title: string;
  summary: string | null;
  tags: string[];
  categoryName?: string;
  createdAt?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex h-[300px] min-w-0 cursor-pointer flex-col overflow-hidden rounded-[30px] border border-text-secondary/5 bg-surface-low p-7 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-action-accent/18 hover:bg-surface-container/90"
    >
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-action-accent/[0.035] blur-[60px]" />
      <div className="relative flex items-start justify-between gap-4">
        <span className="inline-flex min-w-0 items-center gap-2 rounded-full border border-action-accent/15 bg-action-accent/8 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-action-accent">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-action-accent" />
          <span className="truncate">{categoryName || 'Archive'}</span>
        </span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-text-secondary/5 bg-text-primary/[0.03] text-text-primary/28 transition group-hover:border-action-accent/20 group-hover:text-action-accent">
          <ArrowRight size={16} aria-hidden="true" />
        </span>
      </div>

      <div className="relative mt-8 min-w-0">
        <h2 className="line-clamp-3 text-[22px] font-extrabold leading-tight text-text-primary transition group-hover:text-action-accent">
          {title}
        </h2>
        {summary ? (
          <ArchiveSummary
            summary={summary}
            className="mt-5 max-h-[4.5rem] space-y-1 overflow-hidden text-[13px] leading-5 text-text-primary/50"
          />
        ) : null}
      </div>

      <div className="relative mt-auto flex flex-col gap-4 border-t border-text-secondary/5 pt-5">
        <div className="flex items-center gap-2 text-[11px] font-bold text-text-primary/35">
          <CalendarDays size={13} className="text-action-accent/70" aria-hidden="true" />
          <span>{createdAt ? formatArchiveDate(createdAt) : '날짜 정보 없음'}</span>
        </div>
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-text-secondary/5 bg-text-primary/[0.03] px-2.5 py-1 text-[11px] font-bold leading-none text-text-primary/42 transition group-hover:border-action-accent/20 group-hover:text-action-accent"
              >
                <Hash size={10} aria-hidden="true" />
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </button>
  );
}

function formatArchiveDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function dedupeByCardId(cards: SearchCardResult[]) {
  return Array.from(new Map(cards.map((card) => [card.cardId, card])).values());
}

function toSearchParams(keyword: string, categoryName: string, filters: Filters, page: number, size: number): SearchParams {
  return {
    keyword,
    category: categoryName,
    page,
    size,
    ...(filters.tag.trim() ? { tag: filters.tag.trim().replace(/^#/, '') } : {}),
    ...(filters.fromDate ? { fromDate: filters.fromDate } : {}),
    ...(filters.toDate ? { toDate: filters.toDate } : {}),
  };
}
