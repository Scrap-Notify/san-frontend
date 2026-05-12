import { type FormEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { getApiErrorMessage } from '@san/shared';
import { authApi, authTokenStorage } from '@extension/api/client';

type AuthMode = 'login' | 'signup';
type UsernameCheckStatus = 'idle' | 'checking' | 'available' | 'unavailable';

interface ExtensionAuthCardProps {
  onAuthenticated: () => void;
}

const inputClass =
  'block h-9 w-full rounded-md border border-white/[0.1] bg-white/[0.045] px-2.5 text-[13px] text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] outline-none backdrop-blur-xl placeholder:text-text-secondary/32 transition focus:border-primary-signal/50 focus:bg-white/[0.065] focus:ring-1 focus:ring-primary-signal/18';

export function ExtensionAuthCard({ onAuthenticated }: ExtensionAuthCardProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkedUsername, setCheckedUsername] = useState('');
  const [usernameCheckStatus, setUsernameCheckStatus] = useState<UsernameCheckStatus>('idle');
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignup = mode === 'signup';

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setCheckedUsername('');
    setUsernameCheckStatus('idle');
    setUsernameMessage(null);
    setErrorMessage(null);
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setCheckedUsername('');
    setUsernameCheckStatus('idle');
    setUsernameMessage(null);
  };

  const handleCheckUsername = async () => {
    const trimmed = username.trim();
    setErrorMessage(null);
    setUsernameMessage(null);

    if (!trimmed) {
      setUsernameCheckStatus('unavailable');
      setUsernameMessage('아이디를 입력해 주세요.');
      return;
    }

    setUsernameCheckStatus('checking');
    try {
      await authApi.checkUsername(trimmed);
      setCheckedUsername(trimmed);
      setUsernameCheckStatus('available');
      setUsernameMessage('사용 가능한 아이디입니다.');
    } catch (error) {
      setCheckedUsername('');
      setUsernameCheckStatus('unavailable');
      setUsernameMessage(getApiErrorMessage(error, '사용할 수 없는 아이디입니다.'));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = username.trim();
    setErrorMessage(null);

    if (!trimmed || !password) {
      setErrorMessage('아이디와 비밀번호를 입력해 주세요.');
      return;
    }

    if (isSignup) {
      if (checkedUsername !== trimmed || usernameCheckStatus !== 'available') {
        setUsernameCheckStatus('unavailable');
        setUsernameMessage('아이디 중복 확인을 완료해 주세요.');
        return;
      }

      if (password !== confirmPassword) {
        setErrorMessage('비밀번호가 일치하지 않습니다.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (isSignup) {
        await authApi.signup({ username: trimmed, password });
      }

      const tokens = await authApi.login({
        username: trimmed,
        password,
        clientType: 'EXTENSION',
      });
      await authTokenStorage.setTokens?.(tokens);
      await chrome.runtime.sendMessage({ type: 'SAN_AUTH_STATE_CHANGED', isAuthenticated: true });
      onAuthenticated();
    } catch (error) {
      const fallback = isSignup ? '회원가입에 실패했습니다.' : '로그인에 실패했습니다.';
      setErrorMessage(getApiErrorMessage(error, fallback).replace(/^(Password|username|아이디|비밀번호):\s*/i, ''));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative z-10 flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-8">
      <div className="relative flex h-[clamp(340px,calc(100vh-112px),374px)] w-full max-w-[420px] flex-col overflow-hidden rounded-lg border border-white/[0.18] bg-white/[0.075] p-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.38),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-3xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-primary-signal/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-12 h-36 w-36 rounded-full bg-white/[0.08] blur-3xl" />

        <div className="relative mb-5">
          <h1 className="text-xl font-bold leading-6 text-text-primary">
            {isSignup ? '회원가입' : '로그인'}
          </h1>
        </div>

        <form className="relative flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <div className={['flex min-h-0 flex-1 flex-col', isSignup ? 'justify-start gap-2' : 'justify-center gap-3 pb-4'].join(' ')}>
            <div>
              <label className="mb-1 block text-[11px] font-bold text-text-secondary">아이디</label>
              <div className={isSignup ? 'flex gap-2' : undefined}>
                <input
                  type="text"
                  value={username}
                  autoComplete="username"
                  placeholder="아이디 입력"
                  onChange={(event) => handleUsernameChange(event.target.value)}
                  className={`${inputClass} ${isSignup ? 'min-w-0 flex-1' : ''}`}
                />
                {isSignup && (
                  <button
                    type="button"
                    onClick={handleCheckUsername}
                    disabled={usernameCheckStatus === 'checking'}
                    className="h-9 shrink-0 rounded-md border border-primary-signal/30 bg-primary-signal/[0.055] px-2 text-[10px] font-bold text-primary-signal shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] outline-none transition hover:bg-primary-signal/10 focus-visible:ring-1 focus-visible:ring-primary-signal/35 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {usernameCheckStatus === 'checking' ? '확인 중' : '중복 확인'}
                  </button>
                )}
              </div>
              {isSignup && (
                <p
                  className={[
                    'mt-1.5 min-h-[16px] text-[11px] font-medium',
                    usernameCheckStatus === 'available' ? 'text-primary-signal' : 'text-red-400',
                  ].join(' ')}
                >
                  {usernameMessage || ''}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-text-secondary">비밀번호</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  placeholder="비밀번호 입력"
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${inputClass} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50 transition hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div className="pt-0.5">
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    autoComplete="new-password"
                    placeholder="비밀번호 재입력"
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className={`${inputClass} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary/50 transition hover:text-text-secondary"
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className="mt-auto min-h-[16px] text-center text-[11px] text-red-400">{errorMessage || ''}</p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-9 min-h-9 w-full shrink-0 rounded-md bg-primary-signal text-[13px] font-bold text-background outline-none transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            style={{ boxShadow: '0 0 22px 0 rgba(0,255,194,0.24)' }}
          >
            {isSubmitting ? '처리 중...' : isSignup ? '회원가입' : '로그인'}
          </button>

          <p className="mt-3 text-center text-[11px] text-text-secondary">
            {isSignup ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}{' '}
            <button
              type="button"
              onClick={() => handleModeChange(isSignup ? 'login' : 'signup')}
              className="font-bold text-primary-signal outline-none transition hover:text-primary-signal/80 focus-visible:rounded focus-visible:ring-1 focus-visible:ring-primary-signal/35"
            >
              {isSignup ? '로그인' : '회원가입'}
            </button>
          </p>
        </form>
      </div>
    </section>
  );
}
