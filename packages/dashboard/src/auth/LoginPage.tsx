import { type FormEvent, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import githubSvg from '@dashboard/assets/github.svg';
import { getApiErrorMessage } from '@san/shared';
import { authApi, authTokenStorage, githubAuthApi } from '../api/client';
import { syncExtensionAuth } from '@dashboard/api/extensionAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialAuthError =
    typeof location.state === 'object' && location.state && 'authError' in location.state
      ? (location.state as { authError: string }).authError
      : null;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [generalError, setGeneralError] = useState<string | null>(initialAuthError);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGithubLogin = () => {
    window.location.href = githubAuthApi.getGithubAuthorizeUrl();
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    let hasError = false;
    if (!username.trim()) {
      setUsernameError('아이디를 입력해주세요.');
      hasError = true;
    } else {
      setUsernameError(null);
    }

    if (!password) {
      setPasswordError('비밀번호를 입력해주세요.');
      hasError = true;
    } else {
      setPasswordError(null);
    }

    if (hasError) return;

    setGeneralError(null);
    setIsSubmitting(true);
    try {
      const tokens = await authApi.login({ username, password });
      await authTokenStorage.setTokens(tokens);
      await syncExtensionAuth(tokens);
      navigate('/');
    } catch (err) {
      let msg = getApiErrorMessage(err, '로그인에 실패했습니다.');
      msg = msg.replace(/^(Password|username|아이디|비밀번호):\s*/i, '');
      setGeneralError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'block h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-text-primary outline-none placeholder:text-text-secondary/35 transition focus:border-primary-signal/60 focus:ring-1 focus:ring-primary-signal/20';

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">

      {/* 왼쪽 브랜딩 — lg 이상에서만 표시 */}
      <div className="relative z-10 hidden w-1/2 flex-col justify-end p-16 lg:flex">
        <h1 className="text-6xl font-bold text-text-primary">SAN</h1>
        <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-text-secondary">
          지식 아카이브를 정밀하고 고요하게 키워나가세요.
        </p>
        <p className="mt-8 text-[11px] tracking-widest text-text-secondary/30">
          © 2026 SAN DIGITAL ARTIFACTS
        </p>
      </div>

      {/* 오른쪽 카드 */}
      <div className="relative z-10 flex w-full items-center justify-center px-4 py-10 sm:px-8 lg:w-1/2 lg:px-16">
        <div
          className="flex w-full max-w-[400px] flex-col justify-center rounded-3xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)', padding: '32px', height: '600px' }}
        >
          {/* 헤더 */}
          <h2 className="text-2xl font-bold text-text-primary sm:text-[32px]">로그인</h2>
          <p className="mb-5 mt-2 text-sm leading-relaxed text-text-secondary">
            아카이브에 접속하고 탐험을 계속하세요.
          </p>
          {/* GitHub 로그인 버튼 */}
          <button
            type="button"
            onClick={handleGithubLogin}
            className="relative flex h-14 w-full shrink-0 items-center rounded-xl text-sm font-bold text-white transition hover:opacity-85 active:scale-[0.98]"
            style={{ background: '#000000', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            {/* GitHub Octocat 아이콘 */}
            <span className="absolute left-4 flex h-8 w-8 items-center justify-center">
              <img src={githubSvg} alt="GitHub" className="h-6 w-6 brightness-0 invert" />
            </span>
            <span className="flex-1 text-center">GitHub 계정으로 로그인</span>
          </button>

          {/* 구분선 */}
          <div className="my-5 flex shrink-0 items-center gap-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[11px] text-text-secondary/50">Or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* 폼 */}
          <form className="space-y-3" onSubmit={handleSubmit}>

            {/* 아이디 */}
            <div className="shrink-0">
              <label className="mb-1.5 block text-xs font-bold text-text-secondary">
                아이디
              </label>
              <input
                type="text"
                placeholder="아이디 입력"
                value={username}
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1.5 min-h-[16px] text-[11px] text-red-400">
                {usernameError || ''}
              </p>
            </div>

            {/* 비밀번호 */}
            <div className="shrink-0">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold text-text-secondary">
                  비밀번호
                </label>
                {/* 비밀번호 찾기 - 추후 구현 예정 */}
                {/* <button
                  type="button"
                  className="text-xs text-primary-signal transition hover:opacity-70"
                >
                  비밀번호 찾기
                </button> */}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호 입력"
                  value={password}
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary/45 transition hover:text-text-secondary"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              <p className="mt-1.5 min-h-[16px] text-[11px] text-red-400">
                {passwordError || ''}
              </p>
            </div>

            <div className="pt-1 shrink-0">
              {/* 에러 메시지 (API 호출 실패 등) */}
              <p className="mb-2 min-h-[16px] text-center text-[11px] text-red-400">
                {generalError || ''}
              </p>

              {/* 로그인 버튼 */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-12 w-full rounded-xl bg-primary-signal text-sm font-bold text-background outline-none transition hover:brightness-110 focus:outline-none active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                style={{ boxShadow: '0 0 24px 0 rgba(0,255,194,0.25)' }}
              >
                {isSubmitting ? '접속 중...' : '로그인'}
              </button>
            </div>
          </form>

          {/* 회원가입 링크 */}
          <div className="mt-6">
            <p className="text-center text-sm text-text-secondary">
              계정이 없으신가요?{' '}
              <Link to="/signup" className="font-bold text-primary-signal hover:underline">
                회원가입
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* 하단 바 — 모바일에선 숨김 */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 hidden items-center justify-between px-8 py-4 lg:flex">
        <span className="text-[10px] tracking-widest text-text-secondary/30">© 2026 SAN TEAM</span>
        <div className="flex gap-5">
          <span className="text-[10px] tracking-widest text-text-secondary/30">개인정보 처리방침</span>
          <span className="text-[10px] tracking-widest text-text-secondary/30">이용약관</span>
        </div>
      </div>
    </div>
  );
}
