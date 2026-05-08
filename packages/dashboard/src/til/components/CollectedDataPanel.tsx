import type { TilResponse } from '@san/shared';
import type { TilSourcesQuery } from '../types';
import { getMockTilSources, isMockTilSummaryId } from '../tilMocks';
import { CollectedDataCard, type CollectedDataItem } from './CollectedDataCard';

interface CollectedDataPanelProps {
    sourcesQuery: TilSourcesQuery;
    selectedTil: TilResponse | null;
}

export function CollectedDataPanel({ sourcesQuery, selectedTil }: CollectedDataPanelProps) {
    const sources =
        sourcesQuery.data?.sources ??
        (isMockTilSummaryId(selectedTil?.summaryId) ? getMockTilSources().sources : []);

    const items: CollectedDataItem[] = sources.map((source) => ({
        id: source.scrapId,
        type: toCollectedDataType(source.sourceType),
        title: source.title,
        timeLabel: new Date(source.createdAt).toLocaleDateString(),
        excerpt: source.rawContent || source.sourceUrl || '',
        tag: source.category?.categoryName,
        imageUrl: source.imageUrl ?? undefined,
        href: source.sourceUrl ?? undefined,
    }));

    return (
        <aside className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[8px] bg-background/80 shadow-neon-sm backdrop-blur-xl">
            <header className="shrink-0 border-b border-text-secondary/20 p-lg">
                <h2 className="text-h1-bold uppercase leading-none text-text-primary">
                    내가 수집한 데이터
                </h2>
            </header>

            <div className="flex min-h-0 flex-1 flex-col gap-md overflow-y-auto p-lg">
                {sourcesQuery.isPending && selectedTil && (
                    <div className="text-center text-body-main text-text-secondary">
                        로딩 중...
                    </div>
                )}

                {!selectedTil && (
                    <div className="text-center text-body-main text-text-secondary">
                        TIL을 선택해주세요
                    </div>
                )}

                {selectedTil && !sourcesQuery.isPending && items.length === 0 && (
                    <div className="text-center text-body-main text-text-secondary">
                        수집된 데이터가 없습니다
                    </div>
                )}

                {items.map((item) => (
                    <CollectedDataCard key={item.id} item={item} />
                ))}
            </div>
        </aside>
    );
}

function toCollectedDataType(sourceType: string): CollectedDataItem['type'] {
    if (sourceType === 'LINK') return 'link';
    if (sourceType === 'IMAGE') return 'image';
    return 'text';
}