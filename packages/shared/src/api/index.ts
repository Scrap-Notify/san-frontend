// packages/shared/src/api/index.ts
export { createApiClient, getApiErrorMessage, unwrapApiResponse } from './client';
export type { ApiResponse, AuthTokens, TokenProvider, TokenResponse } from './client';
export { createAuthApi } from './auth';
export type {
  AuthApi,
  LoginRequest,
  ReissueRequest,
  SignupRequest,
  SignupResponse,
} from './auth';
export { createScrapsApi } from './scraps';
export type { ScrapsApi } from './scraps';
export { createCardsApi } from './cards';
export type { CardsApi } from './cards';
