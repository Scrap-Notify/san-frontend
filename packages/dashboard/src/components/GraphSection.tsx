export function GraphSection() {
  return (
    <section className="grid min-h-[min(70vh,34rem)] w-full min-w-0 place-items-center overflow-hidden rounded-3xl border-2 border-dashed border-[#00ffc2]/45 bg-[#181c1f]/30 p-[clamp(1.5rem,4vw,4rem)] text-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
        <div className="max-w-xl">
          <p className="text-[clamp(1.5rem,4vw,2.75rem)] font-black leading-tight text-[#fbfffa]">
            준비중입니다.
          </p>
          <p className="mt-4 text-sm font-semibold leading-6 text-[#00ffc2] sm:text-base">
            2차 배포에서 만나볼 수 있습니다.
          </p>
        </div>
    </section>
  );
}
