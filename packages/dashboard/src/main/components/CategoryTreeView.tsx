import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bareTreeSource from '../../assets/ph2_bare_tree_tp.png';
import type { GraphLeaf } from './graph/types';

type CategoryTreeViewProps = {
  leaves: GraphLeaf[];
  isPending: boolean;
  selectedCategoryId: string | null;
};

const leafPositions = [
  { x: 39, y: 25, rotate: -28, scale: 0.9, opacity: 0.86 },
  { x: 45, y: 22, rotate: 18, scale: 0.8, opacity: 0.8 },
  { x: 53, y: 20, rotate: -12, scale: 1, opacity: 1 },
  { x: 60, y: 26, rotate: 24, scale: 0.85, opacity: 0.84 },
  { x: 34, y: 34, rotate: -18, scale: 0.95, opacity: 0.9 },
  { x: 42, y: 37, rotate: 12, scale: 0.9, opacity: 0.86 },
  { x: 51, y: 35, rotate: -8, scale: 1.05, opacity: 0.98 },
  { x: 65, y: 38, rotate: 20, scale: 0.85, opacity: 0.82 },
  { x: 30, y: 45, rotate: -30, scale: 0.8, opacity: 0.72 },
  { x: 38, y: 48, rotate: 15, scale: 0.95, opacity: 0.88 },
  { x: 56, y: 47, rotate: -14, scale: 0.9, opacity: 0.84 },
  { x: 70, y: 48, rotate: 28, scale: 0.85, opacity: 0.76 },
  { x: 26, y: 38, rotate: -34, scale: 0.76, opacity: 0.64 },
  { x: 33, y: 55, rotate: -20, scale: 0.8, opacity: 0.68 },
  { x: 47, y: 53, rotate: 6, scale: 0.88, opacity: 0.78 },
  { x: 61, y: 55, rotate: 18, scale: 0.82, opacity: 0.7 },
  { x: 74, y: 58, rotate: 30, scale: 0.76, opacity: 0.62 },
  { x: 28, y: 28, rotate: -26, scale: 0.78, opacity: 0.66 },
  { x: 49, y: 28, rotate: -2, scale: 0.86, opacity: 0.82 },
  { x: 58, y: 32, rotate: 14, scale: 0.82, opacity: 0.76 },
  { x: 36, y: 41, rotate: -16, scale: 0.84, opacity: 0.78 },
  { x: 46, y: 43, rotate: 8, scale: 0.88, opacity: 0.82 },
  { x: 63, y: 44, rotate: 22, scale: 0.8, opacity: 0.72 },
  { x: 52, y: 60, rotate: 10, scale: 0.78, opacity: 0.66 },
];

export function CategoryTreeView({ leaves, isPending, selectedCategoryId }: CategoryTreeViewProps) {
  const navigate = useNavigate();
  const [activeLeafId, setActiveLeafId] = useState<string | null>(null);
  const visibleLeaves = leaves.slice(0, 24);
  const hiddenLeafCount = Math.max(leaves.length - 24, 0);
  const positionedLeaves = visibleLeaves.map((leaf, index) => ({
    leaf,
    position: leafPositions[index % leafPositions.length],
  }));
  const activeLeaf = activeLeafId ? visibleLeaves.find((leaf) => leaf.id === activeLeafId) ?? null : null;

  const relatedThreads = useMemo(() => {
    if (!activeLeaf) return [];

    return positionedLeaves
      .filter(({ leaf }) => leaf.id !== activeLeaf.id)
      .map(({ leaf, position }) => {
        const sharedTagCount = leaf.tags.filter((tag) => activeLeaf.tags.includes(tag)).length;
        if (sharedTagCount === 0) return null;

        const activePosition = positionedLeaves.find(({ leaf: candidate }) => candidate.id === activeLeaf.id)?.position;
        if (!activePosition) return null;

        return {
          id: `${activeLeaf.id}-${leaf.id}`,
          from: activePosition,
          to: position,
          strength: sharedTagCount,
        };
      })
      .filter((thread): thread is NonNullable<typeof thread> => thread !== null);
  }, [activeLeaf, positionedLeaves]);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative h-full w-full max-w-[58rem] overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(84vh,48rem)] w-[min(92vw,52rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,255,194,0.1)_0%,rgba(0,255,194,0.035)_34%,rgba(0,255,194,0)_72%)] blur-3xl" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-[min(82vh,44rem)] w-[min(92vw,52rem)] min-h-[35rem] overflow-hidden">
            <div className="absolute inset-0 animate-[tree-canopy-enter_1.05s_ease-out_both] overflow-hidden">
              <img
                src={bareTreeSource}
                alt=""
                aria-hidden="true"
                className="absolute left-1/2 top-[-10%] h-[132%] w-[132%] -translate-x-1/2 object-cover object-top"
              />
            </div>

            {activeLeaf ? (
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {relatedThreads.map(({ id, from, to, strength }) => {
                  const controlX = (from.x + to.x) / 2;
                  const controlY = Math.min(from.y, to.y) - 6;
                  return (
                    <path
                      key={id}
                      d={`M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`}
                      fill="none"
                      stroke="rgba(147,255,232,0.68)"
                      strokeLinecap="round"
                      strokeWidth={0.25 + strength * 0.12}
                      strokeOpacity={0.22 + strength * 0.14}
                    />
                  );
                })}
              </svg>
            ) : null}

            <div className="absolute inset-0">
              {positionedLeaves.map(({ leaf, position }, index) => (
                <button
                  key={leaf.id}
                  type="button"
                  onMouseEnter={() => setActiveLeafId(leaf.id)}
                  onMouseLeave={() => setActiveLeafId(null)}
                  onFocus={() => setActiveLeafId(leaf.id)}
                  onBlur={() => setActiveLeafId(null)}
                  onClick={() => navigate(`/cards/${leaf.id}`)}
                  className="group/tree-leaf absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 animate-[tree-leaf-enter_520ms_ease-out_both]"
                  style={{
                    top: `${position.y}%`,
                    left: `${position.x}%`,
                    opacity: position.opacity,
                    transform: `translate(-50%, -50%) scale(${position.scale}) rotate(${position.rotate}deg)`,
                    animationDelay: `${index * 70}ms`,
                  }}
                >
                  <span className="block h-3.5 w-6 rounded-[80%_20%_80%_20%] bg-[linear-gradient(135deg,rgba(189,255,240,0.96),rgba(56,181,145,0.92))] shadow-[0_0_7px_rgba(118,255,216,0.16)] transition duration-300 group-hover/tree-leaf:scale-[1.12] group-hover/tree-leaf:shadow-[0_0_10px_rgba(159,255,230,0.24)]" />
                  <span className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/78 opacity-0 shadow-[0_10px_26px_rgba(0,0,0,0.24)] backdrop-blur-md transition-all duration-300 group-hover/tree-leaf:translate-y-0 group-hover/tree-leaf:opacity-100">
                    {leaf.title}
                  </span>
                </button>
              ))}

              {hiddenLeafCount > 0 ? (
                <button
                  type="button"
                  onClick={() => console.info('Show more category cards', selectedCategoryId)}
                  className="absolute left-[72%] top-[59%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-xs text-white/78 backdrop-blur-sm transition hover:bg-white/[0.1]"
                >
                  +{hiddenLeafCount}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {!isPending && leaves.length === 0 ? (
          <div className="absolute inset-x-0 bottom-8 text-center">
            <p className="text-sm text-white/58">이 카테고리에는 아직 지식 카드가 없습니다.</p>
            <p className="mt-2 text-xs text-white/38">새 지식을 저장하면 가지 위에 잎이 자라납니다.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
