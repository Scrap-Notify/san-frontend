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

/*
const MOCK_CARDS: KnowledgeCardView[] = [
  {
    card_id: '1',
    scrap_id: 's1',
    category_id: 'c1',
    title: 'React Hooks 마스터: 유연한 상태 관리 기법',
    summary: 'useEffect와 useMemo를 활용한 최적화 전략 및 커스텀 훅 설계 방식에 대한 심층 분석 리포트입니다.',
    tags: [
      { tag_id: 't1', name: 'React' },
    ],
    source_url: 'https://example.com/react',
    source_type: 'LINK',
    ai_status: 'COMPLETED',
    category_name: '기술',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    is_deleted: false,
  },
  {
    card_id: '2',
    scrap_id: 's2',
    category_id: 'c2',
    title: '지속 가능한 생체 모방 UI 전략',
    summary: '바이오필릭 디자인 패턴을 시스템에 적용하여 사용자 경험을 향상시키는 방법에 대한 연구입니다.',
    tags: [
      { tag_id: 't2', name: 'UX' },
    ],
    source_url: 'https://example.com/ux',
    source_type: 'LINK',
    ai_status: 'COMPLETED',
    category_name: '에코',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    is_deleted: false,
  },
  {
    card_id: '3',
    scrap_id: 's3',
    category_id: 'c3',
    title: 'React 상태 관리',
    summary: 'React에서 상태를 관리하는 방법에 대한 요약입니다.',
    tags: [
      { tag_id: 't3', name: 'React' },
    ],
    source_url: 'https://example.com/state',
    source_type: 'LINK',
    ai_status: 'COMPLETED',
    category_name: 'Frontend',
    created_at: '2026-05-05T14:30:00Z',
    updated_at: null,
    is_deleted: false,
  },
  {
    card_id: '4',
    scrap_id: 's4',
    category_id: 'c4',
    title: 'Spring Boot와 JPA 연동 기초',
    summary: '엔티티 매핑, 영속성 컨텍스트, 그리고 기본적인 쿼리 작성 방법에 대한 정리 노트입니다.',
    tags: [
      { tag_id: 't4', name: 'Spring' },
    ],
    source_url: 'https://example.com/spring',
    source_type: 'LINK',
    ai_status: 'COMPLETED',
    category_name: 'Backend',
    created_at: '2026-05-04T10:00:00Z',
    updated_at: null,
    is_deleted: false,
  },
  {
    card_id: '5',
    scrap_id: 's5',
    category_id: 'c5',
    title: 'TypeScript 고급 타입 활용',
    summary: '제네릭, 유틸리티 타입, 맵드 타입 등을 활용하여 안정적인 프론트엔드 환경을 구축하는 방법.',
    tags: [
      { tag_id: 't5', name: 'TypeScript' },
    ],
    source_url: 'https://example.com/ts',
    source_type: 'LINK',
    ai_status: 'COMPLETED',
    category_name: 'Frontend',
    created_at: '2026-05-01T08:00:00Z',
    updated_at: null,
    is_deleted: false,
  },
  {
    card_id: '6',
    scrap_id: 's6',
    category_id: 'c6',
    title: '디자인 시스템의 컴포넌트화',
    summary: '일관성 있는 UI를 구축하기 위해 토큰부터 패턴까지 설계하는 방법론입니다.',
    tags: [
      { tag_id: 't6', name: 'Design' },
    ],
    source_url: 'https://example.com/design',
    source_type: 'LINK',
    ai_status: 'COMPLETED',
    category_name: 'UX',
    created_at: '2026-04-28T09:00:00Z',
    updated_at: null,
    is_deleted: false,
  },
  {
    card_id: '7',
    scrap_id: 's7',
    category_id: 'c7',
    title: '마이크로서비스 아키텍처 개론',
    summary: '모놀리틱 아키텍처에서 MSA로 넘어갈 때 고려해야 할 통신 방식 및 데이터 일관성에 대한 내용.',
    tags: [
      { tag_id: 't7', name: 'Architecture' },
    ],
    source_url: 'https://example.com/msa',
    source_type: 'LINK',
    ai_status: 'COMPLETED',
    category_name: 'Backend',
    created_at: '2026-04-25T11:20:00Z',
    updated_at: null,
    is_deleted: false,
  },
  {
    card_id: '8',
    scrap_id: 's8',
    category_id: 'c8',
    title: 'Vite 기반의 프론트엔드 빌드 최적화',
    summary: 'Esbuild와 Rollup을 활용하여 개발 속도 및 프로덕션 번들링 성능을 높이는 팁 모음입니다.',
    tags: [
      { tag_id: 't8', name: 'BuildTool' },
    ],
    source_url: 'https://example.com/vite',
    source_type: 'LINK',
    ai_status: 'COMPLETED',
    category_name: 'Frontend',
    created_at: '2026-04-20T16:45:00Z',
    updated_at: null,
    is_deleted: false,
  },
  {
    card_id: '9',
    scrap_id: 's9',
    category_id: 'c9',
    title: '데이터베이스 인덱스 심화',
    summary: 'B-Tree 구조 이해 및 복합 인덱스 설계 시 고려해야 할 카디널리티와 정렬 기준 분석.',
    tags: [
      { tag_id: 't9', name: 'Database' },
    ],
    source_url: 'https://example.com/db',
    source_type: 'LINK',
    ai_status: 'COMPLETED',
    category_name: 'Backend',
    created_at: '2026-04-15T13:10:00Z',
    updated_at: null,
    is_deleted: false,
  },
  {
    card_id: '10',
    scrap_id: 's10',
    category_id: 'c10',
    title: 'CSS Grid Layout 마스터하기',
    summary: 'Flexbox로 해결하기 어려운 2차원 레이아웃을 Grid 영역과 템플릿을 통해 쉽게 구현하는 방법.',
    tags: [
      { tag_id: 't10', name: 'CSS' },
    ],
    source_url: 'https://example.com/css',
    source_type: 'LINK',
    ai_status: 'COMPLETED',
    category_name: '디자인',
    created_at: '2026-04-10T10:30:00Z',
    updated_at: null,
    is_deleted: false,
  },
];
*/

interface UseArchiveCardsResult {
  cards: KnowledgeCardView[];
  isPending: boolean;
  isError: boolean;
}

// const useMockCards = true; // Mock data toggle kept for local UI checks.

export function useArchiveCards(params?: ArchiveCardsParams): UseArchiveCardsResult {
  const serverParams = toKnowledgeCardListParams(params);
  const query = useCards(serverParams);

  /*
  const useMockCards = true;
  if (useMockCards) {
    return {
      cards: filterArchiveCards(MOCK_CARDS, params),
      isPending: false,
      isError: false,
    };
  }
  */

  return {
    cards: filterArchiveCards(query.data?.cards.map(toKnowledgeCardView) ?? [], {
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

function filterArchiveCards(cards: KnowledgeCardView[], params?: ArchiveCardsParams) {
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
