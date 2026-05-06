interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <section className="w-full min-w-0 py-[clamp(2rem,5vw,3.5rem)]">
      <div className="grid w-full gap-2 rounded-3xl border border-[#3a4a43]/30 bg-[#181c1f]/50 p-[clamp(1.5rem,3vw,2.5rem)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#00ffc2]">
          {eyebrow}
        </p>
        <h1 className="text-3xl font-black tracking-tight text-[#fbfffa] sm:text-4xl">{title}</h1>
        <p className="max-w-2xl text-sm leading-6 text-[#83958c]">{description}</p>
      </div>
    </section>
  );
}
