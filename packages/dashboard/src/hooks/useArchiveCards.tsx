// packages/dashboard/src/hooks/useArchiveCards.ts
// Archive 섹션 카드 데이터 조회 훅
// VITE_USE_MOCK=true  → Mock 데이터 반환
// VITE_USE_MOCK=false → useCards() API 호출

import { useCards } from '@san/shared';
import type { KnowledgeCardView } from '@san/shared';

// ── Mock 데이터 ──
// ArchiveSection에서 이 파일로 이동
// 백엔드 연결 후 이 파일만 수정하면 됨
const MOCK_CARDS: KnowledgeCardView[] = [
  {
    card_id: '1',
    scrap_id: 's1',
    category_id: 'c1',
    title: '기억의 시각적 위계 설정',
    summary: '우리의 뇌는 정보를 선형으로 저장하지 않는다. 비선형적 지식 구조를 효과적으로 탐색할 수 있는 노드 시스템의...',
    tags: [{ tag_id: 't1', name: 'Psychology' }, { tag_id: 't2', name: 'Cognition' }],
    source_url: 'https://example.com/1',
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
    title: 'Bioluminescence 시스템 고안',
    summary: '깊은 숲속의 어둠 속에서 빛나는 생물체들로부터 영감을 받은 컬러 스킴 정의. 명도 대비가 아닌 채도 대비를 활용한...',
    tags: [{ tag_id: 't3', name: 'Colors' }, { tag_id: 't4', name: 'Systems' }],
    source_url: 'https://example.com/2',
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
    title: '바이오필릭 디자인과 UI의 결합',
    summary: '자연의 곡선과 색채를 디지털 환경에 이식하는 방법에 대한 연구. 특히 빛의 강도를 조절하여 사용자 경험을...',
    tags: [{ tag_id: 't5', name: 'Design' }, { tag_id: 't6', name: 'Research' }],
    source_url: 'https://example.com/3',
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
    category_id: 'c1',
    title: 'AI Neural Network 최신 동향',
    summary: 'Transformer 아키텍처의 발전과 멀티모달 학습의 융합. GPT-4o 이후 등장한 새로운 패러다임에 대한 분석...',
    tags: [{ tag_id: 't7', name: 'AI' }, { tag_id: 't8', name: 'Tech' }],
    source_url: 'https://example.com/4',
    source_type: 'LINK',
    ai_status: 'PENDING',
    category_name: 'Tech',
    created_at: '2024-05-25T10:00:00.000Z',
    updated_at: null,
    is_deleted: false,
  },
];

// ── 훅 반환 타입 — useCards와 동일한 shape 유지 ──
interface UseArchiveCardsResult {
  cards: KnowledgeCardView[];
  isPending: boolean;
  isError: boolean;
}

export function useArchiveCards(): UseArchiveCardsResult {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const query = useCards();

  // Mock 모드: 실제 API 호출 없이 Mock 데이터 반환
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    return {
      cards: MOCK_CARDS,
      isPending: false,
      isError: false,
    };
  }

  // 실제 API 모드: useCards 결과 그대로 반환
  return {
    cards: query.data?.cards ?? [],
    isPending: query.isPending,
    isError: query.isError,
  };
}