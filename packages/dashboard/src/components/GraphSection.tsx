export function GraphSection() {
  return (
    <section className="px-8 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#00ffc2]">
            Recall Map
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#fbfffa]">
            Knowledge dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#83958c]">
            Saved scraps are organized into cards and will be connected here as the graph view grows.
          </p>
        </div>
        <div className="hidden h-24 w-24 items-center justify-center rounded-leaf border border-[#00ffc2]/20 bg-[#00ffc2]/5 text-xs font-bold text-[#00ffc2] md:flex">
          SAN
        </div>
      </div>
    </section>
  );
}
