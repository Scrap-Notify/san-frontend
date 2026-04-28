// packages/shared/src/hooks/useCards.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApiContext } from '@san/shared';
import type { GetCardsParams } from '../types';

export const cardKeys = {
  all: ['cards'] as const,
  list: (params?: GetCardsParams) => ['cards', 'list', params] as const,
  detail: (id: string) => ['cards', id] as const,
};

// ----------------------------
// 컴포넌트에서 cardsApi 인수 없이 바로 호출 가능
// const { data } = useCards()
// const { data } = useCards({ page: 1, tag: 'react' })
// ----------------------------

export function useCards(params?: GetCardsParams) {
  const { cardsApi } = useApiContext();
  return useQuery({
    queryKey: cardKeys.list(params),
    queryFn: () => cardsApi.getAll(params),
    staleTime: 1000 * 30,
  });
}

export function useCard(cardId: string) {
  const { cardsApi } = useApiContext();
  return useQuery({
    queryKey: cardKeys.detail(cardId),
    queryFn: () => cardsApi.getById(cardId),
    enabled: !!cardId,
  });
}

export function useDeleteCard() {
  const { cardsApi } = useApiContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => cardsApi.delete(cardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: cardKeys.all });
    },
  });
}