import loginTreeImage from '../assets/login-tree.png';

export function LoginPage() {
  return (
    <main className="min-h-screen w-full overflow-hidden bg-[#101417] text-[#fbfffa]">
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left Brand Area */}
        <div className="relative hidden overflow-hidden lg:flex lg:items-center lg:justify-center">
          <img
            src={loginTreeImage}
            alt="SAN knowledge forest"
            className="absolute inset-0 h-full w-full object-cover opacity-70"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#101417]/25 to-[#101417]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#101417] via-transparent to-transparent" />

          <div className="relative z-10 flex -translate-y-2 flex-col items-center text-center">
            <div className="mb-8 flex h-[76px] w-[76px] items-center justify-center rounded-tl-[48px] rounded-br-[48px] rounded-bl-xl rounded-tr-xl border border-[#3a4a43]/30 bg-[#1e5056]/35 backdrop-blur-xl">
              <span className="text-4xl">🌿</span>
            </div>

            <h1 className="text-[104px] font-black leading-[0.9] tracking-tight">
              SAN
            </h1>

            <p className="mt-7 text-[32px] font-bold leading-tight text-[#d7e2dc]">
              당신의 지식 한 잎을 숲으로 확장하세요
            </p>
          </div>
        </div>

        {/* Right Login Area */}
        <div className="relative flex items-center justify-center px-8 py-12 lg:px-20 xl:px-28">
          <div className="absolute h-[560px] w-[560px] rounded-full bg-[#00ffc2]/5 blur-3xl" />

          <div className="relative z-10 w-full max-w-[520px]">
            <header className="mb-12">
              <h2 className="text-[40px] font-bold leading-tight text-[#fbfffa]">
                Welcome Back
              </h2>
              <p className="mt-3 max-w-[460px] text-[26px] leading-snug text-[#b9cbc1]">
                Enter the archive to continue your exploration.
              </p>
            </header>

            <button
              type="button"
              className="flex h-16 w-full items-center justify-center gap-3 rounded-tl-[48px] rounded-br-[48px] rounded-bl-xl rounded-tr-xl bg-[#fbfffa] text-lg font-bold text-[#101417] shadow-[0_20px_40px_rgba(251,255,250,0.1)] transition hover:scale-[1.01] hover:bg-white"
            >
              <span className="text-xl leading-none">●</span>
              Continue with GitHub
            </button>

            <div className="my-12 flex items-center gap-5">
              <div className="h-px flex-1 bg-[#3a4a43]/35" />
              <span className="whitespace-nowrap text-base font-bold uppercase tracking-[0.14em] text-[#b9cbc1]">
                OR LOCAL ACCESS
              </span>
              <div className="h-px flex-1 bg-[#3a4a43]/35" />
            </div>

            <form className="space-y-9">
              <label className="block">
                <span className="mb-3 block text-base font-bold uppercase tracking-[0.04em] text-[#b9cbc1]">
                  Archive ID
                </span>

                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@biolume.arca"
                    className="h-16 w-full bg-[#0b0f12] px-5 pr-14 text-lg text-[#fbfffa] outline-none placeholder:text-[#b9cbc1]/30 focus:ring-1 focus:ring-[#00ffc2]/60"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-xl text-[#b9cbc1]/40">
                    @
                  </span>
                </div>
              </label>

              <label className="block">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-base font-bold uppercase tracking-[0.04em] text-[#b9cbc1]">
                    Security Key
                  </span>
                  <button
                    type="button"
                    className="text-sm font-medium uppercase tracking-[0.04em] text-[#00ffc2]/75 transition hover:text-[#00ffc2]"
                  >
                    Forgot?
                  </button>
                </div>

                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="h-16 w-full bg-[#0b0f12] px-5 pr-14 text-lg text-[#fbfffa] outline-none placeholder:text-[#b9cbc1]/30 focus:ring-1 focus:ring-[#00ffc2]/60"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-lg text-[#b9cbc1]/40">
                    🔒
                  </span>
                </div>
              </label>

              <button
                type="submit"
                className="!mt-12 flex h-16 w-full items-center justify-center gap-8 rounded-tl-[48px] rounded-br-[48px] rounded-bl-xl rounded-tr-xl bg-[#00ffc2] text-[26px] font-bold text-black transition hover:scale-[1.01] hover:bg-[#1affcb]"
              >
                시작하기
                <span className="text-4xl leading-none">→</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}