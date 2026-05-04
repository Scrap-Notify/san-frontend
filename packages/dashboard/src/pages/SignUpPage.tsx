import { GitBranch, KeyRound, Mail, Sprout, UserRound } from 'lucide-react';
import { type FormEvent, type ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi, authTokenStorage } from '../api/client';

export function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

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
      await authApi.signup({ username, password });
      const tokens = await authApi.login({ username, password });
      await authTokenStorage.setTokens(tokens);
      navigate('/');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Sign up failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-shell flex min-h-screen w-full items-center justify-center overflow-x-hidden bg-[#101417] text-[#fbfffa]">
      <section className="relative w-full max-w-2xl min-w-0">
        <div className="pointer-events-none absolute left-0 top-4 aspect-square w-24 rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg bg-[#00ffc2]/30 blur-2xl sm:w-32" />
        <div className="pointer-events-none absolute bottom-0 right-0 aspect-square w-28 rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg bg-[#00ffc2]/20 blur-2xl sm:w-40" />

        <div className="relative rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg border-l border-t border-[#3a4a43]/20 bg-[#181c1f]/50 p-[clamp(1.5rem,4vw,3rem)] shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mb-8 flex min-w-0 items-start justify-between gap-5 sm:mb-10">
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
              onChange={setUsername}
            />
            <Field
              label="Email"
              type="email"
              placeholder="name@example.com"
              icon={<Mail className="h-5 w-5" />}
              value={email}
              onChange={setEmail}
            />
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
}: {
  label: string;
  type: string;
  placeholder: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-sm font-bold uppercase tracking-wide text-[#b9cbc1] sm:text-base">
        {label}
      </span>

      <div className="relative min-w-0">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-14 w-full rounded-none border-b-2 border-[#3a4a43]/30 bg-transparent px-1 py-4 pr-12 text-base text-[#fbfffa] outline-none placeholder:text-[#b9cbc1]/40 focus:border-[#00ffc2]/70 sm:text-lg"
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[#b9cbc1]/40">
          {icon}
        </span>
      </div>
    </label>
  );
}
