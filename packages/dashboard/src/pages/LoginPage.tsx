import { GitBranch, KeyRound, Mail, Sprout } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiErrorMessage } from '@san/shared';
import { authApi, authTokenStorage } from '../api/client';
import loginTreeImage from '../assets/login-tree.png';

export function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGithubLogin = () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = authApi.getGithubAuthorizeUrl();
    document.body.appendChild(form);
    form.submit();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const tokens = await authApi.login({ username, password });
      await authTokenStorage.setTokens(tokens);
      navigate('/');
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Login failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#101417] text-[#fbfffa]">
      <section className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
        <div className="relative hidden min-w-0 overflow-hidden lg:flex lg:items-center lg:justify-center">
          <img
            src={loginTreeImage}
            alt="SAN knowledge forest"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#101417]/25 to-[#101417]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101417] via-transparent to-transparent" />

          <div className="relative z-10 flex w-full max-w-xl flex-col items-center px-[clamp(2rem,5vw,5rem)] text-center">
            <div className="mb-8 flex aspect-square w-16 items-center justify-center rounded-bl-xl rounded-br-3xl rounded-tl-3xl rounded-tr-xl border border-[#3a4a43]/30 bg-[#1e5056]/35 backdrop-blur-xl xl:w-20">
              <Sprout className="h-8 w-8 text-[#00ffc2] xl:h-10 xl:w-10" />
            </div>
            <h1 className="text-6xl font-black leading-none tracking-tight xl:text-8xl">SAN</h1>
            <p className="mt-6 text-xl font-bold leading-tight text-[#d7e2dc] xl:text-3xl">
              Grow your knowledge archive.
            </p>
          </div>
        </div>

        <div className="auth-shell relative flex min-h-screen min-w-0 items-center justify-center">
          <div className="pointer-events-none absolute aspect-square w-4/5 max-w-xl rounded-full bg-[#00ffc2]/5 blur-3xl" />

          <div className="relative z-10 w-full max-w-xl rounded-3xl border border-[#3a4a43]/20 bg-[#181c1f]/35 p-[clamp(1.5rem,4vw,2.5rem)] shadow-[0_30px_90px_rgba(0,0,0,0.25)] backdrop-blur-xl lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <header className="mb-8 sm:mb-10">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-[#00ffc2]">
                Welcome Back
              </p>
              <h2 className="text-3xl font-bold leading-tight text-[#fbfffa] sm:text-4xl">
                Login
              </h2>
              <p className="mt-3 text-base leading-relaxed text-[#b9cbc1] sm:text-xl">
                Enter your archive and continue exploring.
              </p>
            </header>

            <button
              type="button"
              onClick={handleGithubLogin}
              className="flex min-h-14 w-full items-center justify-center gap-3 rounded-bl-xl rounded-br-3xl rounded-tl-3xl rounded-tr-xl bg-[#fbfffa] px-5 py-4 text-base font-bold text-[#101417] shadow-[0_20px_40px_rgba(251,255,250,0.1)] transition hover:scale-[1.01] hover:bg-white sm:text-lg"
            >
              <GitBranch className="h-5 w-5" />
              Continue with GitHub
            </button>

            <div className="my-8 flex items-center gap-4 sm:my-10">
              <div className="h-px flex-1 bg-[#3a4a43]/35" />
              <span className="whitespace-nowrap text-xs font-bold uppercase tracking-widest text-[#b9cbc1]">
                OR LOCAL ACCESS
              </span>
              <div className="h-px flex-1 bg-[#3a4a43]/35" />
            </div>

            <form className="space-y-6 sm:space-y-7" onSubmit={handleSubmit}>
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
                <p className="text-sm font-semibold text-red-300">{errorMessage}</p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="!mt-9 flex min-h-14 w-full items-center justify-center gap-3 rounded-bl-xl rounded-br-3xl rounded-tl-3xl rounded-tr-xl bg-[#00ffc2] px-5 py-4 text-xl font-bold text-black transition hover:scale-[1.01] hover:bg-[#1affcb] sm:text-2xl"
              >
                {isSubmitting ? 'Starting...' : 'Start'}
                <Sprout className="h-6 w-6" />
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-[#b9cbc1]">
              Need an account?{' '}
              <Link to="/signup" className="font-bold text-[#00ffc2] hover:underline">
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
