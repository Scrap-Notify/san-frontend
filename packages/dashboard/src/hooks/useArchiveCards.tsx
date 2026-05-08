import {
  toKnowledgeCardView,
  useCards,
  type KnowledgeCardListParams,
  type KnowledgeCardView,
} from '@san/shared';

export interface ArchiveCardsParams {
  limit?: number;
  tag?: string;
  tags?: string[];
  search?: string;
  date?: string;
  from?: string;
  to?: string;
}

const MOCK_CARDS: KnowledgeCardView[] = [
  {
    card_id: '1',
    scrap_id: 's1',
    category_id: 'c1',
    title: 'Memory relationship mapping',
    summary: 'A design note about navigating knowledge as connected nodes instead of a flat chronological list.',
    tags: [
      { tag_id: 't1', name: 'Psychology' },
      { tag_id: 't2', name: 'Cognition' },
    ],
    source_url: 'https://example.com/memory-map',
    source_type: 'LINK',
    ai_status: 'COMPLETED',
    category_name: 'Research',
    created_at: '2024-05-21T10:00:00.000Z',
    updated_at: null,
    is_deleted: false,
  },
  {
    card_id: '2',
    scrap_id: 's2',
    category_id: 'c2',
    title: 'Bioluminescence system',
    summary: 'A visual system inspired by low-light forests, luminous contrast, and calm interface feedback.',
    tags: [
      { tag_id: 't3', name: 'Colors' },
      { tag_id: 't4', name: 'Systems' },
    ],
    source_url: 'https://example.com/bioluminescence',
    source_type: 'LINK',
    ai_status: 'COMPLETED',
    category_name: 'Design',
    created_at: '2024-05-18T10:00:00.000Z',
    updated_at: null,
    is_deleted: false,
  },
  {
    card_id: '3',
    scrap_id: 's3',
    category_id: 'c3',
    title: 'Biophilic UI patterns',
    summary: 'Research notes on applying organic rhythm, rounded geometry, and readable density to product UI.',
    tags: [
      { tag_id: 't5', name: 'Design' },
      { tag_id: 't6', name: 'Research' },
    ],
    source_url: 'https://example.com/biophilic-ui',
    source_type: 'LINK',
    ai_status: 'COMPLETED',
    category_name: 'UX',
    created_at: '2024-05-24T10:00:00.000Z',
    updated_at: null,
    is_deleted: false,
  },
  {
    card_id: '4',
    scrap_id: 's4',
    category_id: 'c4',
    title: 'Neural network trends',
    summary: 'A short overview of model architecture trends, retrieval workflows, and product integration patterns.',
    tags: [
      { tag_id: 't7', name: 'AI' },
      { tag_id: 't8', name: 'Tech' },
    ],
    source_url: 'https://example.com/neural-network-trends',
    source_type: 'LINK',
    ai_status: 'COMPLETED',
    category_name: 'Tech',
    created_at: '2024-05-25T10:00:00.000Z',
    updated_at: null,
    is_deleted: false,
  },
];

interface UseArchiveCardsResult {
  cards: KnowledgeCardView[];
  isPending: boolean;
  isError: boolean;
}

const useMockCards = import.meta.env.VITE_USE_MOCK === 'true';

export function useArchiveCards(params?: ArchiveCardsParams): UseArchiveCardsResult {
  const serverParams = toKnowledgeCardListParams(params);
  const query = useCards(serverParams, { enabled: !useMockCards });

  if (useMockCards) {
    return {
      cards: filterMockCards(MOCK_CARDS, params),
      isPending: false,
      isError: false,
    };
  }

  return {
    cards: filterMockCards(query.data?.cards.map(toKnowledgeCardView) ?? [], {
      ...params,
      limit: params?.search ? params.limit : undefined,
    }),
    isPending: query.isPending,
    isError: query.isError,
  };
}

function toKnowledgeCardListParams(params?: ArchiveCardsParams): KnowledgeCardListParams | undefined {
  if (!params) return undefined;

  const selectedTags = normalizeTags(params.tags ?? (params.tag ? [params.tag] : []));

  return compactParams({
    tag: selectedTags[0],
    fromDate: params.date ?? params.from,
    toDate: params.date ?? params.to,
    limit: params.search ? undefined : params.limit,
  });
}

function compactParams(params: KnowledgeCardListParams): KnowledgeCardListParams | undefined {
  const compacted = Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  ) as KnowledgeCardListParams;

  return Object.keys(compacted).length > 0 ? compacted : undefined;
}

function filterMockCards(cards: KnowledgeCardView[], params?: ArchiveCardsParams) {
  if (!params) return cards;

  const search = params.search?.trim().toLowerCase();
  const selectedTags = normalizeTags(params.tags ?? (params.tag ? [params.tag] : []));

  const filtered = cards.filter((card) => {
    const matchesSearch = search
      ? [card.title, card.summary, card.category_name]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(search))
      : true;

    const cardTags = card.tags.map((tag) => tag.name.toLowerCase());
    const matchesTags =
      selectedTags.length > 0
        ? selectedTags.every((tag) => cardTags.includes(tag.toLowerCase()))
        : true;

    const createdDate = card.created_at.slice(0, 10);
    const matchesDate = params.date ? createdDate === params.date : true;
    const matchesFrom = params.from ? createdDate >= params.from : true;
    const matchesTo = params.to ? createdDate <= params.to : true;

    return matchesSearch && matchesTags && matchesDate && matchesFrom && matchesTo;
  });

  return typeof params.limit === 'number' ? filtered.slice(0, params.limit) : filtered;
}

function normalizeTags(tags: string[]) {
  return tags.flatMap((tag) => tag.split(',')).map((tag) => tag.trim()).filter(Boolean);
}
