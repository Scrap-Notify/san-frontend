import type { ClientType } from '@san/shared';

export const AUTH_CLIENT_TYPE_PARAM = 'clientType';
export const DEFAULT_AUTH_CLIENT_TYPE: ClientType = 'DASHBOARD';

export function getAuthClientType(searchParams: URLSearchParams): ClientType {
  return searchParams.get(AUTH_CLIENT_TYPE_PARAM) === 'EXTENSION' ? 'EXTENSION' : DEFAULT_AUTH_CLIENT_TYPE;
}

export function withAuthClientType(path: string, clientType: ClientType): string {
  if (clientType === DEFAULT_AUTH_CLIENT_TYPE) {
    return path;
  }

  return `${path}?${AUTH_CLIENT_TYPE_PARAM}=${clientType}`;
}
