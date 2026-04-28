// packages/shared/src/api/scraps.ts
import { apiClient } from './client';
import type {
  Scrap,
  CreateScrapRequest,
  CreateScrapResponse,
} from '../types';

export const scrapsApi = {
  // POST /scraps
  // Content Script에서 추출한 메타데이터를 백엔드로 전송
  create: (payload: CreateScrapRequest): Promise<CreateScrapResponse> =>
    apiClient.post<CreateScrapResponse>('/scraps', payload).then((r) => r.data),

  // GET /scraps/:id
  // ai_status 폴링용 (PENDING → COMPLETED 확인)
  getById: (scrapId: string): Promise<Scrap> =>
    apiClient.get<Scrap>(`/scraps/${scrapId}`).then((r) => r.data),

  // DELETE /scraps/:id (소프트 딜리트 — is_deleted: true)
  delete: (scrapId: string): Promise<void> =>
    apiClient.delete(`/scraps/${scrapId}`).then(() => undefined),
};