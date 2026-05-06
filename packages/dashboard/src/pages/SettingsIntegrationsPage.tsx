// 깃허브 연동
import { GitBranch, LinkIcon, RefreshCw, Trash2, Unlink } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getApiErrorMessage, type GithubRepository } from '@san/shared';
import { githubApi } from '../api/client';

export function SettingsIntegrationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const githubLinked = searchParams.get('githubLinked') === 'true';
  const [connectedRepositories, setConnectedRepositories] = useState<GithubRepository[]>([]);
  const [message, setMessage] = useState<string | null>(
    githubLinked ? 'GitHub account connected' : null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const statusText = useMemo(() => {
    if (connectedRepositories.length > 0) {
      return `${connectedRepositories.length} repositories connected`;
    }
    return 'No repositories connected';
  }, [connectedRepositories.length]);

  const loadConnectedRepositories = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      setConnectedRepositories(await githubApi.getConnectedRepositories());
    } catch (error) {
      setConnectedRepositories([]);
      setErrorMessage(getApiErrorMessage(error, 'Failed to load connected repositories'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (githubLinked) {
      setSearchParams({}, { replace: true });
    }

    let ignore = false;
    githubApi.getConnectedRepositories()
      .then((repositories) => {
        if (ignore) return;
        setConnectedRepositories(repositories);
      })
      .catch((error) => {
        if (ignore) return;
        setConnectedRepositories([]);
        setErrorMessage(getApiErrorMessage(error, 'Failed to load connected repositories'));
      })
      .finally(() => {
        if (ignore) return;
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLinkGithub = () => {
    window.location.href = githubApi.getLinkAuthorizeUrl();
  };

  const handleUnlinkGithub = async () => {
    setErrorMessage(null);
    setMessage(null);

    try {
      await githubApi.unlinkAccount();
      setConnectedRepositories([]);
      setMessage('GitHub account disconnected');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Failed to disconnect GitHub account'));
    }
  };

  const handleDisconnectRepository = async (repositoryId: number) => {
    setErrorMessage(null);
    setMessage(null);

    try {
      await githubApi.disconnectRepository(repositoryId);
      await loadConnectedRepositories();
      setMessage('Repository disconnected');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Failed to disconnect repository'));
    }
  };

  return (
    <section className="w-full min-w-0 space-y-6 py-[clamp(2rem,5vw,3.5rem)] text-[#fbfffa]">
      <header className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#00ffc2]">
            Integrations
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">GitHub</h1>
          <p className="mt-2 text-sm leading-6 text-[#83958c]">{statusText}</p>
        </div>

        <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={handleLinkGithub}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#00ffc2] px-4 text-sm font-bold text-[#101417] transition hover:bg-[#1affcb]"
          >
            <LinkIcon className="h-4 w-4" />
            Connect GitHub
          </button>
          <button
            type="button"
            onClick={handleUnlinkGithub}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/10 bg-[#1b2023] px-4 text-sm font-bold text-[#b9cbc1] transition hover:border-red-300/40 hover:text-red-200"
          >
            <Unlink className="h-4 w-4" />
            Disconnect
          </button>
        </div>
      </header>

      {message ? (
        <p className="rounded-2xl border border-[#00ffc2]/20 bg-[#00ffc2]/10 px-4 py-3 text-sm font-semibold text-[#00ffc2]">
          {message}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200">
          {errorMessage}
        </p>
      ) : null}

      <div className="rounded-3xl border border-[#3a4a43]/30 bg-[#181c1f]/50 p-[clamp(1.25rem,3vw,2rem)]">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-black">Connected repositories</h2>
          <button
            type="button"
            onClick={loadConnectedRepositories}
            disabled={isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#1b2023] text-[#b9cbc1] transition hover:border-[#00ffc2]/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Refresh repositories"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {connectedRepositories.length > 0 ? (
          <div className="grid gap-3">
            {connectedRepositories.map((repository) => (
              <article
                key={repository.githubRepositoryId}
                className="grid min-w-0 gap-4 rounded-2xl border border-white/5 bg-[#101417]/70 p-4 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e5056] text-[#00ffc2]">
                    <GitBranch className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <a
                      href={repository.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-sm font-black text-[#fbfffa] hover:text-[#00ffc2]"
                    >
                      {repository.fullName}
                    </a>
                    <p className="mt-1 text-xs font-medium text-[#83958c]">
                      {repository.privateRepository ? 'Private' : 'Public'} · {repository.defaultBranch}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDisconnectRepository(repository.githubRepositoryId)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#1b2023] text-[#b9cbc1] transition hover:border-red-300/40 hover:text-red-200 sm:justify-self-end"
                  aria-label={`Disconnect ${repository.fullName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-white/5 bg-[#101417]/70 px-4 py-5 text-sm font-medium text-[#83958c]">
            Connect GitHub and choose repositories to use them in SAN.
          </p>
        )}
      </div>
    </section>
  );
}
