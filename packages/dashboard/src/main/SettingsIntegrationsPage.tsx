import { GitBranch, RefreshCw, Trash2, Loader2, Search, Link2, TerminalSquare, AlertTriangle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApiErrorMessage, type GithubRepository } from '@san/shared';
import { githubApi } from '../api/client';
import githubSvg from '@ui/assets/icons/github.svg';

const GITHUB_LINK_ERROR_MESSAGE: Record<string, string> = {
  A009: 'GitHub 계정이 연동되어 있지 않습니다.',
  A011: '이미 다른 계정에 연결된 GitHub 계정입니다.',
  A012: 'GitHub 로그인 계정은 연동을 해제할 수 없습니다.',
};

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function RepositorySkeleton() {
  return (
    <ul className="flex flex-col gap-3">
      {[1, 2, 3, 4].map((key) => (
        <li key={key} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#1c1c1c] p-4">
          <div className="min-w-0 flex-1 animate-pulse">
            <div className="h-4 w-2/3 rounded bg-white/10"></div>
            <div className="mt-2 h-3 w-1/3 rounded bg-white/5"></div>
          </div>
          <div className="h-8 w-16 shrink-0 rounded-md bg-white/5 animate-pulse"></div>
        </li>
      ))}
    </ul>
  );
}

export function SettingsIntegrationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const githubLinked = searchParams.get('githubLinked') === 'true';
  
  const [isGithubLinked, setIsGithubLinked] = useState(githubLinked);
  const [connectedRepositories, setConnectedRepositories] = useState<GithubRepository[]>([]);
  const [availableRepositories, setAvailableRepositories] = useState<GithubRepository[]>([]);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const [isLoadingConnected, setIsLoadingConnected] = useState(true);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [connectingRepoId, setConnectingRepoId] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const loadConnectedRepositories = async () => {
    setIsLoadingConnected(true);
    setErrorMessage(null);

    try {
      const repositories = await githubApi.getConnectedRepositories();
      // 단일 레포 연결 정책 반영 (배열이어도 하나만 렌더링하도록 취급)
      setConnectedRepositories(repositories);
      setIsGithubLinked(true);
    } catch {
      setConnectedRepositories([]);
      setIsGithubLinked(false);
    } finally {
      setIsLoadingConnected(false);
    }
  };

  const loadAvailableRepositories = async () => {
    setIsLoadingAvailable(true);
    try {
      const items = await githubApi.getRepositories();
      setAvailableRepositories(items);
    } catch {
      // ignore
    } finally {
      setIsLoadingAvailable(false);
    }
  };

  useEffect(() => {
    if (githubLinked) {
      navigate('/settings/integrations', { replace: true });
    }

    let ignore = false;
    githubApi.getConnectedRepositories()
      .then((repositories) => {
        if (ignore) return;
        setConnectedRepositories(repositories);
        setIsGithubLinked(true);
        loadAvailableRepositories();
      })
      .catch(() => {
        if (ignore) return;
        setConnectedRepositories([]);
        setIsGithubLinked(false);
      })
      .finally(() => {
        if (ignore) return;
        setIsLoadingConnected(false);
      });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [githubLinked]);

  const handleLinkGithub = async () => {
    if (isLinking || isGithubLinked) return;

    setErrorMessage(null);
    setIsLinking(true);

    try {
      window.location.href = await githubApi.getLinkAuthorizeUrl();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'GitHub 연동을 시작하지 못했습니다.', GITHUB_LINK_ERROR_MESSAGE));
      setIsLinking(false);
    }
  };

  const handleUnlinkGithub = async () => {
    if (isUnlinking) return;

    const confirmed = window.confirm('GitHub 연동을 해제할까요? 연결된 레포지토리도 더 이상 SAN에서 사용할 수 없습니다.');
    if (!confirmed) return;

    setErrorMessage(null);
    setIsUnlinking(true);

    try {
      // DELETE /api/github/link
      await githubApi.unlinkAccount();
      setConnectedRepositories([]);
      setAvailableRepositories([]);
      setIsGithubLinked(false);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'GitHub 연동 해제에 실패했습니다.', GITHUB_LINK_ERROR_MESSAGE));
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleConnectRepository = async (repo: GithubRepository) => {
    // 단일 연결 정책이므로 만약 이미 연결된 게 있다면 해제 후 연결하거나 막을 수 있음
    if (connectedRepositories.length > 0) {
      const confirmed = window.confirm('이미 연결된 레포지토리가 있습니다. 기존 연결을 해제하고 새 레포지토리를 연결할까요?');
      if (!confirmed) return;
      
      try {
        await githubApi.disconnectRepository(connectedRepositories[0].githubRepositoryId);
      } catch (error) {
        setErrorMessage(getApiErrorMessage(error, '기존 레포지토리 연결 해제에 실패했습니다.'));
        return;
      }
    }

    setConnectingRepoId(repo.githubRepositoryId);
    setErrorMessage(null);

    try {
      await githubApi.connectRepository({
        githubRepositoryId: repo.githubRepositoryId,
      });
      await loadConnectedRepositories();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '레포지토리 연결에 실패했습니다.'));
    } finally {
      setConnectingRepoId(null);
    }
  };

  const handleDisconnectRepository = async (repositoryId: number) => {
    setErrorMessage(null);

    try {
      await githubApi.disconnectRepository(repositoryId);
      await loadConnectedRepositories();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, '레포지토리 연결 해제에 실패했습니다.'));
    }
  };

  const filteredAvailableRepos = useMemo(() => {
    const connectedIds = new Set(connectedRepositories.map(r => r.githubRepositoryId));
    const notConnected = availableRepositories.filter(r => !connectedIds.has(r.githubRepositoryId));
    
    if (!debouncedSearchQuery) return notConnected;
    return notConnected.filter(repo => repo.fullName.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
  }, [availableRepositories, connectedRepositories, debouncedSearchQuery]);

  return (
    <section className="w-full min-w-0 space-y-lg py-dashboard-gap text-text-primary max-w-[1200px] mx-auto">

      {/* ── 상단: GitHub 연동 상태 카드 ── */}
      <div className="rounded-xl border border-white/5 bg-[#121212] p-8 shadow-sm">
        <div className="flex flex-col items-start justify-between gap-lg sm:flex-row sm:items-center">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#4ade80]">
              통합 연동 <span className="mx-2 text-white/20">•</span> <span className="text-white/40">외부 동기화</span>
            </p>
            <div className="mt-3 flex items-center gap-3">
              <h1 className="text-4xl font-bold text-white tracking-tight">GitHub</h1>
              <span
                className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  isGithubLinked
                    ? 'bg-white/5 text-white/40 border border-white/10'
                    : 'bg-white/5 text-white/40 border border-white/10'
                }`}
              >
                {isGithubLinked ? '연동됨' : '미연동'}
              </span>
            </div>
            <p className="mt-4 max-w-lg text-sm text-white/50 leading-relaxed">
              GitHub 계정을 연동하여 레포지토리를 동기화하고, "TIL" 마크다운 파일들을 SAN 워크스페이스로 자동으로 가져오세요.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            {isGithubLinked && (
              <button
                type="button"
                onClick={handleUnlinkGithub}
                disabled={isUnlinking}
                className="text-sm font-medium text-white/40 hover:text-red-400 transition"
              >
                {isUnlinking ? '해제 중...' : '연동 해제'}
              </button>
            )}
            <button
              type="button"
              onClick={handleLinkGithub}
              disabled={isLinking || isGithubLinked}
              className={`inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-bold transition-all ${
                isGithubLinked
                  ? 'bg-[#4ade80] text-black hover:bg-[#4ade80]/90 cursor-not-allowed opacity-90'
                  : 'bg-[#4ade80] text-black hover:bg-[#4ade80]/90 active:scale-95'
              }`}
            >
              <img
                src={githubSvg}
                alt="GitHub"
                className={`w-5 h-5 ${isGithubLinked ? 'brightness-0' : 'brightness-0'}`}
              />
              {isLinking ? '연동 중...' : 'GitHub 계정 연동'}
            </button>
          </div>
        </div>
      </div>

      {/* 에러 메시지 */}
      {errorMessage && (
        <div className="flex items-center gap-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4 mt-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-red-500">연결 오류</h3>
            <p className="text-xs text-red-500/70">{errorMessage}</p>
          </div>
          {!isGithubLinked && (
            <button onClick={handleLinkGithub} className="text-xs font-medium text-red-500 hover:text-red-400 underline decoration-red-500/30 underline-offset-4">
              재인증하기
            </button>
          )}
        </div>
      )}

      {/* ── 하단: 2단 레포지토리 관리 영역 ── */}
      <div className="grid gap-6 lg:grid-cols-2 items-start mt-10">
        
        {/* 왼쪽: Available Repositories */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">연결 가능한 레포지토리</h2>
            <span className="text-xs text-white/40">{isGithubLinked ? '동기화 준비 완료' : '동기화 비활성화됨'}</span>
          </div>

          <div className="flex min-h-[400px] flex-col overflow-hidden rounded-xl border border-white/5 bg-[#121212]/80">
            {/* 검색바 */}
            <div className="border-b border-white/5 p-4">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="레포지토리 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={!isGithubLinked || isLoadingAvailable}
                  className="w-full rounded-lg border border-white/10 bg-[#1c1c1c] py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 outline-none transition focus:border-white/20 disabled:opacity-50"
                />
              </div>
            </div>

            {/* 목록 또는 Empty State */}
            <div className="flex flex-1 flex-col overflow-y-auto p-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {!isGithubLinked ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 border-dashed bg-white/5 text-white/30">
                    <Link2 size={24} />
                  </div>
                  <h3 className="text-base font-bold text-white">계정이 연동되지 않았습니다</h3>
                  <p className="mt-2 max-w-[260px] text-xs text-white/40 leading-relaxed">
                    GitHub 계정을 연동하면 SAN과 동기화할 레포지토리를 조회하고 선택할 수 있습니다.
                  </p>
                  <button
                    onClick={handleLinkGithub}
                    className="mt-6 rounded-lg bg-white/5 px-4 py-2 text-xs font-medium text-white hover:bg-white/10 transition"
                  >
                    연결 상태 새로고침
                  </button>
                </div>
              ) : isLoadingAvailable ? (
                <RepositorySkeleton />
              ) : filteredAvailableRepos.length > 0 ? (
                <ul className="flex flex-col gap-3">
                  {filteredAvailableRepos.map((repo) => (
                    <li key={repo.githubRepositoryId} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#1c1c1c] p-4 transition hover:bg-white/[0.04]">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-white/40">
                          <GitBranch size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">{repo.fullName}</p>
                          <p className="text-xs text-white/40 mt-1">{repo.privateRepository ? '비공개(Private)' : '공개(Public)'} / {repo.defaultBranch}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleConnectRepository(repo)}
                        disabled={connectingRepoId === repo.githubRepositoryId}
                        className="flex h-8 shrink-0 items-center justify-center rounded-md bg-[#254230] px-4 text-xs font-bold text-[#4ade80] transition hover:bg-[#2d523b] disabled:opacity-50"
                      >
                        {connectingRepoId === repo.githubRepositoryId ? <Loader2 size={14} className="animate-spin" /> : '연결하기'}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-center text-white/40">
                  <p className="text-sm">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽: Connected Repositories */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">연결된 레포지토리</h2>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold text-white/60">
                {connectedRepositories.length}
              </span>
            </div>
            <button
              onClick={loadConnectedRepositories}
              disabled={isLoadingConnected || !isGithubLinked}
              className="text-white/40 hover:text-white transition disabled:opacity-50"
            >
              <RefreshCw size={16} className={isLoadingConnected ? 'animate-spin' : ''} />
            </button>
          </div>

          <div className="flex min-h-[400px] flex-col overflow-hidden rounded-xl border border-white/5 bg-[#121212]/80 p-4">
            {!isGithubLinked || (!isLoadingConnected && connectedRepositories.length === 0) ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/30">
                  <TerminalSquare size={28} />
                  <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#121212]">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-[#4ade80] text-black">
                      <span className="text-[10px] font-bold leading-none">+</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-base font-bold text-white">
                  {isGithubLinked ? '연결된 레포지토리가 없습니다' : 'GitHub 연동이 필요합니다'}
                </h3>
                <p className="mt-2 max-w-[280px] text-xs text-white/40 leading-relaxed">
                  {isGithubLinked 
                    ? '좌측 목록에서 SAN과 동기화할 레포지토리를 선택해주세요.'
                    : '계정 연동 후, SAN 워크스페이스에서 관리할 레포지토리를 선택할 수 있습니다.'}
                </p>
              </div>
            ) : isLoadingConnected ? (
               <RepositorySkeleton />
            ) : (
              <ul className="flex flex-col gap-3 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {connectedRepositories.map((repo) => (
                  <li key={repo.githubRepositoryId} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#1c1c1c] p-4">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#254230]/50 text-[#4ade80]">
                        <GitBranch size={20} />
                      </div>
                      <div className="min-w-0">
                        <a href={repo.htmlUrl} target="_blank" rel="noreferrer" className="block truncate text-sm font-bold text-white hover:text-[#4ade80] transition">
                          {repo.fullName}
                        </a>
                        <p className="text-xs text-white/40 mt-1">{repo.privateRepository ? '비공개(Private)' : '공개(Public)'} / {repo.defaultBranch}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnectRepository(repo.githubRepositoryId)}
                      className="text-white/30 hover:text-red-400 transition p-2"
                      title="연결 해제"
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
