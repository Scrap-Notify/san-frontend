import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitBranch, Loader2 } from 'lucide-react';
import { getApiErrorMessage, type GithubRepository } from '@san/shared';
import { githubApi } from '../api/client';

export function GithubRepositorySelectPage() {
  const navigate = useNavigate();
  const [repositories, setRepositories] = useState<GithubRepository[]>([]);
  const [selectedRepositoryId, setSelectedRepositoryId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    let ignore = false;

    githubApi.getRepositories()
      .then((items) => {
        if (ignore) return;
        setRepositories(items);
        setSelectedRepositoryId(items[0]?.githubRepositoryId.toString() ?? '');
      })
      .catch((error) => {
        if (ignore) return;
        setErrorMessage(getApiErrorMessage(error, 'GitHub 레포지토리 목록을 불러오지 못했습니다.'));
      })
      .finally(() => {
        if (ignore) return;
        setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const selectedRepository = useMemo(
    () => repositories.find((repository) => repository.githubRepositoryId.toString() === selectedRepositoryId) ?? null,
    [repositories, selectedRepositoryId],
  );

  const handleConnectRepository = async () => {
    if (!selectedRepository) {
      setErrorMessage('레포지토리를 먼저 선택해주세요.');
      return;
    }

    setIsConnecting(true);
    setErrorMessage(null);

    try {
      await githubApi.connectRepository({
        githubRepositoryId: selectedRepository.githubRepositoryId,
      });
      navigate('/', { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '레포지토리 연결에 실패했습니다.'));
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <section className="grid min-h-[calc(100vh-12rem)] w-full place-items-center py-dashboard-gap text-text-primary">
      <div className="grid w-full max-w-2xl gap-lg rounded-leaf border border-text-secondary/20 bg-surface-low/50 p-xl shadow-neon-sm backdrop-blur-xl">
        <header className="grid gap-sm">
          <p className="text-caption-bold uppercase tracking-wide text-primary-signal">
            GitHub Repository
          </p>
          <h1 className="text-h1-bold leading-tight">레포지토리 선택</h1>
          <p className="text-body-main text-text-secondary">
            SAN에서 사용할 GitHub 레포지토리를 선택해주세요.
          </p>
        </header>

        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center gap-sm rounded-leaf border border-text-primary/5 bg-background/70 text-body-sm-bold text-text-secondary">
            <Loader2 size={20} className="animate-spin text-primary-signal" />
            레포지토리를 불러오는 중입니다...
          </div>
        ) : repositories.length > 0 ? (
          <div className="grid gap-md">
            <label className="grid gap-sm">
              <span className="text-body-sm-bold uppercase tracking-wide text-text-secondary">
                레포지토리
              </span>
              <select
                value={selectedRepositoryId}
                onChange={(event) => setSelectedRepositoryId(event.target.value)}
                className="min-h-14 w-full rounded-leaf border border-text-secondary/30 bg-background px-md text-body-main-bold text-text-primary outline-none transition focus:border-primary-signal/70"
              >
                {repositories.map((repository) => (
                  <option key={repository.githubRepositoryId} value={repository.githubRepositoryId}>
                    {repository.fullName}
                  </option>
                ))}
              </select>
            </label>

            {selectedRepository ? (
              <article className="grid gap-sm rounded-leaf border border-text-primary/5 bg-background/70 p-md">
                <div className="flex min-w-0 items-center gap-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-leaf bg-misty-teal text-primary-signal">
                    <GitBranch size={20} />
                  </span>
                  <div className="min-w-0">
                    <a
                      href={selectedRepository.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate text-body-main-bold text-text-primary hover:text-primary-signal"
                    >
                      {selectedRepository.fullName}
                    </a>
                    <p className="mt-xs text-caption text-text-ghost">
                      {selectedRepository.privateRepository ? 'Private' : 'Public'} / {selectedRepository.defaultBranch}
                    </p>
                  </div>
                </div>
              </article>
            ) : null}
          </div>
        ) : (
          <p className="rounded-leaf border border-text-primary/5 bg-background/70 px-md py-lg text-body-sm text-text-ghost">
            이 GitHub 계정에서 가져올 수 있는 레포지토리가 없습니다.
          </p>
        )}

        {errorMessage ? (
          <p className="rounded-leaf border border-red-300/20 bg-red-500/10 px-md py-sm text-body-sm-bold text-red-200">
            {errorMessage}
          </p>
        ) : null}

        <div className="grid gap-sm sm:grid-cols-[1fr_auto] sm:items-center">
          <button
            type="button"
            onClick={() => navigate('/settings/integrations')}
            className="inline-flex min-h-11 items-center justify-center rounded-leaf border border-text-primary/10 bg-surface-container px-lg text-body-sm-bold text-text-secondary transition hover:border-primary-signal/30 hover:text-text-primary hover:glow-neon"
          >
            나중에 설정하기
          </button>
          <button
            type="button"
            onClick={handleConnectRepository}
            disabled={isLoading || isConnecting || !selectedRepository}
            className="inline-flex min-h-11 items-center justify-center gap-sm rounded-leaf bg-primary-signal px-lg text-body-sm-bold text-background transition hover:glow-neon disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isConnecting ? <Loader2 size={18} className="animate-spin" /> : <GitBranch size={18} />}
            {isConnecting ? '연결 중...' : '레포지토리 연결'}
          </button>
        </div>
      </div>
    </section>
  );
}
