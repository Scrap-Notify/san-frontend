import { useMemo, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import bareTreeSource from '../../assets/ph2_bare_tree_tp.png';
import type { GraphLeaf } from './graph/types';

type CategoryTreeViewProps = {
  leaves: GraphLeaf[];
  isPending: boolean;
  selectedCategoryId: string | null;
};

const branchTips = [
  { x: 28, y: 17, rotate: -28, scale: 0.9, opacity: 0.82 },
  { x: 39, y: 11, rotate: 16, scale: 1, opacity: 0.96 },
  { x: 51, y: 13, rotate: -8, scale: 1.02, opacity: 1 },
  { x: 63, y: 18, rotate: 18, scale: 0.92, opacity: 0.9 },
  { x: 73, y: 26, rotate: 28, scale: 0.86, opacity: 0.78 },
  { x: 23, y: 31, rotate: -34, scale: 0.84, opacity: 0.72 },
  { x: 34, y: 30, rotate: -18, scale: 0.9, opacity: 0.84 },
  { x: 46, y: 26, rotate: 10, scale: 0.96, opacity: 0.92 },
  { x: 58, y: 29, rotate: 18, scale: 0.94, opacity: 0.88 },
  { x: 69, y: 36, rotate: 26, scale: 0.88, opacity: 0.8 },
  { x: 30, y: 41, rotate: -20, scale: 0.86, opacity: 0.76 },
  { x: 41, y: 38, rotate: -8, scale: 0.92, opacity: 0.86 },
  { x: 53, y: 39, rotate: 10, scale: 0.94, opacity: 0.88 },
  { x: 64, y: 45, rotate: 20, scale: 0.88, opacity: 0.78 },
  { x: 38, y: 50, rotate: -14, scale: 0.84, opacity: 0.7 },
  { x: 56, y: 51, rotate: 14, scale: 0.86, opacity: 0.74 },
];

export function CategoryTreeView({ leaves, isPending, selectedCategoryId }: CategoryTreeViewProps) {
  const navigate = useNavigate();
  const visibleLeaves = leaves.slice(0, 16);
  const hiddenLeafCount = Math.max(leaves.length - 16, 0);
  const leafNodes = useMemo(
    () =>
      visibleLeaves.map((leaf, index) => ({
        leaf,
        position: branchTips[index % branchTips.length],
      })),
    [visibleLeaves],
  );

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
                className="absolute left-1/2 top-[-8%] h-[128%] w-[128%] -translate-x-1/2 object-cover object-top"
              />
            </div>

            <div className="absolute inset-0">
              {leafNodes.map(({ leaf, position }, index) => (
                <button
                  key={leaf.id}
                  type="button"
                  onClick={() => navigate(`/cards/${leaf.id}`)}
                  className="group/tree-leaf absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 animate-[tree-leaf-enter_520ms_ease-out_both]"
                  style={
                    {
                      top: `${position.y}%`,
                      left: `${position.x}%`,
                      opacity: position.opacity,
                      transform: `translate(-50%, -50%) scale(${position.scale}) rotate(${position.rotate}deg)`,
                      animationDelay: `${index * 90}ms`,
                    } satisfies CSSProperties
                  }
                >
                  <span className="block h-3.5 w-6 rounded-[80%_20%_80%_20%] bg-[linear-gradient(135deg,rgba(189,255,240,0.96),rgba(56,181,145,0.92))] shadow-[0_0_7px_rgba(118,255,216,0.16)] transition duration-300 group-hover/tree-leaf:scale-[1.15] group-hover/tree-leaf:shadow-[0_0_10px_rgba(159,255,230,0.24)]" />
                  <span className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/78 opacity-0 shadow-[0_10px_26px_rgba(0,0,0,0.24)] backdrop-blur-md transition-all duration-300 group-hover/tree-leaf:translate-y-0 group-hover/tree-leaf:opacity-100">
                    {leaf.title}
                  </span>
                </button>
              ))}

              {hiddenLeafCount > 0 ? (
                <button
                  type="button"
                  onClick={() => console.info('Show more category cards', selectedCategoryId)}
                  className="absolute left-[71%] top-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/12 bg-white/[0.07] px-3 py-1 text-xs text-white/78 backdrop-blur-sm transition hover:bg-white/[0.1]"
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
            <p className="mt-2 text-xs text-white/38">새 지식을 저장하면 가지 끝에 잎이 자라납니다.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
