// packages/shared/src/api/cards.ts
import { apiClient } from './client';
import type {
  KnowledgeCardView,
  GetCardsResponse,
  GetCardsParams,
} from '../types';

export const cardsApi = {
  // GET /cards?page=1&limit=20&category_id=...&tag=...&search=...
  // 대시보드 리스트 뷰용
  getAll: (params?: GetCardsParams): Promise<GetCardsResponse> =>
    apiClient.get<GetCardsResponse>('/cards', { params }).then((r) => r.data),

  // GET /cards/:id
  // 카드 상세 뷰용
  getById: (cardId: string): Promise<KnowledgeCardView> =>
    apiClient.get<KnowledgeCardView>(`/cards/${cardId}`).then((r) => r.data),

  // DELETE /cards/:id (소프트 딜리트)
  delete: (cardId: string): Promise<void> =>
    apiClient.delete(`/cards/${cardId}`).then(() => undefined),
};