import { type FormEvent, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Loader2, LogOut, Shield, Trash2, User, X } from 'lucide-react';
import { getApiErrorMessage, type AuthSession } from '@san/shared';
import { authApi, authTokenStorage, githubApi } from '../api/client';

const sessionLabel: Record<AuthSession['clientType'], string> = {
  DASHBOARD: 'Dashboard',
  EXTENSION: 'Extension',
};
function formatExpiresIn(seconds: number) {
  const days = Math.floor(seconds / 86400);
  if (days > 0) return `${days}일 남음`;

  const hours = Math.floor(seconds / 3600);
  if (hours > 0) return `${hours}시간 남음`;

  const minutes = Math.max(1, Math.floor(seconds / 60));
  return `${minutes}분 남음`;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [revokeSessionId, setRevokeSessionId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const sessionsQuery = useQuery({
    queryKey: ['auth', 'sessions'],
    queryFn: () => authApi.getSessions(),
    staleTime: 0,
  });
  const sessions = sessionsQuery.data?.sessions ?? [];
  const sessionsErrorMessage = sessionsQuery.error
    ? getApiErrorMessage(sessionsQuery.error, '세션 목록을 불러오지 못했습니다.')
    : null;
  const profileQuery = useQuery({
    queryKey: ['auth', 'profile-label'],
    queryFn: async () => {
      const [username, githubStatus] = await Promise.allSettled([
        authTokenStorage.getUsername(),
        githubApi.getLinkStatus(),
      ]);

      if (
        githubStatus.status === 'fulfilled'
        && githubStatus.value.linked
        && githubStatus.value.githubUsername
      ) {
        return { name: githubStatus.value.githubUsername, caption: 'GitHub 계정' };
      }

      const localUsername = username.status === 'fulfilled' ? username.value : null;
      return { name: localUsername ?? 'SAN 사용자', caption: localUsername ? '아이디 계정' : '현재 로그인된 계정' };
    },
    staleTime: 1000 * 60,
  });
  const profileLabel = profileQuery.data ?? { name: 'SAN 사용자', caption: '현재 로그인된 계정' };

  const clearLocalAuthAndMoveLogin = useCallback(async () => {
    await authTokenStorage.clearToken();
    navigate('/login', { replace: true });
  }, [navigate]);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await authApi.logout();
    } catch (error) {
      console.warn('[SAN:auth] logout request failed', error);
    } finally {
      await clearLocalAuthAndMoveLogin();
      setIsLoggingOut(false);
    }
  };

  const handleRevokeSession = async (session: AuthSession) => {
    setRevokeSessionId(session.sessionId);
    setSessionError(null);

    try {
      await authApi.revokeSession(session.sessionId, session.clientType);
      await sessionsQuery.refetch();
    } catch (error) {
      setSessionError(getApiErrorMessage(error, '세션을 폐기하지 못했습니다.'));
    } finally {
      setRevokeSessionId(null);
    }
  };

  const handleWithdraw = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setWithdrawError(null);

    if (!withdrawPassword) {
      setWithdrawError('비밀번호를 입력해 주세요.');
      return;
    }

    setIsWithdrawing(true);
    try {
      await authApi.withdraw({ password: withdrawPassword });
      await clearLocalAuthAndMoveLogin();
    } catch (error) {
      setWithdrawError(getApiErrorMessage(error, '회원탈퇴에 실패했습니다.'));
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-[1040px] space-y-8 py-10 text-white">
      <header className="flex flex-col gap-3">
        <h1 className="bg-gradient-to-r from-white to-white/40 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
          마이 프로필
        </h1>
        <p className="text-base text-white/50">로그인 세션과 계정 상태를 관리하세요.</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-[32px] border border-white/5 bg-[#131718] p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="h-28 w-28 rounded-full border border-[#4ade80]/25 bg-gradient-to-tr from-[#1a1f21] to-[#0B0D0F] p-1">
              <div className="flex h-full w-full items-center justify-center rounded-full border border-white/10 bg-black/20">
                <User size={44} className="text-[#4ade80]" strokeWidth={1.5} />
              </div>
            </div>

            <div className="mt-6">
              <h2 className="break-all text-2xl font-bold tracking-tight">{profileLabel.name}</h2>
              <p className="mt-1 text-sm font-medium text-white/40">{profileLabel.caption}</p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/5 bg-white/5 text-sm font-bold text-white/55 transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? <Loader2 size={17} className="animate-spin" /> : <LogOut size={17} />}
              {isLoggingOut ? '로그아웃 중' : '로그아웃'}
            </button>
          </div>
        </aside>

        <div className="space-y-8">
          <section className="rounded-[32px] border border-white/5 bg-[#131718] p-8 shadow-2xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold">
                  <Shield size={19} className="text-[#4ade80]" />
                  로그인 세션
                </h3>
                <p className="mt-2 text-sm text-white/40">대시보드와 익스텐션 세션을 분리해서 관리합니다.</p>
              </div>
              <button
                type="button"
                onClick={() => void sessionsQuery.refetch()}
                disabled={sessionsQuery.isFetching}
                className="h-9 rounded-xl border border-white/10 px-4 text-xs font-bold text-white/45 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                새로고침
              </button>
            </div>

            {(sessionError || sessionsErrorMessage) && (
              <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {sessionError || sessionsErrorMessage}
              </p>
            )}

            <div className="mt-6 space-y-3">
              {sessionsQuery.isLoading ? (
                <div className="flex h-24 items-center justify-center text-sm text-white/35">
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  세션을 불러오는 중
                </div>
              ) : sessions.length === 0 ? (
                <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5 text-sm text-white/40">
                  활성 세션이 없습니다.
                </div>
              ) : (
                sessions.map((session) => (
                  <div
                    key={`${session.clientType}-${session.sessionId}`}
                    className="flex flex-col gap-4 rounded-2xl border border-white/5 bg-white/[0.03] p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{sessionLabel[session.clientType]}</span>
                        {session.current && (
                          <span className="rounded-full border border-[#4ade80]/25 bg-[#4ade80]/10 px-2 py-0.5 text-[10px] font-black text-[#4ade80]">
                            현재
                          </span>
                        )}
                      </div>
                      <p className="mt-1 break-all text-xs text-white/30">{session.sessionId}</p>
                      <p className="mt-2 text-xs font-semibold text-white/35">{formatExpiresIn(session.expiresInSeconds)}</p>
                    </div>

                    {session.current ? (
                      <button
                        type="button"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="h-10 rounded-xl border border-red-500/20 px-4 text-xs font-bold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        현재 세션 로그아웃
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handleRevokeSession(session)}
                        disabled={revokeSessionId === session.sessionId}
                        className="h-10 rounded-xl border border-white/10 px-4 text-xs font-bold text-white/45 transition hover:border-red-500/20 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {revokeSessionId === session.sessionId ? '폐기 중' : '세션 폐기'}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[32px] border border-red-500/15 bg-red-500/[0.04] p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-xl font-bold text-red-200">
                  <AlertTriangle size={19} />
                  회원탈퇴
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-red-100/55">
                  탈퇴하면 모든 로그인 세션이 만료되고 계정이 비활성화됩니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsWithdrawOpen(true)}
                className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-500/25 px-5 text-sm font-bold text-red-200 transition hover:bg-red-500/10 active:scale-95"
              >
                <Trash2 size={16} />
                회원탈퇴
              </button>
            </div>
          </section>
        </div>
      </div>

      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <form
            onSubmit={handleWithdraw}
            className="w-full max-w-[360px] rounded-3xl border border-white/10 bg-[#131718] p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white">회원탈퇴 확인</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/45">비밀번호를 입력하면 계정 탈퇴가 진행됩니다.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsWithdrawOpen(false);
                  setWithdrawPassword('');
                  setWithdrawError(null);
                }}
                disabled={isWithdrawing}
                className="rounded-full p-1 text-white/35 transition hover:bg-white/5 hover:text-white"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            <input
              type="password"
              value={withdrawPassword}
              autoComplete="current-password"
              placeholder="비밀번호 입력"
              onChange={(event) => setWithdrawPassword(event.target.value)}
              className="mt-6 h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-red-300/50"
            />
            <p className="mt-2 min-h-[18px] text-xs text-red-300">{withdrawError || ''}</p>

            <button
              type="submit"
              disabled={isWithdrawing}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-400 text-sm font-black text-black transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isWithdrawing && <Loader2 size={16} className="animate-spin" />}
              {isWithdrawing ? '탈퇴 처리 중' : '탈퇴하기'}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}
