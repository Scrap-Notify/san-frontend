// packages/shared/src/hooks/useCards.ts
import { useQuery } from '@tanstack/react-query';
import { useApiContext } from '@san/shared';

export const cardKeys = {
  all: ['cards'] as const,
  list: () => ['cards', 'list'] as const,
};

// ----------------------------
// 컴포넌트에서 cardsApi 인수 없이 바로 호출 가능
// const { data } = useCards()
// ----------------------------

export function useCards(options?: { enabled?: boolean }) {
  const { cardsApi } = useApiContext();
  return useQuery({
    queryKey: cardKeys.list(),
    queryFn: () => cardsApi.getAll(),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 30,
  });
}
