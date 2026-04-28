// packages/shared/src/api/cards.ts
import type { AxiosInstance } from 'axios';
import type {
  KnowledgeCardView,
  GetCardsResponse,
  GetCardsParams,
} from '../types';

export function createCardsApi(apiClient: AxiosInstance) {
  return {
    // GET /cards?page=1&limit=20&...
    getAll: (params?: GetCardsParams): Promise<GetCardsResponse> =>
      apiClient.get<GetCardsResponse>('/cards', { params }).then((r) => r.data),

    // GET /cards/:id
    getById: (cardId: string): Promise<KnowledgeCardView> =>
      apiClient.get<KnowledgeCardView>(`/cards/${cardId}`).then((r) => r.data),

    // DELETE /cards/:id (소프트 딜리트)
    delete: (cardId: string): Promise<void> =>
      apiClient.delete(`/cards/${cardId}`).then(() => undefined),
  };
}

export type CardsApi = ReturnType<typeof createCardsApi>;