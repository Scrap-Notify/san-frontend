// packages/shared/src/hooks/useCards.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cardsApi } from '../api/cards';
import type { GetCardsParams } from '../types';

// 쿼리 키
export const cardKeys = {
  all: ['cards'] as const,
  list: (params?: GetCardsParams) => ['cards', 'list', params] as const,
  detail: (id: string) => ['cards', id] as const,
};

// ----------------------------
// 카드 목록 조회
// 대시보드 리스트 뷰의 핵심 훅
// ----------------------------
export function useCards(params?: GetCardsParams) {
  return useQuery({
    queryKey: cardKeys.list(params),
    queryFn: () => cardsApi.getAll(params),
    staleTime: 1000 * 30, // 30초 동안 캐시 유지
  });
}

// ----------------------------
// 카드 단건 조회
// 카드 상세 페이지용
// ----------------------------
export function useCard(cardId: string) {
  return useQuery({
    queryKey: cardKeys.detail(cardId),
    queryFn: () => cardsApi.getById(cardId),
    enabled: !!cardId,
  });
}

// ----------------------------
// 카드 삭제
// ----------------------------
export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) => cardsApi.delete(cardId),
    onSuccess: () => {
      // 목록 전체 캐시 무효화
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
    },
  });
}