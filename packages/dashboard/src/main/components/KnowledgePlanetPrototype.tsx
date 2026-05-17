import { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import planetImage from '../../assets/ph1_sphere.png';
import treeImage from '../../assets/ph2_tree.png';

type Category = {
  id: string;
  label: string;
  top: string;
  left: string;
};

type Leaf = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  collectedAt: string;
  top: string;
  left: string;
};

const categories: Category[] = [
  { id: 'nature', label: '자연', top: '23%', left: '34%' },
  { id: 'science', label: '과학', top: '34%', left: '62%' },
  { id: 'history', label: '역사', top: '55%', left: '28%' },
  { id: 'art', label: '예술', top: '59%', left: '70%' },
  { id: 'philosophy', label: '철학', top: '76%', left: '48%' },
];

const leaves: Leaf[] = [
  {
    id: 'cycle',
    title: '자연의 순환',
    summary: '모든 생명은 서로 연결되어 순환한다. 작은 시작이 모여 거대한 변화를 만든다.',
    tags: ['자연', '순환'],
    collectedAt: '2024.05.31',
    top: '24%',
    left: '38%',
  },
  {
    id: 'water',
    title: '물의 지혜',
    summary: '흐름은 가장 낮은 곳을 향하지만, 결국 가장 넓은 생태계를 살린다.',
    tags: ['자연', '순환'],
    collectedAt: '2024.05.24',
    top: '34%',
    left: '22%',
  },
  {
    id: 'light',
    title: '빛의 언어',
    summary: '빛은 닿는 곳마다 형태와 온도를 바꾸며 보이지 않던 결을 드러낸다.',
    tags: ['자연', '감각'],
    collectedAt: '2024.05.19',
    top: '18%',
    left: '62%',
  },
  {
    id: 'wind',
    title: '바람의 기억',
    summary: '보이지 않는 움직임도 흔적을 남긴다. 방향은 사라져도 변화는 남는다.',
    tags: ['감각', '기억'],
    collectedAt: '2024.05.12',
    top: '40%',
    left: '72%',
  },
  {
    id: 'time',
    title: '시간의 흐름',
    summary: '시간은 겹겹이 쌓여 풍경을 만들고, 우리는 그 층위 위를 걷는다.',
    tags: ['기억', '순환'],
    collectedAt: '2024.05.03',
    top: '58%',
    left: '58%',
  },
];

export function KnowledgePlanetPrototype() {
  const [view, setView] = useState<'planet' | 'tree'>('planet');
  const [selectedLeafId, setSelectedLeafId] = useState<string | null>(null);

  const selectedLeaf = leaves.find((leaf) => leaf.id === selectedLeafId) ?? null;
  const relatedLeafIds = useMemo(() => {
    if (!selectedLeaf) return new Set<string>();

    return new Set(
      leaves
        .filter((leaf) => leaf.id !== selectedLeaf.id && leaf.tags.some((tag) => selectedLeaf.tags.includes(tag)))
        .map((leaf) => leaf.id),
    );
  }, [selectedLeaf]);

  const sharedTagLinks = useMemo(() => {
    const links: Array<{ from: Leaf; to: Leaf }> = [];

    leaves.forEach((from, index) => {
      leaves.slice(index + 1).forEach((to) => {
        if (from.tags.some((tag) => to.tags.includes(tag))) {
          links.push({ from, to });
        }
      });
    });

    return links;
  }, []);

  const handleBack = () => {
    if (selectedLeafId) {
      setSelectedLeafId(null);
      return;
    }

    setView('planet');
  };

  return (
    <section className="relative min-h-[min(72vh,42rem)] overflow-hidden rounded-[32px] bg-[#101417] font-sans text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00ffc2]/10 blur-3xl" />
      </div>

      {view === 'tree' ? (
        <button
          type="button"
          onClick={handleBack}
          className="absolute left-5 top-5 z-30 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:border-[#00ffc2]/40 hover:text-[#00ffc2]"
        >
          <ArrowLeft size={16} />
          뒤로가기
        </button>
      ) : null}

      <div
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
          view === 'planet' ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <div className="relative aspect-square w-[min(72vw,32rem)] overflow-hidden rounded-full bg-[#101417] shadow-[0_0_60px_rgba(0,255,194,0.08)]">
          <img src={planetImage} alt="Knowledge Planet" className="h-full w-full object-cover" />

          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setView('tree')}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ top: category.top, left: category.left }}
            >
              <span className="block h-3 w-3 rounded-full bg-[#00ffc2] shadow-[0_0_18px_rgba(0,255,194,0.95)] transition duration-300 group-hover:scale-125" />
              <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#00ffc2]/20 bg-[#101417]/85 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
                {category.label}
              </span>
              <span className="pointer-events-none absolute left-1/2 top-11 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#00ffc2] px-3 py-1 text-xs font-semibold text-[#101417] opacity-0 transition duration-300 group-hover:opacity-100">
                {category.label} 보기
              </span>
            </button>
          ))}
        </div>
      </div>

      <div
        className={`absolute inset-0 transition-all duration-500 ${
          view === 'tree' ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-full w-full max-w-[58rem]">
            <img src={treeImage} alt="Knowledge Tree" className="absolute inset-0 h-full w-full object-contain" />

            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {sharedTagLinks.map(({ from, to }) => (
                <line
                  key={`${from.id}-${to.id}`}
                  x1={parseFloat(from.left)}
                  y1={parseFloat(from.top)}
                  x2={parseFloat(to.left)}
                  y2={parseFloat(to.top)}
                  stroke="#00ffc2"
                  strokeOpacity="0.3"
                  strokeDasharray="4 6"
                  strokeWidth="0.35"
                />
              ))}
            </svg>

            {leaves.map((leaf) => {
              const isSelected = leaf.id === selectedLeafId;
              const isRelated = relatedLeafIds.has(leaf.id);

              return (
                <button
                  key={leaf.id}
                  type="button"
                  onClick={() => setSelectedLeafId(leaf.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 border px-4 py-3 text-left text-sm transition-all duration-300 ${
                    isSelected || isRelated
                      ? 'border-[#00ffc2]/80 bg-[#1e5056]/60 shadow-[0_0_28px_rgba(0,255,194,0.75)]'
                      : 'border-[#00ffc2]/30 bg-[#1e5056]/40 hover:bg-[#1e5056]/60 hover:shadow-[0_0_20px_rgba(0,255,194,0.4)]'
                  }`}
                  style={{
                    top: leaf.top,
                    left: leaf.left,
                    borderRadius: '60% 40% 60% 40%',
                  }}
                >
                  <span className="block min-w-[6rem] text-xs font-medium text-white/90">{leaf.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <aside
          className={`absolute right-0 top-0 z-20 flex h-full w-full max-w-md flex-col justify-center border-l border-[#00ffc2]/10 bg-[#101417]/90 p-6 backdrop-blur-md transition-transform duration-500 ${
            selectedLeaf ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selectedLeaf ? (
            <div
              className="relative border border-[#00ffc2]/30 bg-[#1e5056]/40 p-6 shadow-[0_0_34px_rgba(0,255,194,0.18)]"
              style={{ borderRadius: '60% 40% 60% 40%' }}
            >
              <p className="mb-3 text-sm text-[#00ffc2]/80">Leaf Detail</p>
              <h3 className="text-2xl font-semibold">{selectedLeaf.title}</h3>
              <p className="mt-4 leading-7 text-white/75">{selectedLeaf.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {selectedLeaf.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#00ffc2]/10 px-3 py-1 text-sm text-[#00ffc2]">
                    #{tag}
                  </span>
                ))}
              </div>
              <p className="mt-5 text-sm text-white/55">수집일 {selectedLeaf.collectedAt}</p>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
