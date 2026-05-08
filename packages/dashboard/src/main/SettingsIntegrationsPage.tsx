import { CheckCircle2, GitBranch, LinkIcon, RefreshCw, Trash2, Unlink } from 'lucide-react';
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
  const [isGithubLinked, setIsGithubLinked] = useState(githubLinked);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);

  const statusText = useMemo(() => {
    if (!isGithubLinked) return 'SAN에서 사용할 레포지토리를 가져오려면 GitHub 계정을 연동해주세요.';
    if (connectedRepositories.length > 0) {
      return `${connectedRepositories.length}개의 레포지토리가 SAN에 연결되어 있습니다.`;
    }
    return 'GitHub 계정이 연동되었습니다. 사용할 레포지토리를 선택해주세요.';
  }, [connectedRepositories.length, isGithubLinked]);

  const loadConnectedRepositories = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const repositories = await githubApi.getConnectedRepositories();
      setConnectedRepositories(repositories);
      setIsGithubLinked(true);
    } catch (error) {
      setConnectedRepositories([]);
      setIsGithubLinked(false);
      setErrorMessage(getApiErrorMessage(error, '연결된 레포지토리를 불러오지 못했습니다.', GITHUB_LINK_ERROR_MESSAGE));
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
        setIsGithubLinked(true);
      })
      .catch((error) => {
        if (ignore) return;
        setConnectedRepositories([]);
        setIsGithubLinked(false);
        setErrorMessage(getApiErrorMessage(error, '연결된 레포지토리를 불러오지 못했습니다.', GITHUB_LINK_ERROR_MESSAGE));
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

  const handleLinkGithub = async () => {
    if (isLinking) return;

    setErrorMessage(null);
    setMessage(null);
    setIsLinking(true);

    try {
      window.location.href = await githubApi.getLinkAuthorizeUrl();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'GitHub 연동을 시작하지 못했습니다.', GITHUB_LINK_ERROR_MESSAGE));
      setIsLinking(false);
    }
  };

  const handleChooseRepository = () => {
    if (!isGithubLinked) {
      setMessage(null);
      setErrorMessage('먼저 GitHub 계정을 연동해주세요.');
      return;
    }

    navigate('/settings/repositories');
  };

  const handleUnlinkGithub = async () => {
    if (isUnlinking) return;

    const confirmed = window.confirm('GitHub 연동을 해제할까요? 연결된 레포지토리도 더 이상 SAN에서 사용할 수 없습니다.');
    if (!confirmed) return;

    setErrorMessage(null);
    setMessage(null);
    setIsUnlinking(true);

    try {
      await githubApi.unlinkAccount();
      setConnectedRepositories([]);
      setIsGithubLinked(false);
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
      setMessage('레포지토리 연결이 해제되었습니다.');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '레포지토리 연결 해제에 실패했습니다.'));
    }
  };

  return (
    <section className="w-full min-w-0 space-y-dashboard-gap py-dashboard-gap text-text-primary">
      <header className="grid gap-md rounded-leaf border border-text-secondary/20 bg-surface-low/45 p-lg shadow-neon-sm backdrop-blur-xl lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <p className="text-caption-bold uppercase tracking-wide text-primary-signal">
            Integrations
          </p>
          <div className="mt-sm flex flex-wrap items-center gap-sm">
            <h1 className="text-h1-bold">GitHub</h1>
            <span
              className={[
                'inline-flex min-h-7 items-center gap-xs rounded-leaf border px-sm text-caption-bold uppercase tracking-wide',
                isGithubLinked
                  ? 'border-primary-signal/30 bg-primary-signal/10 text-primary-signal'
                  : 'border-text-secondary/20 bg-surface-container text-text-secondary',
              ].join(' ')}
            >
              {isGithubLinked ? <CheckCircle2 size={14} /> : null}
              {isGithubLinked ? '연동됨' : '미연동'}
            </span>
          </div>
          <p className="mt-sm max-w-2xl text-body-sm text-text-ghost">{statusText}</p>
        </div>

        <div className="grid gap-sm sm:flex sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={handleLinkGithub}
            disabled={isLinking}
            className="inline-flex min-h-10 items-center justify-center gap-sm rounded-leaf bg-primary-signal px-md text-body-sm-bold text-background transition hover:glow-neon disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LinkIcon size={20} />
            {isLinking ? '연동 준비 중...' : 'GitHub 연동하기'}
          </button>
          <button
            type="button"
            onClick={handleChooseRepository}
            disabled={!isGithubLinked || isLoading}
            className="inline-flex min-h-10 items-center justify-center gap-sm rounded-leaf border border-primary-signal/30 bg-surface-container px-md text-body-sm-bold text-text-primary transition hover:border-primary-signal/60 hover:glow-neon disabled:cursor-not-allowed disabled:border-text-primary/10 disabled:text-text-secondary/50"
          >
            <GitBranch size={20} />
            레포지토리 선택
          </button>
          <button
            type="button"
            onClick={handleUnlinkGithub}
            disabled={isUnlinking || !isGithubLinked}
            className="inline-flex min-h-10 items-center justify-center gap-sm rounded-leaf border border-text-primary/10 bg-surface-container px-md text-body-sm-bold text-text-secondary transition hover:border-red-300/40 hover:text-red-200 hover:glow-neon disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Unlink size={20} />
            {isUnlinking ? '해제 중...' : '연동 해제'}
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

      <div className="rounded-leaf border border-text-secondary/20 bg-surface-low/45 p-lg shadow-neon-sm backdrop-blur-xl">
        <div className="mb-lg flex items-center justify-between gap-sm">
          <div>
            <h2 className="text-body-lg-bold">연결된 레포지토리</h2>
            <p className="mt-xs text-caption text-text-ghost">
              여기에서 선택한 레포지토리는 SAN의 GitHub 기능에서 사용됩니다.
            </p>
          </div>
          <button
            type="button"
            onClick={loadConnectedRepositories}
            disabled={isLoading}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-leaf border border-text-primary/10 bg-surface-container text-text-secondary transition hover:border-primary-signal/30 hover:text-text-primary hover:glow-neon disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Refresh repositories"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>

        {connectedRepositories.length > 0 ? (
          <div className="grid gap-sm">
            {connectedRepositories.map((repository) => (
              <article
                key={repository.githubRepositoryId}
                className="grid min-w-0 gap-md rounded-leaf border border-text-primary/5 bg-background/70 p-md transition hover:border-primary-signal/20 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-sm">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-leaf bg-misty-teal text-primary-signal">
                    <GitBranch size={21} />
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
          <div className="grid min-h-40 place-items-center rounded-leaf border border-text-primary/5 bg-background/70 px-md py-xl text-center">
            <div className="max-w-md">
              <GitBranch size={28} className="mx-auto text-primary-signal" />
              <p className="mt-md text-body-sm-bold text-text-primary">
                {isGithubLinked ? '아직 선택된 레포지토리가 없습니다' : 'GitHub 계정이 연동되지 않았습니다'}
              </p>
              <p className="mt-xs text-body-sm text-text-ghost">
                {isGithubLinked
                  ? 'GitHub 설정을 마치려면 사용할 레포지토리를 선택해주세요.'
                  : '먼저 GitHub 계정을 연동한 뒤 SAN에서 사용할 레포지토리를 선택할 수 있습니다.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
