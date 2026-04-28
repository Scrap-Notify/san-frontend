// packages/shared/src/api/client.ts
import axios from 'axios';

// VITE_ENGINE_URL: .env 파일에 정의
// extension: packages/extension/.env
// dashboard: packages/dashboard/.env
const BASE_URL = import.meta.env.VITE_ENGINE_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ----------------------------
// 요청 인터셉터 — 인증 토큰 주입
// 추후 Supabase JWT 연동 시 여기서 처리
// ----------------------------
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('san_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ----------------------------
// 응답 인터셉터 — 공통 에러 처리
// ----------------------------
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 인증 만료 처리 (추후 리다이렉트 or 토큰 갱신)
      localStorage.removeItem('san_token');
      console.warn('[SAN] 인증이 만료되었습니다.');
    }
    return Promise.reject(error);
  }
);