import { useNavigate } from 'react-router-dom';
import bareTreeSource from '../../assets/ph2_bare_tree_tp.png';
import type { GraphLeaf } from './graph/types';

type CategoryTreeViewProps = {
  leaves: GraphLeaf[];
  isPending: boolean;
  selectedCategoryId: string | null;
};

const branchSlots = [
  { path: 'M48 58 C43 48, 36 34, 29 18', x: 29, y: 18, rotate: -28, scale: 0.9, opacity: 0.84 },
  { path: 'M49 57 C46 42, 44 26, 41 12', x: 41, y: 12, rotate: 14, scale: 1, opacity: 0.96 },
  { path: 'M50 56 C51 41, 53 27, 55 15', x: 55, y: 15, rotate: -8, scale: 1, opacity: 1 },
  { path: 'M51 57 C57 43, 63 31, 68 24', x: 68, y: 24, rotate: 21, scale: 0.92, opacity: 0.9 },
  { path: 'M47 61 C40 53, 34 43, 31 35', x: 31, y: 35, rotate: -18, scale: 0.86, opacity: 0.78 },
  { path: 'M50 60 C56 53, 61 45, 64 38', x: 64, y: 38, rotate: 18, scale: 0.88, opacity: 0.8 },
  { path: 'M46 63 C39 58, 31 53, 24 48', x: 24, y: 48, rotate: -30, scale: 0.82, opacity: 0.68 },
  { path: 'M52 63 C59 57, 68 53, 76 48', x: 76, y: 48, rotate: 28, scale: 0.82, opacity: 0.68 },
  { path: 'M48 59 C44 49, 41 40, 39 31', x: 39, y: 31, rotate: -14, scale: 0.9, opacity: 0.84 },
  { path: 'M51 59 C55 49, 58 39, 59 29', x: 59, y: 29, rotate: 16, scale: 0.9, opacity: 0.84 },
  { path: 'M47 64 C42 61, 37 57, 34 52', x: 34, y: 52, rotate: -18, scale: 0.84, opacity: 0.72 },
  { path: 'M52 64 C57 60, 63 56, 69 53', x: 69, y: 53, rotate: 18, scale: 0.84, opacity: 0.72 },
  { path: 'M49 58 C46 47, 45 37, 46 25', x: 46, y: 25, rotate: -4, scale: 0.92, opacity: 0.88 },
  { path: 'M51 58 C54 48, 55 39, 53 30', x: 53, y: 30, rotate: 8, scale: 0.92, opacity: 0.88 },
  { path: 'M48 65 C43 63, 39 61, 37 58', x: 37, y: 58, rotate: -14, scale: 0.82, opacity: 0.68 },
  { path: 'M52 65 C57 62, 61 60, 63 57', x: 63, y: 57, rotate: 14, scale: 0.82, opacity: 0.68 },
];

export function CategoryTreeView({ leaves, isPending, selectedCategoryId }: CategoryTreeViewProps) {
  const navigate = useNavigate();
  const visibleLeaves = leaves.slice(0, 16);
  const hiddenLeafCount = Math.max(leaves.length - 16, 0);

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

            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {visibleLeaves.map((leaf, index) => {
                const slot = branchSlots[index];
                return (
                  <path
                    key={`branch-${leaf.id}`}
                    d={slot.path}
                    pathLength={1}
                    className="animate-[tree-branch-grow_700ms_ease-out_both]"
                    style={{ animationDelay: `${index * 90}ms` }}
                    fill="none"
                    stroke="rgba(106, 150, 139, 0.82)"
                    strokeLinecap="round"
                    strokeWidth="0.65"
                    strokeDasharray="1"
                    strokeDashoffset="1"
                  />
                );
              })}
            </svg>

            <div className="absolute inset-0">
              {visibleLeaves.map((leaf, index) => {
                const slot = branchSlots[index];
                return (
                  <button
                    key={leaf.id}
                    type="button"
                    onClick={() => navigate(`/cards/${leaf.id}`)}
                    className="group/tree-leaf absolute cursor-pointer -translate-x-1/2 -translate-y-1/2 animate-[tree-leaf-enter_520ms_ease-out_both]"
                    style={{
                      top: `${slot.y}%`,
                      left: `${slot.x}%`,
                      opacity: slot.opacity,
                      transform: `translate(-50%, -50%) scale(${slot.scale}) rotate(${slot.rotate}deg)`,
                      animationDelay: `${index * 90 + 320}ms`,
                    }}
                  >
                    <span className="block h-3.5 w-6 rounded-[80%_20%_80%_20%] bg-[linear-gradient(135deg,rgba(189,255,240,0.96),rgba(56,181,145,0.92))] shadow-[0_0_7px_rgba(118,255,216,0.16)] transition duration-300 group-hover/tree-leaf:scale-[1.15] group-hover/tree-leaf:shadow-[0_0_10px_rgba(159,255,230,0.24)]" />
                    <span className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/78 opacity-0 shadow-[0_10px_26px_rgba(0,0,0,0.24)] backdrop-blur-md transition-all duration-300 group-hover/tree-leaf:translate-y-0 group-hover/tree-leaf:opacity-100">
                      {leaf.title}
                    </span>
                  </button>
                );
              })}

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
            <p className="mt-2 text-xs text-white/38">새 지식을 저장하면 가지 끝에 잎이 자라납니다.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
