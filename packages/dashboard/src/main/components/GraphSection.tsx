export function GraphSection() {
  return (
    <div className="flex flex-col gap-dashboard-gap">
      <h2 className="text-h1-bold text-text-primary">나의 지식의 숲</h2>
      <section className="grid min-h-[min(70vh,34rem)] w-full min-w-0 place-items-center overflow-hidden rounded-leaf border-2 border-dashed border-primary-signal/45 bg-surface-low/30 p-xl text-center shadow-neon-sm">
          <div className="max-w-xl">
            <p className="text-h1-bold leading-tight text-text-primary">
              준비중입니다.
            </p>
            <p className="mt-md text-body-main-bold text-primary-signal">
              2차 배포에서 만나볼 수 있습니다.
            </p>
          </div>
      </section>
    </div>
  );
}
