// 로그인 성공 후 토큰 처리 분기 파일
// - dashboard localStorage 구현을 직접 알아야 함
// - extension 진입 로그인은 syncExtensionAuth로 extension에 토큰을 저장함
// - dashboard 로그인은 bridge ticket으로 extension 세션을 별도 발급함
// - extension 진입 로그인일 때 dashboard 저장소를 비우는 화면별 정책을 담고 있음
import type { AuthTokens, ClientType } from '@san/shared';
import { authApi } from '@dashboard/api/client';
import { syncExtensionAuth, syncExtensionBridgeTicket } from '@dashboard/api/extensionAuth';
import { authTokenStorage } from '@dashboard/api/tokenStorage';

export async function completeAuth(tokens: AuthTokens, clientType: ClientType, username?: string) {
  const scopedTokens = { ...tokens, clientType };

  if (clientType === 'EXTENSION') {
    const previousDashboardAuth = await readStoredDashboardAuth();

    await syncExtensionAuth(scopedTokens);
    await authTokenStorage.setTokens(scopedTokens);

    try {
      const { ticket } = await authApi.createDashboardBridgeTicket();
      const dashboardTokens = await authApi.exchangeDashboardBridgeToken({ ticket });
      await authTokenStorage.setTokens({ ...dashboardTokens, clientType: 'DASHBOARD' });
      if (username) {
        await authTokenStorage.setUsername(username);
      }
    } catch (error) {
      console.warn('[SAN:auth] dashboard bridge login after extension login failed', error);
      if (previousDashboardAuth) {
        await authTokenStorage.setTokens(previousDashboardAuth.tokens);
        if (previousDashboardAuth.username) {
          await authTokenStorage.setUsername(previousDashboardAuth.username);
        }
      } else if (username) {
        await authTokenStorage.setUsername(username);
      }
    }
    return;
  }

  await authTokenStorage.setTokens(scopedTokens);
  if (username) {
    await authTokenStorage.setUsername(username);
  }

  void syncDashboardBridgeAuth();
}

async function syncDashboardBridgeAuth() {
  try {
    const { ticket } = await authApi.createBridgeTicket();
    await syncExtensionBridgeTicket(ticket);
  } catch (error) {
    console.info('[SAN:extension-auth] dashboard login extension bridge skipped', error);
  }
}

async function readStoredDashboardAuth(): Promise<{ tokens: AuthTokens; username: string | null } | null> {
  const [accessToken, refreshToken, sessionId, clientType, expiresAt, username] = await Promise.all([
    authTokenStorage.getToken(),
    authTokenStorage.getRefreshToken(),
    authTokenStorage.getSessionId(),
    authTokenStorage.getClientType(),
    authTokenStorage.getAccessTokenExpiresAt(),
    authTokenStorage.getUsername(),
  ]);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    tokens: {
      accessToken,
      refreshToken,
      sessionId: sessionId ?? undefined,
      clientType: clientType ?? 'DASHBOARD',
      expiresIn: expiresAt ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000)) : undefined,
    },
    username,
  };
}
