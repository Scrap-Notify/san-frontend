// packages/shared/src/api/client.ts
// apiclient를 이용한 카드 관련 API 함수 모음이 아니라
// 인자를 받아 인스턴스를 생성하는 함수 형태로 export
// (예: getCardsApi() → cardsApi.getAll() 등)
// 이렇게 하면 apiClient를 직접 import하지 않고도 사용할 수 있음
// 또한, 테스트 시 mock api client를 주입하기도 쉬워짐

import axios from 'axios';

// ----------------------------
// 토큰 제공자 인터페이스
// dashboard/extension에서 각각 구현체를 주입
// ----------------------------
export interface TokenProvider {
  getToken: () => Promise<string | null>;
  clearToken: () => Promise<void>;
}

// ----------------------------
// 팩토리 함수
// baseURL, tokenProvider를 외부에서 주입받아
// 환경(dashboard/extension)에 종속되지 않는 Axios 인스턴스 생성
// ----------------------------
export function createApiClient(baseURL: string, tokenProvider: TokenProvider) {
  const client = axios.create({
    baseURL,
    timeout: 10_000,
    headers: { 'Content-Type': 'application/json' },
  });

  // 요청 인터셉터 — 토큰 주입
  client.interceptors.request.use(
    async (config) => {
      const token = await tokenProvider.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // 응답 인터셉터 — 공통 에러 처리
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        await tokenProvider.clearToken();
        console.warn('[SAN] 인증이 만료되었습니다.');
      }
      return Promise.reject(error);
    }
  );

  return client;
}