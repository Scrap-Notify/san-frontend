// 로그인 성공 후 토큰 처리 분기 파일
// - dashboard localStorage 구현을 직접 알아야 함
// - dashboard에서 extension으로 토큰을 sync하는 syncExtensionAuth를 사용함
// - extension 진입 로그인일 때 dashboard 저장소를 비우는 화면별 정책을 담고 있음
import type { AuthTokens, ClientType } from '@san/shared';
import { syncExtensionAuth } from '@dashboard/api/extensionAuth';
import { authTokenStorage } from '@dashboard/api/tokenStorage';

export async function completeAuth(tokens: AuthTokens, clientType: ClientType, username?: string) {
  const scopedTokens = { ...tokens, clientType };

  if (clientType === 'EXTENSION') {
    await syncExtensionAuth(scopedTokens);
    await authTokenStorage.clearToken();
    return;
  }

  await authTokenStorage.setTokens(scopedTokens);
  if (username) {
    await authTokenStorage.setUsername(username);
  }
}
