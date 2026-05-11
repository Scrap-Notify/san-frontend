// packages/shared/src/api/index.ts
export { createApiClient, getApiErrorMessage, unwrapApiResponse } from './client';
export type { ApiResponse, AuthTokens, TokenProvider, TokenResponse } from './client';
export { createAuthApi } from './auth';
export type {
  AuthApi,
  ClientType,
  GithubLoginRequest,
  GithubTokenExchangeRequest,
  LoginRequest,
  ReissueRequest,
  SignupRequest,
  SignupResponse,
  WithdrawRequest,
} from './auth';
export { createGithubApi } from './github';
export type {
  GithubApi,
  GithubRepository,
  GithubRepositoryConnectRequest,
} from './github';
export { createScrapsApi } from './scraps';
export type { ScrapsApi } from './scraps';
export { createCardsApi } from './cards';
export type { CardsApi } from './cards';
export { createSearchApi } from './search';
export type { SearchApi } from './search';
export { createAsyncJobsApi } from './async';
export type { AsyncJobsApi } from './async';
export { createTilApi } from './til';
export type { TilApi } from './til';
