import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getApiErrorMessage } from '@san/shared';
import { authTokenStorage, githubAuthApi } from '../api/client';
import { syncExtensionAuth } from '../api/extensionAuth';

const GITHUB_AUTH_ERROR_MESSAGE: Record<string, string> = {
  A008: 'GitHub authentication failed. Please try again.',
  C003: 'Authentication is required. Please log in again.',
};

export function GithubAuthResultPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [exchangeErrorMessage, setExchangeErrorMessage] = useState<string | null>(null);
  const processedAuthKeyRef = useRef<string | null>(null);

  const ticket = searchParams.get('ticket');
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const githubLinked = searchParams.get('githubLinked');

  const message = exchangeErrorMessage
    ?? (githubLinked === 'true'
      ? 'GitHub account connected'
      : error
        ? (GITHUB_AUTH_ERROR_MESSAGE[error] ?? `GitHub authentication failed (${error})`)
        : !ticket && !code
          ? 'GitHub authentication ticket is missing'
          : 'Connecting GitHub account...');

  useEffect(() => {
    if (githubLinked === 'true') {
      navigate('/settings/repositories', { replace: true });
      return;
    }

    if (error) {
      navigate('/login', {
        replace: true,
        state: { authError: GITHUB_AUTH_ERROR_MESSAGE[error] ?? `GitHub authentication failed (${error})` },
      });
      return;
    }

    if (!ticket && !code) {
      return;
    }

    const authKey = ticket ? `ticket:${ticket}` : `code:${code}`;
    if (processedAuthKeyRef.current === authKey) {
      return;
    }
    processedAuthKeyRef.current = authKey;

    let ignore = false;

    const tokenRequest = ticket
      ? githubAuthApi.exchangeGithubToken({ ticket })
      : githubAuthApi.loginWithGithubCode({ code: code as string });

    tokenRequest
      .then(async (tokens) => {
        if (ignore) return;
        await authTokenStorage.setTokens(tokens);
        await syncExtensionAuth(tokens);
        navigate('/settings/repositories', { replace: true });
      })
      .catch((exchangeError) => {
        if (ignore) return;
        setExchangeErrorMessage(getApiErrorMessage(exchangeError, 'GitHub authentication failed'));
      });

    return () => {
      ignore = true;
    };
  }, [code, error, githubLinked, navigate, ticket]);

  return (
    <main className="auth-shell grid min-h-screen w-full place-items-center overflow-x-hidden bg-background px-lg text-text-primary">
      <section className="grid w-full max-w-md gap-sm rounded-leaf border border-text-secondary/20 bg-surface-low/50 p-xl text-center shadow-neon-sm backdrop-blur-xl">
        <p className="text-caption-bold uppercase tracking-wide text-primary-signal">
          GitHub Auth
        </p>
        <h1 className="text-h2-bold">Authentication</h1>
        <p className="text-body-sm text-text-secondary">{message}</p>
        <Link
          to="/login"
          className="mt-lg inline-flex min-h-11 items-center justify-center rounded-leaf bg-primary-signal px-lg text-body-sm-bold text-background transition hover:glow-neon"
        >
          Back to login
        </Link>
      </section>
    </main>
  );
}
