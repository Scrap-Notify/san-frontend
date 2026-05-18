import { type Dispatch, type FormEvent, type SetStateAction, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Bell, Check, ChevronDown, ExternalLink, Keyboard, Loader2, LogOut, RefreshCw, Shield, Trash2, X } from 'lucide-react';
import { getApiErrorMessage, type AuthSession } from '@san/shared';
import { authApi, authTokenStorage, githubApi, statisticsApi } from '../../api/client';
import {
  getExtensionTilRecallSettings,
  openExtensionShortcutSettings as requestOpenExtensionShortcutSettings,
  setExtensionTilRecallSettings,
  type TilRecallSettings,
} from '../../api/extensionAuth';
import { useToast } from '../../components/shared/toast/toastContext';

const sessionLabel: Record<AuthSession['clientType'], string> = {
  DASHBOARD: '대시보드',
  EXTENSION: '익스텐션',
};

function formatExpiresIn(seconds: number) {
  const days = Math.floor(seconds / 86400);
  if (days > 0) return `${days}일 남음`;

  const hours = Math.floor(seconds / 3600);
  if (hours > 0) return `${hours}시간 남음`;

  const minutes = Math.max(1, Math.floor(seconds / 60));
  return `${minutes}분 남음`;
}

function maskSessionId(sessionId: string) {
  if (sessionId.length <= 13) return sessionId;
  return `${sessionId.slice(0, 8)}...${sessionId.slice(-5)}`;
}

const DEFAULT_TIL_RECALL_SETTINGS: TilRecallSettings = {
  enabled: true,
  time: '07:00',
};

const RECALL_TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) => {
  const value = `${String(hour).padStart(2, '0')}:00`;
  return {
    value,
    label: formatRecallTimeLabel(value),
  };
});

function formatRecallTimeLabel(time: string) {
  const [hourText, minuteText] = time.split(':');
  const hour = Number(hourText);
  const period = hour >= 12 ? '오후' : '오전';
  const displayHour = hour % 12 || 12;
  return `${period} ${displayHour}:${minuteText}`;
}

export function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [revokeSessionId, setRevokeSessionId] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawPassword, setWithdrawPassword] = useState('');
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [recallSettings, setRecallSettings] = useState<TilRecallSettings>(DEFAULT_TIL_RECALL_SETTINGS);
  const [isRecallSettingsLoading, setIsRecallSettingsLoading] = useState(true);
  const [isRecallSettingsSaving, setIsRecallSettingsSaving] = useState(false);
  const [recallSettingsError, setRecallSettingsError] = useState<string | null>(null);
  const [isRecallTimeMenuOpen, setIsRecallTimeMenuOpen] = useState(false);
  const [shortcutSettingsMessage, setShortcutSettingsMessage] = useState<string | null>(null);

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
        return { name: githubStatus.value.githubUsername, caption: `github.com/${githubStatus.value.githubUsername}` };
      }

      const localUsername = username.status === 'fulfilled' ? username.value : null;
      return { name: localUsername ?? 'SAN 사용자', caption: localUsername ? '아이디 계정' : '현재 로그인된 계정' };
    },
    staleTime: 1000 * 60,
  });
  const profileLabel = profileQuery.data ?? { name: 'SAN 사용자', caption: '현재 로그인된 계정' };

  const usernameQuery = useQuery({
    queryKey: ['auth', 'current-username'],
    queryFn: () => authTokenStorage.getUsername(),
    staleTime: 0,
  });

  const statisticsQuery = useQuery({
    queryKey: ['statistics', 'overview', usernameQuery.data ?? 'unknown'],
    queryFn: () => statisticsApi.getOverview(),
    enabled: usernameQuery.isSuccess,
    staleTime: 1000 * 60,
  });
  const statistics = statisticsQuery.data;
  const statisticsItems = [
    {
      label: '지식 카드',
      value: statistics?.totalKnowledgeCardCount,
    },
    {
      label: 'TIL 기록',
      value: statistics?.totalTilCount,
    },
    {
      label: '오늘 생성',
      value: statistics?.todayKnowledgeCardCount,
      accent: true,
    },
  ];

  const clearLocalAuthAndMoveLogin = useCallback(async () => {
    await authTokenStorage.clearToken();
    queryClient.clear();
    navigate('/login', { replace: true });
  }, [navigate, queryClient]);

  useEffect(() => {
    let ignore = false;

    getExtensionTilRecallSettings()
      .then((settings) => {
        if (ignore) return;
        setRecallSettings(settings);
        setRecallSettingsError(null);
      })
      .catch(() => {
        if (ignore) return;
        setRecallSettingsError('익스텐션을 연결하면 알림 설정을 불러올 수 있어요.');
      })
      .finally(() => {
        if (ignore) return;
        setIsRecallSettingsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const saveRecallSettings = useCallback(async (nextSettings: TilRecallSettings) => {
    const previousSettings = recallSettings;
    setRecallSettings(nextSettings);
    setRecallSettingsError(null);
    setIsRecallSettingsSaving(true);

    try {
      const savedSettings = await setExtensionTilRecallSettings(nextSettings);
      setRecallSettings(savedSettings);
      showToast({
        type: 'success',
        title: '저장됐어요',
        description: formatRecallTimeLabel(savedSettings.time),
        duration: 2200,
      });
    } catch (error) {
      console.warn('[SAN:recall-settings] failed to save recall settings', error);
      setRecallSettings(previousSettings);
      const message = '알림 설정을 저장하지 못했어요. 익스텐션 연결을 확인해 주세요.';
      setRecallSettingsError(message);
      showToast({
        type: 'error',
        title: '저장 실패',
        description: '익스텐션 연결을 확인해 주세요.',
        duration: 2600,
      });
    } finally {
      setIsRecallSettingsSaving(false);
    }
  }, [recallSettings, showToast]);

  const openShortcutSettings = useCallback(async () => {
    setShortcutSettingsMessage(null);

    try {
      await requestOpenExtensionShortcutSettings();
    } catch (error) {
      console.warn('[SAN:shortcut-settings] failed to open shortcut settings', error);
      await navigator.clipboard?.writeText('chrome://extensions/shortcuts').catch(() => undefined);
      setShortcutSettingsMessage('익스텐션 연결이 안 되어 단축키 설정 주소를 복사했어요.');
    }
  }, []);

  const recallTimeDisabled = !recallSettings.enabled || isRecallSettingsLoading || isRecallSettingsSaving;
  const selectedRecallTimeLabel = RECALL_TIME_OPTIONS.find((option) => option.value === recallSettings.time)?.label
    ?? formatRecallTimeLabel(recallSettings.time);

  useEffect(() => {
    if (recallTimeDisabled) {
      setIsRecallTimeMenuOpen(false);
    }
  }, [recallTimeDisabled]);

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
    <section className="mx-auto w-full max-w-[720px] py-6 text-white">
      <header className="mb-7 border-b border-white/8 pb-6">
        <h1 className="bg-gradient-to-r from-white to-white/40 bg-clip-text text-h1-bold text-transparent">
          마이 프로필
        </h1>
        <p className="mt-2 text-sm text-white/45">계정 통계와 로그인 세션을 관리하세요.</p>
      </header>

      <div className="space-y-6">
        <section className="rounded-lg border border-white/[0.07] bg-white/[0.04] p-6 shadow-[0_18px_48px_rgba(0,0,0,0.2)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/10 text-lg font-black text-primary-signal">
                {profileLabel.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold tracking-tight text-white">{profileLabel.name}</h2>
                <p className="mt-1 truncate text-sm text-text-secondary">{profileLabel.caption}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-md bg-black/30 px-4 text-xs font-bold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
              {isLoggingOut ? '로그아웃 중' : '로그아웃'}
            </button>
          </div>

          <div className="mt-6 border-t border-white/[0.06] pt-5">
            <div className="grid grid-cols-3 gap-4">
              {statisticsItems.map((item) => (
                <div key={item.label} className="min-w-0">
                  <p className="truncate text-[11px] font-bold uppercase tracking-wide text-text-secondary/75">
                    {item.label}
                  </p>
                  <p className={`mt-2 text-xl font-black tabular-nums ${item.accent ? 'text-primary-signal' : 'text-white'}`}>
                    {statisticsQuery.isLoading || statisticsQuery.isError || item.value == null
                      ? '-'
                      : item.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {statisticsQuery.error && (
            <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-200">
              {getApiErrorMessage(statisticsQuery.error, '통계를 불러오지 못했습니다.')}
            </p>
          )}
        </section>

        <ProfileSettingsCards
          recallSettings={recallSettings}
          recallTimeDisabled={recallTimeDisabled}
          selectedRecallTimeLabel={selectedRecallTimeLabel}
          isRecallSettingsLoading={isRecallSettingsLoading}
          isRecallSettingsSaving={isRecallSettingsSaving}
          recallSettingsError={recallSettingsError}
          isRecallTimeMenuOpen={isRecallTimeMenuOpen}
          setIsRecallTimeMenuOpen={setIsRecallTimeMenuOpen}
          saveRecallSettings={saveRecallSettings}
          openShortcutSettings={openShortcutSettings}
          shortcutSettingsMessage={shortcutSettingsMessage}
        />

        <section className="border-t border-white/[0.06] pt-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <Shield size={17} className="text-primary-signal" />
                로그인 세션
              </h3>
              <p className="mt-1 text-xs text-white/40">대시보드와 확장 프로그램 세션을 관리합니다.</p>
            </div>
            <button
              type="button"
              onClick={() => void sessionsQuery.refetch()}
              disabled={sessionsQuery.isFetching}
              className="flex h-8 w-8 shrink-0 items-center justify-center text-white/45 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="세션 새로고침"
              title="세션 새로고침"
            >
              <RefreshCw size={14} className={sessionsQuery.isFetching ? 'animate-spin' : undefined} />
            </button>
          </div>

          {(sessionError || sessionsErrorMessage) && (
            <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {sessionError || sessionsErrorMessage}
            </p>
          )}

          <div className="no-scrollbar max-h-[360px] space-y-3 overflow-y-auto pr-1">
            {sessionsQuery.isLoading ? (
              <div className="flex h-24 items-center justify-center text-sm text-white/35">
                <Loader2 size={18} className="mr-2 animate-spin" />
                세션을 불러오는 중
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-lg border border-white/5 bg-white/[0.03] p-5 text-sm text-white/40">
                활성 세션이 없습니다.
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={`${session.clientType}-${session.sessionId}`}
                  className="flex flex-col gap-4 rounded-lg border border-white/[0.07] bg-white/[0.04] px-5 py-4 transition-colors hover:border-white/[0.12] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{sessionLabel[session.clientType]}</span>
                      {session.current && (
                        <span className="rounded-md bg-primary-signal/12 px-2 py-0.5 text-[10px] font-black text-primary-signal">
                          현재
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-xs text-text-secondary">{maskSessionId(session.sessionId)}</p>
                    <p className="mt-2 text-xs font-medium text-white/38">만료까지 {formatExpiresIn(session.expiresInSeconds)}</p>
                  </div>

                  {session.current ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="h-8 shrink-0 rounded-md border border-red-500/20 px-3 text-xs font-bold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      현재 세션 로그아웃
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleRevokeSession(session)}
                      disabled={revokeSessionId === session.sessionId}
                      className="h-8 shrink-0 rounded-md bg-black/30 px-3 text-xs font-bold text-white/70 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {revokeSessionId === session.sessionId ? '폐기 중' : '폐기'}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-lg border border-white/[0.06] bg-transparent px-3 py-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="flex items-center gap-1.5 text-xs font-bold text-red-200/80">
                <AlertTriangle size={13} />
                회원탈퇴
              </h3>
              <p className="mt-0.5 text-[11px] leading-4 text-white/32">
                탈퇴하면 모든 로그인 세션이 만료되고 계정이 비활성화됩니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsWithdrawOpen(true)}
              className="flex h-7 shrink-0 items-center justify-center gap-1 rounded-md border border-red-400/18 bg-transparent px-2.5 text-[11px] font-bold text-red-200/75 transition hover:border-red-300/35 hover:text-red-100 active:scale-[0.98]"
            >
              <Trash2 size={12} />
              회원탈퇴
            </button>
          </div>
        </section>
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

function ProfileSettingsCards({
  recallSettings,
  recallTimeDisabled,
  selectedRecallTimeLabel,
  isRecallSettingsLoading,
  isRecallSettingsSaving,
  recallSettingsError,
  isRecallTimeMenuOpen,
  setIsRecallTimeMenuOpen,
  saveRecallSettings,
  openShortcutSettings,
  shortcutSettingsMessage,
}: {
  recallSettings: TilRecallSettings;
  recallTimeDisabled: boolean;
  selectedRecallTimeLabel: string;
  isRecallSettingsLoading: boolean;
  isRecallSettingsSaving: boolean;
  recallSettingsError: string | null;
  isRecallTimeMenuOpen: boolean;
  setIsRecallTimeMenuOpen: Dispatch<SetStateAction<boolean>>;
  saveRecallSettings: (settings: TilRecallSettings) => Promise<void>;
  openShortcutSettings: () => Promise<void>;
  shortcutSettingsMessage: string | null;
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)]">
      <section className="rounded-lg border border-white/[0.07] bg-white/[0.035] p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold text-white">
          <Keyboard size={16} className="text-primary-signal" />
          단축키 설정
        </h3>

        <div className="mt-6 space-y-4">
          <ShortcutRow label="사이드패널 열기" shortcut="Alt + S" />
          <ShortcutRow label="화면 캡처" shortcut="Ctrl + Shift + Y" />
        </div>

        <div className="mt-5 border-t border-white/[0.06] pt-4">
          <button
            type="button"
            onClick={() => void openShortcutSettings()}
            className="flex w-full items-center justify-center gap-1.5 text-[11px] font-semibold text-white/45 transition hover:text-primary-signal"
          >
            Chrome에서 단축키 변경하기
            <ExternalLink size={12} />
          </button>
          {shortcutSettingsMessage && (
            <p className="mt-3 rounded-md border border-primary-signal/15 bg-primary-signal/8 px-3 py-2 text-xs text-primary-signal/80">
              {shortcutSettingsMessage}
            </p>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-white/[0.07] bg-white/[0.035] p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-white">
            <Bell size={16} className="text-primary-signal" />
            알림 설정
          </h3>
          <button
            type="button"
            role="switch"
            aria-checked={recallSettings.enabled}
            disabled={isRecallSettingsLoading || isRecallSettingsSaving}
            onClick={() => void saveRecallSettings({ ...recallSettings, enabled: !recallSettings.enabled })}
            className={`relative h-6 w-11 rounded-full transition ${
              recallSettings.enabled ? 'bg-primary-signal' : 'bg-white/15'
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <span
              className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
                recallSettings.enabled ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-white">Recall 리마인더</p>
              <p className="mt-1 text-xs text-white/42">저장한 노트 복습 알림을 받습니다.</p>
            </div>
            <RecallSaveStatus
              isSaving={isRecallSettingsSaving}
              error={recallSettingsError}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-white">리마인더 발송 시간</p>
              <p className="mt-1 text-xs text-white/42">리콜이 오면 리포트 수신 시각</p>
            </div>
            <div
              className="relative"
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                  setIsRecallTimeMenuOpen(false);
                }
              }}
            >
              <button
                type="button"
                disabled={recallTimeDisabled}
                onClick={() => setIsRecallTimeMenuOpen((current) => !current)}
                className="flex h-9 w-[118px] items-center justify-between gap-1.5 rounded-full border border-primary-signal/45 bg-black/35 px-3 text-xs font-black text-primary-signal shadow-[0_0_0_1px_rgba(111,255,190,0.04)] outline-none transition hover:border-primary-signal/70 hover:bg-primary-signal/8 focus:border-primary-signal disabled:cursor-not-allowed disabled:border-white/[0.06] disabled:text-white/35 disabled:opacity-60"
              >
                <span>{selectedRecallTimeLabel}</span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 transition ${isRecallTimeMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isRecallTimeMenuOpen && (
                <div className="absolute right-0 top-11 z-20 w-[142px] overflow-hidden rounded-lg border border-primary-signal/20 bg-[#101615] shadow-[0_18px_40px_rgba(0,0,0,0.42)]">
                  <div className="max-h-[216px] overflow-y-auto p-1.5">
                    {RECALL_TIME_OPTIONS.map((option) => {
                      const selected = option.value === recallSettings.time;

                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setIsRecallTimeMenuOpen(false);
                            void saveRecallSettings({ ...recallSettings, time: option.value });
                          }}
                          className={`flex h-9 w-full items-center justify-between rounded-md px-3 text-left text-xs font-bold transition ${
                            selected
                              ? 'bg-primary-signal/14 text-primary-signal'
                              : 'text-white/72 hover:bg-white/[0.06] hover:text-white'
                          }`}
                        >
                          <span>{option.label}</span>
                          {selected && <Check size={13} />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </section>
    </section>
  );
}

function RecallSaveStatus({
  isSaving,
  error,
}: {
  isSaving: boolean;
  error: string | null;
}) {
  if (isSaving) {
    return (
      <span className="flex items-center gap-1.5 text-[11px] font-semibold text-primary-signal">
        <Loader2 size={12} className="animate-spin" />
        저장 중
      </span>
    );
  }

  if (error) {
    return <span className="text-[11px] font-semibold text-red-300">저장 실패</span>;
  }

  return null;
}

function ShortcutRow({ label, shortcut }: { label: string; shortcut: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="min-w-0 text-xs font-semibold text-white/62">{label}</span>
      <kbd className="shrink-0 rounded-full border border-white/[0.06] bg-white/[0.06] px-2.5 py-1 text-[11px] font-black text-primary-signal">
        {shortcut}
      </kbd>
    </div>
  );
}
