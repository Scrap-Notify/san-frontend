import {
  Brain,
  Database,
  GitBranch,
  Leaf,
  Network,
  Archive,
} from 'lucide-react';

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
        'absolute flex flex-col items-start justify-center rounded-tl-[48px] rounded-br-[48px] rounded-tr-lg rounded-bl-lg border bg-[#1e5056]/35 backdrop-blur-xl',
        active
          ? 'h-[170px] w-[180px] border-[#00ffc2]/70 p-8 shadow-[0_0_12px_#00ffc2,0_0_48px_rgba(0,255,194,0.35)]'
          : 'h-[118px] w-[122px] border-[#00ffc2]/25 p-6',
        className,
      ].join(' ')}
    >
      <div className={active ? 'mb-4 text-[#00ffc2]' : 'mb-3 text-[#00ffc2]'}>
        {icon}
      </div>
      <p className="text-xs font-bold uppercase text-[#00ffc2]">{title}</p>
      <p className={active ? 'mt-1 text-sm text-[#fbfffa]' : 'mt-1 text-[10px] text-[#fbfffa]/55'}>
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
        'absolute flex h-[86px] w-[256px] items-center gap-4 rounded-tl-[40px] rounded-br-[40px] rounded-tr-lg rounded-bl-lg border border-[#3a4a43]/40 bg-[#262a2e]/80 px-10 py-5',
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
    <section className="relative h-[800px] w-full overflow-hidden rounded-[48px] border border-[#3a4a43]/10 bg-[#181c1f]/30 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
      {/* dotted connection lines */}
      <svg
        className="absolute left-[120px] top-[270px] h-[360px] w-[760px]"
        viewBox="0 0 760 360"
        fill="none"
      >
        <path
          d="M80 20 C80 120 280 80 280 160"
          stroke="#00FFC2"
          strokeWidth="2"
          strokeDasharray="4 6"
          opacity="0.7"
        />
        <path
          d="M480 20 C480 110 480 110 480 150"
          stroke="#00FFC2"
          strokeWidth="2"
          opacity="0.55"
        />
        <path
          d="M0 235 C0 310 120 285 120 340"
          stroke="#00FFC2"
          strokeWidth="2"
          strokeDasharray="4 6"
          opacity="0.7"
        />
      </svg>

      {/* glow dots */}
      <div className="absolute left-[330px] top-[190px] h-2 w-2 rounded-full bg-[#00ffc2] shadow-[0_0_12px_#00ffc2]" />
      <div className="absolute left-[870px] top-[390px] h-2 w-2 rounded-full bg-[#00ffc2] shadow-[0_0_12px_#00ffc2]" />
      <div className="absolute left-[660px] top-[520px] h-2 w-2 rounded-full bg-[#00ffc2] shadow-[0_0_12px_#00ffc2]" />

      <NodeCard
        title="LEAF 12.0"
        subtitle="Arboreal Tech"
        icon={<Leaf size={28} />}
        className="left-[140px] top-[150px]"
      />

      <NodeCard
        active
        title="ACTIVE STEM"
        subtitle="AI Neural Net"
        icon={<Brain size={44} />}
        className="left-1/2 top-[100px] -translate-x-1/2"
      />

      <NodeCard
        title="LEAF 08.4"
        subtitle="Bio-Storage"
        icon={<Database size={30} />}
        className="right-[140px] top-[170px] text-[#b9cbc1]"
      />

      <ClusterCard
        title="Project Emerald"
        subtitle="Cluster A-1"
        icon={<GitBranch size={24} />}
        className="left-[330px] top-[440px]"
      />

      <ClusterCard
        title="Deep Roots Lab"
        subtitle="Cluster B-4"
        icon={<Network size={24} />}
        className="right-[310px] top-[440px]"
      />

      <div className="absolute bottom-[36px] left-1/2 flex h-[132px] w-[336px] -translate-x-1/2 flex-col items-center justify-center rounded-tl-[48px] rounded-br-[48px] rounded-tr-lg rounded-bl-lg bg-[#00ffc2] text-[#007255] shadow-[0_0_60px_rgba(0,255,194,0.35)]">
        <Archive size={32} />
        <p className="mt-3 text-2xl font-black">THE ARCHIVE ROOT</p>
        <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-[#007255]/70">
          Foundational Intelligence
        </p>
      </div>

      <div className="absolute bottom-0 left-1/2 h-1 w-64 -translate-x-1/2 bg-gradient-to-r from-[#00ffc2]/0 via-[#00ffc2]/50 to-[#00ffc2]/0" />
    </section>
  );
}