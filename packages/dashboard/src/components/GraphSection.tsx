import { Archive, Brain, Database, GitBranch, Leaf, Network } from 'lucide-react';

type NodeCardProps = {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  active?: boolean;
  className?: string;
};

function NodeCard({ title, subtitle, icon, active = false, className = '' }: NodeCardProps) {
  return (
    <div
      className={[
        'flex min-h-36 flex-col items-start justify-center rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg border bg-[#1e5056]/35 p-[clamp(1.25rem,2vw,1.75rem)] backdrop-blur-xl',
        active
          ? 'border-[#00ffc2]/70 shadow-[0_0_12px_#00ffc2,0_0_48px_rgba(0,255,194,0.35)] lg:min-h-48'
          : 'border-[#00ffc2]/25',
        className,
      ].join(' ')}
    >
      <div className={active ? 'mb-4 text-[#00ffc2]' : 'mb-3 text-[#00ffc2]'}>{icon}</div>
      <p className="text-xs font-bold uppercase text-[#00ffc2]">{title}</p>
      <p className={active ? 'mt-1 text-sm text-[#fbfffa]' : 'mt-1 text-xs text-[#fbfffa]/55'}>
        {subtitle}
      </p>
    </div>
  );
}

function ClusterCard({
  title,
  subtitle,
  icon,
  className = '',
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        'flex min-h-28 items-center gap-4 rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg border border-[#3a4a43]/40 bg-[#262a2e]/80 p-[clamp(1.25rem,2vw,1.75rem)]',
        className,
      ].join(' ')}
    >
      <div className="text-[#00ffc2]">{icon}</div>
      <div>
        <p className="text-lg font-bold text-[#fbfffa]">{title}</p>
        <p className="text-xs text-[#b9cbc1]">{subtitle}</p>
      </div>
    </div>
  );
}

export function GraphSection() {
  return (
    <section className="relative w-full min-w-0 overflow-hidden rounded-3xl border border-[#3a4a43]/10 bg-[#181c1f]/30 p-[clamp(1.25rem,3vw,3rem)] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
      <svg
        className="pointer-events-none absolute inset-x-[12%] top-[18%] hidden h-1/2 w-3/5 text-[#00ffc2] opacity-60 lg:block"
        viewBox="0 0 760 360"
        fill="none"
      >
        <path
          d="M80 20 C80 120 280 80 280 160"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 6"
          opacity="0.7"
        />
        <path
          d="M480 20 C480 110 480 110 480 150"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.55"
        />
        <path
          d="M0 235 C0 310 120 285 120 340"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4 6"
          opacity="0.7"
        />
      </svg>

      <div className="relative z-10 grid w-full min-w-0 gap-[clamp(1rem,2vw,1.75rem)] sm:grid-cols-2 lg:grid-cols-3">
        <NodeCard title="LEAF 12.0" subtitle="Arboreal Tech" icon={<Leaf size={28} />} />
        <NodeCard
          active
          title="ACTIVE STEM"
          subtitle="AI Neural Net"
          icon={<Brain size={44} />}
          className="sm:row-span-2"
        />
        <NodeCard
          title="LEAF 08.4"
          subtitle="Bio-Storage"
          icon={<Database size={30} />}
          className="text-[#b9cbc1]"
        />
        <ClusterCard title="Project Emerald" subtitle="Cluster A-1" icon={<GitBranch size={24} />} />
        <ClusterCard title="Deep Roots Lab" subtitle="Cluster B-4" icon={<Network size={24} />} />
      </div>

      <div className="relative z-10 mx-auto mt-[clamp(1.25rem,3vw,2rem)] flex w-full min-w-0 max-w-md flex-col items-center justify-center rounded-bl-lg rounded-br-3xl rounded-tl-3xl rounded-tr-lg bg-[#00ffc2] p-[clamp(1.5rem,3vw,2.25rem)] text-center text-[#007255] shadow-[0_0_60px_rgba(0,255,194,0.35)]">
        <Archive size={32} />
        <p className="mt-3 text-xl font-black sm:text-2xl">THE ARCHIVE ROOT</p>
        <p className="mt-1 text-xs font-bold uppercase tracking-widest text-[#007255]/70">
          Foundational Intelligence
        </p>
      </div>

      <div className="absolute bottom-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-[#00ffc2]/0 via-[#00ffc2]/50 to-[#00ffc2]/0" />
    </section>
  );
}
