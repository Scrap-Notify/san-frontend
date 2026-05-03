interface PlaceholderPageProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PlaceholderPage({ eyebrow, title, description }: PlaceholderPageProps) {
  return (
    <section className="py-10">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#00ffc2]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#fbfffa]">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#83958c]">
          {description}
        </p>
      </div>
    </section>
  );
}
