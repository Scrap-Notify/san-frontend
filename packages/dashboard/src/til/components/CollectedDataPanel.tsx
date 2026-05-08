import { Link, Search } from 'lucide-react';
import type { TilResponse } from '@san/shared';
import type { TilSourcesQuery } from '../types';
import { CollectedDataCard, type CollectedDataItem } from './CollectedDataCard';

interface CollectedDataPanelProps {
    sourcesQuery: TilSourcesQuery;
    selectedTil: TilResponse | null;
}

export function CollectedDataPanel({ sourcesQuery, selectedTil }: CollectedDataPanelProps) {
    const sources = sourcesQuery.data?.sources ?? [];

    const items: CollectedDataItem[] = sources.map((source) => ({
        id: source.scrapId,
        type: toCollectedDataType(source.sourceType),
        title: source.title,
        timeLabel: new Date(source.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
        }),
        excerpt: source.rawContent || source.sourceUrl || '',
        tag: source.category?.categoryName ? `#${source.category.categoryName}` : '',
        imageUrl: source.imageUrl ?? undefined,
        href: source.sourceUrl ?? undefined,
    }));

    return (
        <aside className="flex h-full w-full flex-col overflow-hidden bg-transparent">
            <header className="flex shrink-0 items-center gap-2 border-b border-white/5 p-4 text-sm font-bold uppercase tracking-widest text-primary-signal">
                <Link size={16} />
                SOURCE DATA
            </header>

            <div className="border-b border-white/5 p-4">
                <label className="flex items-center gap-2 rounded-full bg-surface-highest px-4 py-2 transition focus-within:ring-1 focus-within:ring-primary-signal/30">
                    <Search size={16} className="text-text-secondary" />
                    <input
                        type="search"
                        placeholder="검색..."
                        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-text-secondary/60"
                    />
                </label>
            </div>

            <div className="no-scrollbar flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
                {sourcesQuery.isPending && selectedTil && !import.meta.env.DEV && (
                    <div className="py-10 text-center text-sm italic text-text-secondary opacity-50">
                        수집된 데이터를 불러오는 중...
                    </div>
                )}

                {items.map((item) => (
                    <CollectedDataCard key={item.id} item={item} />
                ))}

                {selectedTil && !sourcesQuery.isPending && items.length === 0 && (
                    <div className="py-10 text-center text-sm italic text-text-secondary opacity-50">
                        수집된 데이터가 없습니다.
                    </div>
                )}
            </div>
        </aside>
    );
}

function toCollectedDataType(sourceType: string): CollectedDataItem['type'] {
    if (sourceType === 'LINK') return 'link';
    if (sourceType === 'IMAGE') return 'image';
    return 'text';
}