// packages/shared/src/api/scraps.ts
import type { AxiosInstance } from 'axios';
import type {
  Scrap,
  CreateScrapRequest,
  CreateScrapResponse,
} from '../types';

// ----------------------------
// apiClient를 인수로 받는 팩토리
// dashboard/extension에서 각자의 client 인스턴스를 주입
// ----------------------------
export function createScrapsApi(apiClient: AxiosInstance) {
  return {
    // POST /scraps
    create: (payload: CreateScrapRequest): Promise<CreateScrapResponse> =>
      apiClient.post<CreateScrapResponse>('/scraps', payload).then((r) => r.data),

    // GET /scraps/:id — ai_status 폴링용
    getById: (scrapId: string): Promise<Scrap> =>
      apiClient.get<Scrap>(`/scraps/${scrapId}`).then((r) => r.data),

    // DELETE /scraps/:id (소프트 딜리트)
    delete: (scrapId: string): Promise<void> =>
      apiClient.delete(`/scraps/${scrapId}`).then(() => undefined),
  };
}

// createScrapsApi 반환 타입 — hooks에서 타입 명시에 활용
export type ScrapsApi = ReturnType<typeof createScrapsApi>;