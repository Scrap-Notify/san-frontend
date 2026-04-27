// 엔진 API 호출 공통 클라이언트

const BASE_URL = import.meta.env.VITE_ENGINE_URL ?? 'http://localhost:8000';

export async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res.json();
}