// packages/shared/src/hooks/useCards.ts
import { useQuery } from '@tanstack/react-query';
import { useApiContext } from '@san/shared';
import type { KnowledgeCardListParams } from '../types';

export const cardKeys = {
  all: ['cards'] as const,
  list: (params?: KnowledgeCardListParams) => ['cards', 'list', params ?? {}] as const,
};

// ----------------------------
// 컴포넌트에서 cardsApi 인수 없이 바로 호출 가능
// const { data } = useCards()
// ----------------------------

export function useCards(params?: KnowledgeCardListParams, options?: { enabled?: boolean }) {
  const { cardsApi } = useApiContext();
  return useQuery({
    queryKey: cardKeys.list(params),
    queryFn: () => cardsApi.getAll(params),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 30,
  });
}
