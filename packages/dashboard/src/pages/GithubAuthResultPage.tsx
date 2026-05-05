import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { getApiErrorMessage } from '@san/shared';
import { authApi, authTokenStorage } from '../api/client';

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
      navigate('/settings', { replace: true });
      return;
    }

    if (error) {
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
      ? authApi.exchangeGithubToken({ ticket })
      : authApi.loginWithGithubCode({ code: code as string });

    tokenRequest
      .then(async (tokens) => {
        if (ignore) return;
        await authTokenStorage.setTokens(tokens);
        navigate('/', { replace: true });
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
    <main className="auth-shell flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#101417] px-6 text-[#fbfffa]">
      <section className="w-full max-w-md rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg border border-[#3a4a43]/20 bg-[#181c1f]/50 p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <p className="text-xs font-bold uppercase tracking-widest text-[#00ffc2]">
          GitHub Auth
        </p>
        <h1 className="mt-3 text-2xl font-black">Authentication</h1>
        <p className="mt-4 text-sm font-medium leading-6 text-[#b9cbc1]">{message}</p>
        <Link
          to="/login"
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-[#00ffc2] px-5 text-sm font-bold text-[#101417]"
        >
          Back to login
        </Link>
      </section>
    </main>
  );
}
