// packages/shared/src/hooks/useScraps.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { scrapsApi } from '../api/scraps';
import type { CreateScrapRequest } from '../types';

// 쿼리 키 — 캐시 무효화 시 일관된 키 사용을 위해 상수로 관리
export const scrapKeys = {
  all: ['scraps'] as const,
  detail: (id: string) => ['scraps', id] as const,
};

// ----------------------------
// 단일 스크랩 조회 (ai_status 폴링용)
// refetchInterval: PENDING/PROCESSING 상태일 때 2초마다 재조회
// ----------------------------
export function useScrap(scrapId: string) {
  return useQuery({
    queryKey: scrapKeys.detail(scrapId),
    queryFn: () => scrapsApi.getById(scrapId),
    refetchInterval: (query) => {
      const status = query.state.data?.ai_status;
      if (status === 'PENDING' || status === 'PROCESSING') return 2_000;
      return false; // COMPLETED/FAILED이면 폴링 중단
    },
    enabled: !!scrapId,
  });
}

// ----------------------------
// 스크랩 생성 뮤테이션
// 성공 시 cards 쿼리 캐시 무효화 → 대시보드 자동 갱신
// ----------------------------
export function useCreateScrap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateScrapRequest) => scrapsApi.create(payload),
    onSuccess: () => {
      // cards 목록 캐시 무효화: 새 카드가 생성됐을 수 있으므로
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

// ----------------------------
// 스크랩 삭제 뮤테이션
// ----------------------------
export function useDeleteScrap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scrapId: string) => scrapsApi.delete(scrapId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}