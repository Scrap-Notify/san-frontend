import { GitBranch, KeyRound, Sprout, UserRound } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '@san/shared';
import { authApi, authTokenStorage } from '../api/client';
import { syncExtensionAuth } from '../api/extensionAuth';

type UsernameCheckStatus = 'idle' | 'checking' | 'available' | 'unavailable';

export function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [checkedUsername, setCheckedUsername] = useState('');
  const [usernameCheckStatus, setUsernameCheckStatus] = useState<UsernameCheckStatus>('idle');
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGithubLogin = () => {
    window.location.href = authApi.getGithubAuthorizeUrl();
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setCheckedUsername('');
    setUsernameCheckStatus('idle');
    setUsernameMessage(null);
  };

  const handleCheckUsername = async () => {
    const trimmedUsername = username.trim();
    setErrorMessage(null);
    setUsernameMessage(null);

    if (!trimmedUsername) {
      setUsernameCheckStatus('unavailable');
      setUsernameMessage('Archive ID is required');
      return;
    }

    setUsernameCheckStatus('checking');

    try {
      await authApi.checkUsername(trimmedUsername);
      setCheckedUsername(trimmedUsername);
      setUsernameCheckStatus('available');
      setUsernameMessage('Archive ID is available');
    } catch (error) {
      setCheckedUsername('');
      setUsernameCheckStatus('unavailable');
      setUsernameMessage(getApiErrorMessage(error, 'Archive ID is unavailable'));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    const trimmedUsername = username.trim();

    if (checkedUsername !== trimmedUsername || usernameCheckStatus !== 'available') {
      setErrorMessage('Please check Archive ID availability');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (!agreed) {
      setErrorMessage('Please agree to the terms');
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.signup({ username: trimmedUsername, password });
      const tokens = await authApi.login({ username: trimmedUsername, password });
      await authTokenStorage.setTokens(tokens);
      await syncExtensionAuth(tokens);
      navigate('/');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Sign up failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#101417] bg-[radial-gradient(circle_at_center,rgba(0,255,194,0.08),transparent_60%)] text-[#fbfffa]">
      <section className="w-full max-w-2xl min-w-0">
        <div className="rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg border border-[#3a4a43]/20 bg-[#181c1f]/50 p-[clamp(1.5rem,4vw,3rem)] shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mb-8 grid min-w-0 gap-5 sm:mb-10 sm:grid-cols-[1fr_auto] sm:items-start">
            <div className="min-w-0">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#00ffc2]">
                Create Account
              </p>
              <h1 className="text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
                Create your archive
              </h1>
              <p className="mt-3 text-base leading-relaxed text-[#b9cbc1] sm:text-lg">
                Set up a SAN account for your knowledge workspace.
              </p>
            </div>

            <div className="hidden aspect-square w-14 shrink-0 items-center justify-center rounded-bl-xl rounded-br-3xl rounded-tl-3xl rounded-tr-xl bg-[#1e5056]/45 text-[#00ffc2] sm:flex">
              <Sprout className="h-7 w-7" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGithubLogin}
            className="flex min-h-14 w-full items-center justify-center gap-3 rounded-full border border-[#3a4a43]/30 px-5 py-4 text-base font-bold text-[#e0e3e7] transition hover:border-[#00ffc2]/50 hover:text-[#00ffc2]"
          >
            <GitBranch size={20} />
            Continue with GitHub
          </button>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#3a4a43]/20" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#b9cbc1]">
              OR EMAIL
            </span>
            <div className="h-px flex-1 bg-[#3a4a43]/20" />
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Field
              label="Archive ID"
              type="text"
              placeholder="archive"
              icon={<UserRound className="h-5 w-5" />}
              value={username}
              onChange={handleUsernameChange}
              action={
                <button
                  type="button"
                  onClick={handleCheckUsername}
                  disabled={usernameCheckStatus === 'checking'}
                  className="text-xs font-bold uppercase tracking-wide text-[#00ffc2] transition hover:text-[#1affcb] disabled:cursor-not-allowed disabled:text-[#b9cbc1]/50"
                >
                  {usernameCheckStatus === 'checking' ? 'Checking...' : 'Check'}
                </button>
              }
            />
            {usernameMessage ? (
              <p
                className={[
                  '-mt-3 text-sm font-semibold',
                  usernameCheckStatus === 'available' ? 'text-[#00ffc2]' : 'text-red-300',
                ].join(' ')}
              >
                {usernameMessage}
              </p>
            ) : null}
            <Field
              label="Password"
              type="password"
              placeholder="********"
              icon={<KeyRound className="h-5 w-5" />}
              value={password}
              onChange={setPassword}
            />
            <Field
              label="Confirm Password"
              type="password"
              placeholder="********"
              icon={<KeyRound className="h-5 w-5" />}
              value={confirmPassword}
              onChange={setConfirmPassword}
            />

            <label className="flex items-start gap-3 pt-2 text-sm leading-6 text-[#b9cbc1]">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-[#00ffc2]"
              />
              <span>
                I agree to the{' '}
                <a href="#" className="text-[#baebf2] hover:text-[#00ffc2]">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-[#baebf2] hover:text-[#00ffc2]">
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {errorMessage ? (
              <p className="text-sm font-semibold text-red-300">{errorMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="!mt-8 flex min-h-14 w-full items-center justify-center rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg bg-[#00ffc2] px-5 py-4 text-xl font-black text-[#007255] shadow-[0_0_30px_rgba(0,255,194,0.3)] transition hover:scale-[1.01] hover:bg-[#1affcb] sm:text-2xl"
            >
              {isSubmitting ? 'Signing up...' : 'Sign up'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#b9cbc1]">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#00ffc2] hover:underline">
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  type,
  placeholder,
  icon,
  value,
  onChange,
  action,
}: {
  label: string;
  type: string;
  placeholder: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  action?: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 flex items-center justify-between gap-3 text-sm font-bold uppercase tracking-wide text-[#b9cbc1] sm:text-base">
        {label}
        {action ? <span>{action}</span> : null}
      </span>

      <div className="flex min-w-0 items-center gap-3 border-b-2 border-[#3a4a43]/30 px-1 py-4 focus-within:border-[#00ffc2]/70">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-6 min-w-0 flex-1 bg-transparent text-base text-[#fbfffa] outline-none placeholder:text-[#b9cbc1]/40 sm:text-lg"
        />
        <span className="shrink-0 text-[#b9cbc1]/40">
          {icon}
        </span>
      </div>
    </label>
  );
}
