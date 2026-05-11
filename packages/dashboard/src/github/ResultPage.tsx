import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, Filter, Search, ExternalLink, Quote as QuoteIcon, MessageSquare, Clock, Globe, ArrowRight, Share2, Bookmark, Calendar, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import type { SearchCardResult, SearchParams } from '@san/shared';
import { searchApi } from '../api/client';

interface SearchFilters {
  tag: string;
  fromDate: string;
  toDate: string;
}

// Extend SearchCardResult for UI purposes (including mock data fields)
interface ExtendedSearchCardResult extends SearchCardResult {
  categoryName?: string;
  createdAt?: string;
}

interface SearchPageProps {
  keyword: string;
  totalCount: number;
  results: ExtendedSearchCardResult[];
  filters: SearchFilters;
  hasKeyword: boolean;
  isPending?: boolean;
  isError?: boolean;
  hasNext?: boolean;
  onFilterChange: (filters: SearchFilters) => void;
  onLoadMore: () => void;
  onSearchChange: (keyword: string) => void;
}

// --- Custom Date Picker Component ---
function CustomDatePicker({ 
  value, 
  onChange, 
  placeholder 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const handleDateClick = (day: number) => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const formatted = `${selected.getFullYear()}-${String(selected.getMonth() + 1).padStart(2, '0')}-${String(selected.getDate()).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const renderDays = () => {
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = [];

    // Empty slots
    for (let i = 0; i < firstDay; i++) days.push(<div key={`empty-${i}`} className="h-8 w-8" />);

    // Days
    for (let d = 1; d <= totalDays; d++) {
      const isSelected = value === `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push(
        <button
          key={d}
          onClick={() => handleDateClick(d)}
          className={`h-8 w-8 rounded-lg text-xs font-bold transition-all hover:bg-[#4ade80]/20 hover:text-[#4ade80] ${isSelected ? 'bg-[#4ade80] text-black shadow-[0_0_10px_#4ade80]' : 'text-white/60'}`}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  const displayValue = value ? value.replace(/-/g, '. ') : placeholder;

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-transparent text-[15px] font-bold text-white/90 outline-none transition-all hover:text-white"
      >
        <span>{displayValue}</span>
        <Calendar size={16} className="text-[#4ade80]" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-4 w-64 overflow-hidden rounded-tl-[32px] rounded-br-[32px] rounded-tr-lg rounded-bl-lg border border-white/10 bg-[#1a1f21] p-6 shadow-2xl animate-in fade-in zoom-in duration-200 origin-top-left">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={handlePrevMonth} className="text-white/40 hover:text-white"><ChevronLeft size={18} /></button>
            <span className="text-sm font-black uppercase tracking-widest text-white">
              {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="text-white/40 hover:text-white"><ChevronRight size={18} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
              <span key={d} className="text-[10px] font-black text-white/20">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {renderDays()}
          </div>
        </div>
      )}
    </div>
  );
}

export function ResultPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>({
    tag: '',
    fromDate: '',
    toDate: '',
  });
  const [page, setPage] = useState(0);
  const [accumulatedCards, setAccumulatedCards] = useState<ExtendedSearchCardResult[]>([]);
  const [prevFilterKey, setPrevFilterKey] = useState<string>('');
  const [lastProcessedData, setLastProcessedData] = useState<unknown>(null);

  const size = 12;
  const keyword = searchParams.get('query')?.trim() ?? '';
  const normalizedTag = normalizeTag(filters.tag);
  const filterKey = `${keyword}|${normalizedTag}|${filters.fromDate}|${filters.toDate}`;

  useEffect(() => {
    if (filterKey !== prevFilterKey) {
      setPrevFilterKey(filterKey);
      setPage(0);
      setAccumulatedCards([]);
      setLastProcessedData(null);
    }
  }, [filterKey, prevFilterKey]);

  const searchQuery = useQuery({
    queryKey: ['knowledge-search', keyword, normalizedTag, filters.fromDate, filters.toDate, page, size],
    queryFn: () => searchApi.search(toSearchParams(keyword, normalizedTag, filters, page, size)),
    enabled: Boolean(keyword),
  });

  const displayedResults = accumulatedCards;

  useEffect(() => {
    if (searchQuery.data && searchQuery.data !== lastProcessedData) {
      setLastProcessedData(searchQuery.data);
      setAccumulatedCards((current) => {
        const nextCards = page === 0 ? searchQuery.data.results : [...current, ...searchQuery.data.results];
        return dedupeByCardId(nextCards) as ExtendedSearchCardResult[];
      });
    }
  }, [lastProcessedData, page, searchQuery.data]);

  const handleSearchChange = (newKeyword: string) => {
    setSearchParams({ query: newKeyword });
  };

  return (
    <SearchPage
      keyword={keyword}
      totalCount={searchQuery.data?.totalCount ?? displayedResults.length}
      results={displayedResults}
      filters={filters}
      hasKeyword={Boolean(keyword)}
      isPending={searchQuery.isPending && !displayedResults.length}
      isError={searchQuery.isError}
      hasNext={searchQuery.data?.hasNext ?? false}
      onFilterChange={setFilters}
      onLoadMore={() => setPage((current) => current + 1)}
      onSearchChange={handleSearchChange}
    />
  );
}

function SearchPage({
  keyword,
  totalCount,
  results,
  filters,
  hasKeyword,
  isPending = false,
  isError = false,
  hasNext = false,
  onFilterChange,
  onLoadMore,
  onSearchChange,
}: SearchPageProps) {
  return (
    <section className="flex w-full min-w-0 flex-col gap-12 py-12 text-white">
      <header className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">검색 결과</h1>
          <div className="rounded-full bg-[#4ade80]/10 px-4 py-1 text-xs font-bold text-[#4ade80] border border-[#4ade80]/20">
            {totalCount} CARDS
          </div>
        </div>
        <p className="text-lg text-white/50">저장된 지식 카드에서 검색된 내용입니다.</p>
      </header>

      <div className="group flex flex-col gap-8 rounded-[32px] md:rounded-[40px] bg-[#131718] p-6 md:p-10 shadow-3xl border border-white/5 transition-all hover:border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 rounded-tl-[24px] rounded-br-[24px] rounded-tr-lg rounded-bl-lg bg-white/[0.03] px-6 py-4 border border-white/5 focus-within:border-[#4ade80]/40 transition-all">
            <span className="text-[11px] font-black text-white/30 uppercase tracking-widest">날짜 범위</span>
            <div className="flex items-center gap-4">
              <CustomDatePicker 
                value={filters.fromDate} 
                onChange={(val) => onFilterChange({ ...filters, fromDate: val })} 
                placeholder="연도. 월. 일." 
              />
              <span className="text-white/10 font-bold">—</span>
              <CustomDatePicker 
                value={filters.toDate} 
                onChange={(val) => onFilterChange({ ...filters, toDate: val })} 
                placeholder="연도. 월. 일." 
              />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] px-5 py-4 border border-white/5">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#4ade80]/20 text-[#4ade80]">
              <span className="text-xs font-black">#</span>
            </div>
            <input 
              type="text" 
              placeholder="카테고리 검색"
              value={filters.tag}
              onChange={(e) => onFilterChange({ ...filters, tag: e.target.value })}
              className="bg-transparent text-sm font-medium outline-none placeholder:text-white/20 w-full sm:w-32"
            />
          </div>

          <button className="lg:ml-auto flex items-center justify-center gap-2.5 rounded-xl bg-white/5 px-5 py-3.5 text-[13px] font-bold text-white/50 hover:bg-white/10 hover:text-white transition-all">
            <Filter size={16} />
            상세 필터
          </button>
        </div>

        <div className="relative">
          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-xl bg-white/5 text-white/20">
            <Search size={18} />
          </div>
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-white/20" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 rounded-2xl bg-white/[0.03] border border-white/5 text-sm font-medium outline-none focus:border-[#4ade80]/30 transition-all placeholder:text-white/10"
            placeholder="Search keywords in knowledge cards..."
            value={keyword}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {!hasKeyword ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 text-[#4ade80]">
            <Search size={24} />
          </div>
          <p className="text-sm font-medium text-white/40">검색어를 입력하면 아카이브에서 관련 지식 카드를 찾아드릴게요.</p>
        </div>
      ) : isPending ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-10 w-10 border-2 border-[#4ade80]/20 border-t-[#4ade80] rounded-full animate-spin" />
          <p className="text-sm font-medium text-white/40">검색 결과를 불러오는 중입니다...</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
             <AlertTriangle size={24} />
          </div>
          <p className="text-sm font-medium text-white/40">검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10">
          {results.map((card, idx) => (
            <KnowledgeCard key={card.cardId} card={card} index={idx} />
          ))}
        </div>
      )}

      {hasNext && !isPending && (
        <div className="flex justify-center pt-16">
          <button
            onClick={onLoadMore}
            className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-white/5 px-12 py-5 font-bold text-white/80 border border-white/10 transition-all hover:border-[#4ade80]/50 hover:bg-white/[0.08]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#4ade80]/0 via-[#4ade80]/5 to-[#4ade80]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            결과 더보기
            <ChevronDown size={20} className="transition-transform group-hover:translate-y-1 text-[#4ade80]" />
          </button>
        </div>
      )}
    </section>
  );
}

function KnowledgeCard({ card, index }: { card: ExtendedSearchCardResult; index: number }) {
  const navigate = useNavigate();
  const styleType = index % 4;

  if (styleType === 0) {
    return (
      <article 
        onClick={() => navigate(`/til?cardId=${card.cardId}`)}
        className="group relative flex h-[380px] cursor-pointer flex-col overflow-hidden rounded-[40px] bg-[#131718] p-10 border border-white/5 transition-all duration-500 hover:-translate-y-2 hover:bg-[#161a1b] hover:border-[#4ade80]/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_20px_rgba(74,222,128,0.05)]"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]" />
            <span className="text-[11px] font-black uppercase tracking-widest text-[#4ade80]">{card.categoryName || 'GENERAL'}</span>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-2 rounded-lg bg-white/5 hover:bg-[#4ade80]/20 text-white/40 hover:text-[#4ade80] transition-colors"><Bookmark size={14} /></button>
            <button className="p-2 rounded-lg bg-white/5 hover:bg-[#4ade80]/20 text-white/40 hover:text-[#4ade80] transition-colors"><Share2 size={14} /></button>
          </div>
        </div>
        <h3 className="text-2xl font-bold leading-tight mb-5 line-clamp-2 group-hover:text-[#4ade80] transition-colors">{card.title}</h3>
        <p className="text-sm leading-relaxed text-white/40 line-clamp-4 mb-auto group-hover:text-white/60 transition-colors">{card.summary || '상세 정보가 아직 없습니다.'}</p>
        <div className="flex items-center justify-between pt-8 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/5 shadow-inner">
               <Globe size={16} className="text-white/40" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-white/60">Knowledge Archive</span>
              <span className="text-[10px] text-white/20">{card.createdAt ? new Date(card.createdAt).toLocaleDateString() : 'No date'}</span>
            </div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-[#4ade80] group-hover:bg-[#4ade80] group-hover:text-black transition-all">
            <ArrowRight size={18} />
          </div>
        </div>
      </article>
    );
  }

  if (styleType === 1) {
    return (
      <article 
        onClick={() => navigate(`/til?cardId=${card.cardId}`)}
        className="group relative h-[380px] cursor-pointer overflow-hidden rounded-[40px] border border-white/5 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:border-[#4ade80]/30"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D0F] via-[#0B0D0F]/60 to-transparent z-10" />
        <img src={`https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0" alt="" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-0" />
        <div className="absolute inset-0 p-10 z-20 flex flex-col">
          <div className="flex justify-between items-start mb-auto">
            <span className="rounded-xl bg-black/40 backdrop-blur-xl px-4 py-1.5 text-[10px] font-black tracking-widest text-[#4ade80] border border-white/10 uppercase">{card.categoryName || 'MEDIA'}</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
               <ExternalLink size={18} />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-bold leading-tight">{card.title}</h3>
            <div className="flex items-center gap-4 text-[11px] font-bold text-white/50">
               <span className="flex items-center gap-1.5"><Clock size={14} className="text-[#4ade80]" /> 8 min read</span>
               <span className="flex items-center gap-1.5"><MessageSquare size={14} className="text-[#4ade80]" /> 12 insights</span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  if (styleType === 2) {
    return (
      <article 
        onClick={() => navigate(`/til?cardId=${card.cardId}`)}
        className="group relative flex h-[380px] cursor-pointer flex-col items-center justify-center text-center rounded-[40px] bg-gradient-to-b from-[#1a1f21] to-[#131718] p-12 border border-white/5 transition-all duration-500 hover:border-[#4ade80]/40"
      >
        <QuoteIcon className="text-[#4ade80]/20 mb-8" size={60} />
        <h3 className="text-2xl font-bold italic leading-relaxed text-white/90 mb-10 line-clamp-4">"{card.summary || card.title}"</h3>
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-full border-2 border-[#4ade80]/20 p-0.5 shadow-lg group-hover:border-[#4ade80]/50 transition-colors">
            <div className="h-full w-full rounded-full bg-gradient-to-tr from-[#4ade80] to-emerald-600 flex items-center justify-center text-black font-black text-sm uppercase">SJ</div>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-wide text-white">Insight Curator</span>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Thought Leadership</span>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article 
      onClick={() => navigate(`/til?cardId=${card.cardId}`)}
      className="group relative flex h-[380px] cursor-pointer flex-col rounded-[40px] bg-[#0B0D0F] p-10 border border-white/5 overflow-hidden transition-all duration-500 hover:bg-[#0e1113] hover:border-[#4ade80]/30"
    >
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#4ade80]/5 blur-[80px] transition-all group-hover:bg-[#4ade80]/10" />
      <div className="mb-10 h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-[#4ade80] group-hover:scale-110 group-hover:bg-[#4ade80]/10 transition-all">
        <Clock size={32} strokeWidth={1.5} />
      </div>
      <h3 className="text-2xl font-bold leading-tight mb-4 group-hover:text-[#4ade80] transition-colors">{card.title}</h3>
      <p className="text-sm leading-relaxed text-white/30 line-clamp-3 mb-auto group-hover:text-white/50 transition-colors">{card.summary}</p>
      <div className="flex items-center gap-2 mt-8">
        {['React', 'Design', 'Next.js'].map(tag => (
          <span key={tag} className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold text-white/40 border border-white/5 group-hover:border-[#4ade80]/20 transition-all">#{tag}</span>
        ))}
      </div>
    </article>
  );
}

function normalizeTag(tag: string) {
  return tag.trim().replace(/^#/, '');
}

function dedupeByCardId(cards: SearchCardResult[]) {
  return Array.from(new Map(cards.map((card) => [card.cardId, card])).values());
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
