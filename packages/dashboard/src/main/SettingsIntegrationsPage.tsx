import { GitBranch, LinkIcon, RefreshCw, Trash2, Unlink } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApiErrorMessage, type GithubRepository } from '@san/shared';
import { githubApi } from '../api/client';

const GITHUB_LINK_ERROR_MESSAGE: Record<string, string> = {
  A009: 'GitHub 계정이 연동되어 있지 않습니다.',
  A011: '이미 다른 계정에 연결된 GitHub 계정입니다.',
  A012: 'GitHub 로그인 계정은 연동을 해제할 수 없습니다.',
};

export function SettingsIntegrationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const githubLinked = searchParams.get('githubLinked') === 'true';
  const [connectedRepositories, setConnectedRepositories] = useState<GithubRepository[]>([]);
  const [message, setMessage] = useState<string | null>(
    githubLinked ? 'GitHub account connected' : null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlinking, setIsUnlinking] = useState(false);

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
      navigate('/settings/repositories', { replace: true });
      return;
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
    if (isUnlinking) return;

    setErrorMessage(null);
    setMessage(null);
    setIsUnlinking(true);

    try {
      await githubApi.unlinkAccount();
      setConnectedRepositories([]);
      setMessage('GitHub 연동이 해제되었습니다.');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'GitHub 연동 해제에 실패했습니다.', GITHUB_LINK_ERROR_MESSAGE));
    } finally {
      setIsUnlinking(false);
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
    <section className="w-full min-w-0 space-y-dashboard-gap py-dashboard-gap text-text-primary">
      <header className="grid gap-md sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="min-w-0">
          <p className="text-caption-bold uppercase tracking-wide text-primary-signal">
            Integrations
          </p>
          <h1 className="mt-sm text-h1-bold">GitHub</h1>
          <p className="mt-sm text-body-sm text-text-ghost">{statusText}</p>
        </div>

        <div className="grid gap-sm sm:flex sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={handleLinkGithub}
            className="inline-flex min-h-10 items-center justify-center gap-sm rounded-leaf bg-primary-signal px-md text-body-sm-bold text-background transition hover:glow-neon"
          >
            <LinkIcon size={20} />
            GitHub 연동하기
          </button>
          <button
            type="button"
            onClick={() => navigate('/settings/repositories')}
            className="inline-flex min-h-10 items-center justify-center gap-sm rounded-leaf border border-primary-signal/30 bg-surface-container px-md text-body-sm-bold text-text-primary transition hover:border-primary-signal/60 hover:glow-neon"
          >
            <GitBranch size={20} />
            Choose Repository
          </button>
          <button
            type="button"
            onClick={handleUnlinkGithub}
            disabled={isUnlinking}
            className="inline-flex min-h-10 items-center justify-center gap-sm rounded-leaf border border-text-primary/10 bg-surface-container px-md text-body-sm-bold text-text-secondary transition hover:border-red-300/40 hover:text-red-200 hover:glow-neon"
          >
            <Unlink size={20} />
            {isUnlinking ? '해제 중...' : '연동 해제하기'}
          </button>
        </div>
      </header>

      {message ? (
        <p className="rounded-leaf border border-primary-signal/20 bg-primary-signal/10 px-md py-sm text-body-sm-bold text-primary-signal">
          {message}
        </p>
      ) : null}
      {errorMessage ? (
        <p className="rounded-leaf border border-red-300/20 bg-red-500/10 px-md py-sm text-body-sm-bold text-red-200">
          {errorMessage}
        </p>
      ) : null}

      <div className="rounded-leaf border border-text-secondary/30 bg-surface-low/50 p-lg">
        <div className="mb-lg flex items-center justify-between gap-sm">
          <h2 className="text-body-lg-bold">Connected repositories</h2>
          <button
            type="button"
            onClick={loadConnectedRepositories}
            disabled={isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-leaf border border-text-primary/10 bg-surface-container text-text-secondary transition hover:border-primary-signal/30 hover:text-text-primary hover:glow-neon disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Refresh repositories"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        {connectedRepositories.length > 0 ? (
          <div className="grid gap-sm">
            {connectedRepositories.map((repository) => (
              <article
                key={repository.githubRepositoryId}
                className="grid min-w-0 gap-md rounded-leaf border border-text-primary/5 bg-background/70 p-md sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-leaf bg-misty-teal text-primary-signal">
                    <GitBranch size={20} />
                  </span>
                  <div className="min-w-0">
                    <a
                      href={repository.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-body-sm-bold text-text-primary hover:text-primary-signal"
                    >
                      {repository.fullName}
                    </a>
                    <p className="mt-xs text-caption text-text-ghost">
                      {repository.privateRepository ? 'Private' : 'Public'} / {repository.defaultBranch}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDisconnectRepository(repository.githubRepositoryId)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-leaf border border-text-primary/10 bg-surface-container text-text-secondary transition hover:border-red-300/40 hover:text-red-200 hover:glow-neon sm:justify-self-end"
                  aria-label={`Disconnect ${repository.fullName}`}
                >
                  <Trash2 size={20} />
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-leaf border border-text-primary/5 bg-background/70 px-md py-lg text-body-sm text-text-ghost">
            Connect GitHub and choose repositories to use them in SAN.
          </p>
        )}
      </div>
    </section>
  );
}
