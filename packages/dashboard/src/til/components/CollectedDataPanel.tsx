import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { TilResponse, TilSourceContentResponse } from '@san/shared';
import type { TilRecallCardsQuery, TilSourcesQuery } from '../types';
import { CollectedDataCard, type CollectedDataItem } from './CollectedDataCard';
import { RecallHistory } from './RecallHistory';

const EMPTY_SOURCES: TilSourceContentResponse[] = [];

interface CollectedDataPanelProps {
    sourcesQuery: TilSourcesQuery;
    recallCardsQuery: TilRecallCardsQuery;
    selectedTil: TilResponse | null;
}

type PanelTab = 'sources' | 'recall';

export function CollectedDataPanel({ sourcesQuery, recallCardsQuery, selectedTil }: CollectedDataPanelProps) {
    const [activeTab, setActiveTab] = useState<PanelTab>('recall');
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);
    const sources = sourcesQuery.data?.sources ?? EMPTY_SOURCES;
    const recallCount = recallCardsQuery.data?.recallCards.length ?? 0;

    const items: CollectedDataItem[] = useMemo(() => {
        const baseItems = sources.map((source) => ({
            id: source.scrapId,
            type: toCollectedDataType(source.sourceType),
            title: source.title,
            timeLabel: new Date(source.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
            }),
            excerpt: source.rawContent || source.sourceUrl || '',
            tag: source.category?.categoryName ? `# ${source.category.categoryName}` : '',
            imageUrl: source.imageUrl ?? undefined,
            href: source.sourceUrl ?? undefined,
        }));

        if (!debouncedSearch) return baseItems;

        const lowerSearch = debouncedSearch.toLowerCase();
        return baseItems.filter((item) =>
            item.title.toLowerCase().includes(lowerSearch) ||
            item.excerpt.toLowerCase().includes(lowerSearch) ||
            item.tag.toLowerCase().includes(lowerSearch)
        );
    }, [sources, debouncedSearch]);

    return (
        <aside className="flex h-full w-full flex-col overflow-hidden bg-transparent">
            <header className="flex shrink-0 items-center gap-2 border-b border-text-secondary/5 p-3">
                <PanelTabButton
                    active={activeTab === 'recall'}
                    badge={recallCount}
                    label="Recall"
                    onClick={() => setActiveTab('recall')}
                />
                <PanelTabButton
                    active={activeTab === 'sources'}
                    label="Source"
                    onClick={() => setActiveTab('sources')}
                />
            </header>

            {activeTab === 'sources' ? (
                <>
                    <div className="border-b border-text-secondary/5 p-4">
                        <label className="flex items-center gap-2 rounded-full bg-surface-highest px-4 py-2 transition focus-within:ring-1 focus-within:ring-primary-signal/30">
                            <Search size={16} className="text-text-secondary" />
                            <input
                                type="search"
                                placeholder="키워드로 검색..."
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-secondary/60"
                            />
                        </label>
                    </div>

                    <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
                        {sourcesQuery.isPending && selectedTil && !import.meta.env.DEV ? (
                            <div className="py-10 text-center text-sm italic text-text-secondary opacity-50">
                                수집 데이터를 불러오는 중...
                            </div>
                        ) : null}

                        {items.map((item) => (
                            <CollectedDataCard key={item.id} item={item} />
                        ))}

                        {selectedTil && !sourcesQuery.isPending && items.length === 0 ? (
                            <div className="py-10 text-center text-sm italic text-text-secondary opacity-50">
                                {debouncedSearch ? '검색 결과가 없습니다.' : '수집 데이터가 없습니다.'}
                            </div>
                        ) : null}
                    </div>
                </>
            ) : (
                <RecallHistory
                    recallCardsQuery={recallCardsQuery}
                    selectedTil={selectedTil}
                    variant="panel"
                />
            )}
        </aside>
    );
}

function PanelTabButton({
    active,
    badge,
    label,
    onClick,
}: {
    active: boolean;
    badge?: number;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex h-9 flex-1 items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-8 after:-translate-x-1/2 after:transition-all ${
                active
                    ? 'text-action-accent after:bg-action-accent after:shadow-[0_0_10px_rgba(74,222,128,0.45)]'
                    : 'text-text-secondary/65 after:bg-transparent hover:text-text-primary/90 hover:after:bg-text-primary/20'
            }`}
        >
            {label}
            {badge ? (
                <span className="rounded-full bg-action-accent/15 px-1.5 py-0.5 text-[10px] text-action-accent">
                    {badge}
                </span>
            ) : null}
        </button>
    );
}

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

function toCollectedDataType(sourceType: string): CollectedDataItem['type'] {
    if (sourceType === 'LINK') return 'link';
    if (sourceType === 'IMAGE') return 'image';
    return 'text';
}
