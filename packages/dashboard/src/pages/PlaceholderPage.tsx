interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <section className="w-full min-w-0 py-10">
      <div className="w-full rounded-3xl border border-[#3a4a43]/30 bg-[#181c1f]/50 p-[clamp(1.5rem,3vw,2.5rem)]">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#00ffc2]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#fbfffa]">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#83958c]">{description}</p>
      </div>
    </section>
  );
}
