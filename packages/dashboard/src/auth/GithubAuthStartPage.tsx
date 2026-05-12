import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { githubAuthApi } from '../api/client';
import { getAuthClientType, rememberAuthClientType } from './clientType';

export function GithubAuthStartPage() {
  const [searchParams] = useSearchParams();
  const clientType = getAuthClientType(searchParams);

  useEffect(() => {
    rememberAuthClientType(clientType);
    window.location.replace(githubAuthApi.getGithubAuthorizeUrl(clientType));
  }, [clientType]);

  return (
    <main className="auth-shell grid min-h-screen w-full place-items-center bg-background px-lg text-text-primary">
      <p className="text-sm font-medium text-text-secondary">GitHub 로그인으로 이동 중...</p>
    </main>
  );
}
