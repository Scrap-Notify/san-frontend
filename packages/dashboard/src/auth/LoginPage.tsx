import { GitBranch, KeyRound, Mail, Sprout } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '@san/shared';
import { authApi, authTokenStorage, githubAuthApi } from '../api/client';
import { syncExtensionAuth } from '../api/extensionAuth';
import loginTreeImage from '../assets/login-tree.png';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGithubLogin = () => {
    window.location.href = githubAuthApi.getGithubAuthorizeUrl();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const tokens = await authApi.login({ username, password });
      await authTokenStorage.setTokens(tokens);
      await syncExtensionAuth(tokens);
      navigate('/');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Login failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-background text-text-primary">
      <section className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
        <div className="hidden min-w-0 overflow-hidden lg:grid">
          <img
            src={loginTreeImage}
            alt="SAN knowledge forest"
            className="col-start-1 row-start-1 h-full min-h-screen w-full object-cover opacity-70"
          />
          <div className="col-start-1 row-start-1 bg-gradient-to-r from-transparent via-background/25 to-background" />
          <div className="col-start-1 row-start-1 bg-gradient-to-t from-background via-transparent to-transparent" />

          <div className="col-start-1 row-start-1 flex w-full max-w-xl place-self-center flex-col items-center px-xl text-center">
            <div className="mb-xl flex aspect-square w-16 items-center justify-center rounded-leaf border border-text-secondary/30 bg-misty-teal backdrop-blur-xl xl:w-20">
              <Sprout size={32} className="text-primary-signal" />
            </div>
            <h1 className="text-h1-bold leading-none">SAN</h1>
            <p className="mt-lg text-body-lg-bold text-text-primary">
              Grow your knowledge archive.
            </p>
          </div>
        </div>

        <div className="auth-shell flex min-h-screen min-w-0 items-center justify-center bg-primary-signal/5">
          <div className="w-full max-w-xl rounded-leaf border border-text-secondary/20 bg-surface-low/35 p-xl shadow-neon-sm backdrop-blur-xl lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <header className="mb-xl">
              <p className="mb-sm text-caption-bold uppercase tracking-wide text-primary-signal">
                Welcome Back
              </p>
              <h2 className="text-h1-bold text-text-primary">
                Login
              </h2>
              <p className="mt-sm text-body-main text-text-secondary">
                Enter your archive and continue exploring.
              </p>
            </header>

            <button
              type="button"
              onClick={handleGithubLogin}
              className="flex min-h-14 w-full items-center justify-center gap-sm rounded-leaf bg-text-primary px-lg py-md text-body-main-bold text-background transition hover:glow-neon"
            >
              <GitBranch size={20} />
              Continue with GitHub
            </button>

            <div className="my-xl flex items-center gap-md">
              <div className="h-px flex-1 bg-text-secondary/35" />
              <span className="whitespace-nowrap text-caption-bold uppercase tracking-wide text-text-secondary">
                OR LOCAL ACCESS
              </span>
              <div className="h-px flex-1 bg-text-secondary/35" />
            </div>

            <form className="space-y-dashboard-gap" onSubmit={handleSubmit}>
              <Field
                label="Archive ID"
                type="text"
                placeholder="archive"
                icon={<Mail className="h-5 w-5" />}
                value={username}
                onChange={setUsername}
              />
              <Field
                label="Security Key"
                type="password"
                placeholder="********"
                icon={<KeyRound className="h-5 w-5" />}
                action={<button type="button">Forgot?</button>}
                value={password}
                onChange={setPassword}
              />

              {errorMessage ? (
                <p className="text-body-sm-bold text-red-300">{errorMessage}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="!mt-xl flex min-h-14 w-full items-center justify-center gap-sm rounded-leaf bg-primary-signal px-lg py-md text-body-lg-bold text-background transition hover:glow-neon"
              >
                {isSubmitting ? 'Starting...' : 'Start'}
                <Sprout size={20} />
              </button>
            </form>

            <p className="mt-xl text-center text-body-sm text-text-secondary">
              Need an account?{' '}
              <Link to="/signup" className="font-bold text-primary-signal hover:underline">
                Sign up
              </Link>
            </p>
          </div>
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
  action,
  value,
  onChange,
}: {
  label: string;
  type: string;
  placeholder: string;
  icon: ReactNode;
  action?: ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-3 flex items-center justify-between gap-3 text-sm font-bold uppercase tracking-wide text-[#b9cbc1] sm:text-base">
        <span>{label}</span>
        {action ? (
          <span className="text-xs font-medium tracking-wide text-[#00ffc2]/75 transition hover:text-[#00ffc2] sm:text-sm">
            {action}
          </span>
        ) : null}
      </span>

      <div className="relative min-w-0">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-14 w-full bg-[#0b0f12] px-5 py-4 pr-14 text-base text-[#fbfffa] outline-none placeholder:text-[#b9cbc1]/30 focus:ring-1 focus:ring-[#00ffc2]/60 sm:text-lg"
        />
        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[#b9cbc1]/40">
          {icon}
        </span>
      </div>
    </label>
  );
}
