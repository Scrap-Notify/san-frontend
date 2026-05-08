import { GitBranch, KeyRound, Sprout, UserRound } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '@san/shared';
import { authApi, authTokenStorage, githubAuthApi } from '@dashboard/api/client';
import { syncExtensionAuth } from '@dashboard/api/extensionAuth';

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
    window.location.href = githubAuthApi.getGithubAuthorizeUrl();
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
    <main className="auth-shell flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-background text-text-primary">
      <section className="w-full max-w-2xl min-w-0">
        <div className="rounded-leaf border border-text-secondary/20 bg-surface-low/50 p-xl shadow-neon-sm backdrop-blur-xl">
          <div className="mb-xl grid min-w-0 gap-dashboard-gap sm:grid-cols-[1fr_auto] sm:items-start">
            <div className="min-w-0">
              <p className="mb-sm text-caption-bold uppercase tracking-wide text-primary-signal">
                Create Account
              </p>
              <h1 className="text-h1-bold leading-tight">
                Create your archive
              </h1>
              <p className="mt-sm text-body-main text-text-secondary">
                Set up a SAN account for your knowledge workspace.
              </p>
            </div>

            <div className="hidden aspect-square w-14 shrink-0 items-center justify-center rounded-leaf bg-misty-teal text-primary-signal sm:flex">
              <Sprout size={20} />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGithubLogin}
            className="flex min-h-14 w-full items-center justify-center gap-sm rounded-leaf border border-text-secondary/30 px-lg py-md text-body-main-bold text-text-primary transition hover:border-primary-signal/50 hover:text-primary-signal hover:glow-neon"
          >
            <GitBranch size={20} />
            Continue with GitHub
          </button>

          <div className="my-xl flex items-center gap-md">
            <div className="h-px flex-1 bg-text-secondary/20" />
            <span className="text-caption-bold uppercase tracking-wide text-text-secondary">
              OR EMAIL
            </span>
            <div className="h-px flex-1 bg-text-secondary/20" />
          </div>

          <form className="space-y-dashboard-gap" onSubmit={handleSubmit}>
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
                  className="text-caption-bold uppercase tracking-wide text-primary-signal transition hover:text-text-primary disabled:cursor-not-allowed disabled:text-text-secondary/50"
                >
                  {usernameCheckStatus === 'checking' ? 'Checking...' : 'Check'}
                </button>
              }
            />
            {usernameMessage ? (
              <p
                className={[
                  '-mt-sm text-body-sm-bold',
                  usernameCheckStatus === 'available' ? 'text-primary-signal' : 'text-red-300',
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

            <label className="flex items-start gap-sm pt-sm text-body-sm text-text-secondary">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(event) => setAgreed(event.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-primary-signal"
              />
              <span>
                I agree to the{' '}
                <a href="#" className="text-primary-signal hover:text-text-primary">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary-signal hover:text-text-primary">
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {errorMessage ? (
              <p className="text-body-sm-bold text-red-300">{errorMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="!mt-xl flex min-h-14 w-full items-center justify-center rounded-leaf bg-primary-signal px-lg py-md text-body-lg-bold text-background shadow-neon transition hover:glow-neon"
            >
              {isSubmitting ? 'Signing up...' : 'Sign up'}
            </button>
          </form>

          <p className="mt-xl text-center text-body-sm text-text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary-signal hover:underline">
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
      <span className="mb-sm flex items-center justify-between gap-sm text-body-sm-bold uppercase tracking-wide text-text-secondary">
        {label}
        {action ? <span>{action}</span> : null}
      </span>

      <div className="flex min-w-0 items-center gap-sm border-b-2 border-text-secondary/30 px-xs py-md focus-within:border-primary-signal/70">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-6 min-w-0 flex-1 bg-transparent text-body-main text-text-primary outline-none placeholder:text-text-secondary/40"
        />
        <span className="shrink-0 text-text-secondary/40">
          {icon}
        </span>
      </div>
    </label>
  );
}
