import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  useArchiveCardTagRelations,
  useArchiveCategories,
  useArchiveCategoryCards,
  useCardDetail,
} from '@san/shared';
import planetSource from '../../assets/ph1_real_sphere.png';
import type { GraphCategory, GraphLeaf } from './graph/types';
import {
  createCanopyLeafPositions,
  createPlanetMarkerPositions,
  createPlanetMarkerSpherePoints,
} from './graph/layout';
import { graphFixtureCategories, graphFixtureLeavesByCategory } from './graph/fixtures';

type Rotation = {
  x: number;
  y: number;
};

const restingRotationBase: Rotation = { x: -8, y: 18 };

export function KnowledgePlanetPrototype() {
  const [view, setView] = useState<'planet' | 'tree'>('planet');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedLeafId, setSelectedLeafId] = useState<string | null>(null);
  const [renderRotation, setRenderRotation] = useState<Rotation>(restingRotationBase);
  const [zoom, setZoom] = useState(1);
  const [isDraggingPlanet, setIsDraggingPlanet] = useState(false);
  const dragState = useRef<{ x: number; y: number; pointerId: number } | null>(null);
  const rotationRef = useRef<Rotation>(restingRotationBase);
  const targetRotationRef = useRef<Rotation>(restingRotationBase);
  const isDraggingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const inertiaFrameRef = useRef<number | null>(null);
  const velocityRef = useRef<Rotation>({ x: 0, y: 0 });
  const restingRotationRef = useRef<Rotation>(restingRotationBase);

  const categoriesQuery = useArchiveCategories();
  const cardsQuery = useArchiveCategoryCards(selectedCategoryId);
  const relationsQuery = useArchiveCardTagRelations(selectedLeafId);
  const detailQuery = useCardDetail(selectedLeafId);
  const useFixtureData = import.meta.env.DEV && import.meta.env.VITE_USE_GRAPH_FIXTURES !== 'false';

  const categories = useMemo<GraphCategory[]>(() => {
    const apiCategories = categoriesQuery.data?.categories;
    if (!apiCategories?.length && !useFixtureData) return [];

    if (!apiCategories?.length && useFixtureData) {
      const positions = createPlanetMarkerPositions(graphFixtureCategories.length);
      const spherePoints = createPlanetMarkerSpherePoints(graphFixtureCategories.length);

      return graphFixtureCategories.map((category, index) => ({
        ...category,
        position: positions[index],
        sphere: spherePoints[index],
      }));
    }

    const resolvedCategories = apiCategories ?? [];
    const positions = createPlanetMarkerPositions(resolvedCategories.length);
    const spherePoints = createPlanetMarkerSpherePoints(resolvedCategories.length);
    return resolvedCategories.map((category, index) => ({
      id: category.categoryId,
      name: category.categoryName,
      position: positions[index],
      sphere: spherePoints[index],
    }));
  }, [categoriesQuery.data?.categories, useFixtureData]);

  useEffect(() => {
    if (!categoriesQuery.data?.categories.length) return;
    if (categoriesQuery.data.categories.some((category) => category.categoryId === selectedCategoryId)) return;
    setSelectedCategoryId(categoriesQuery.data.categories[0].categoryId);
  }, [categoriesQuery.data?.categories, selectedCategoryId]);

  const leaves = useMemo<GraphLeaf[]>(() => {
    const apiCards = cardsQuery.data?.cards;
    if (!apiCards?.length && !useFixtureData) return [];

    if (!apiCards?.length && useFixtureData) {
      const fixtureLeaves = graphFixtureLeavesByCategory[selectedCategoryId ?? 'nature'] ?? [];
      const positions = createCanopyLeafPositions(fixtureLeaves.length);

      return fixtureLeaves.map((leaf, index) => ({
        ...leaf,
        position: positions[index],
      }));
    }

    const resolvedCards = apiCards ?? [];
    const positions = createCanopyLeafPositions(resolvedCards.length);
    return resolvedCards.map((card, index) => ({
      id: card.cardId,
      title: card.title,
      tags: card.tags.map((tag) => tag.tagName),
      collectedAt: formatArchiveDate(card.createdAt),
      position: positions[index],
    }));
  }, [cardsQuery.data?.cards, selectedCategoryId, useFixtureData]);

  const selectedLeaf = leaves.find((leaf) => leaf.id === selectedLeafId) ?? null;
  const relatedLeafIds = useMemo(() => {
    if (!selectedLeaf) return new Set<string>();
    const apiRelatedIds = relationsQuery.data?.relatedCards.map((card) => card.cardId);
    if (apiRelatedIds?.length) {
      return new Set(apiRelatedIds.filter((cardId) => leaves.some((leaf) => leaf.id === cardId)));
    }

    return new Set(
      leaves
        .filter((leaf) => leaf.id !== selectedLeaf.id && leaf.tags.some((tag) => selectedLeaf.tags.includes(tag)))
        .map((leaf) => leaf.id),
    );
  }, [leaves, relationsQuery.data?.relatedCards, selectedLeaf]);

  const hasFocus = Boolean(selectedLeaf);
  const sharedTagLinks = useMemo(() => {
    const links: Array<{ from: GraphLeaf; to: GraphLeaf; strength: number }> = [];

    if (selectedLeaf && relationsQuery.data?.relatedCards.length) {
      relationsQuery.data.relatedCards.forEach((relatedCard) => {
        const relatedLeaf = leaves.find((leaf) => leaf.id === relatedCard.cardId);
        if (!relatedLeaf) return;
        links.push({ from: selectedLeaf, to: relatedLeaf, strength: relatedCard.matchedTagCount });
      });
      return links;
    }

    leaves.forEach((from, index) => {
      leaves.slice(index + 1).forEach((to) => {
        const sharedTagCount = from.tags.filter((tag) => to.tags.includes(tag)).length;
        if (sharedTagCount > 0) links.push({ from, to, strength: sharedTagCount });
      });
    });

    return links;
  }, [leaves, relationsQuery.data?.relatedCards, selectedLeaf]);

  const handleBack = () => {
    if (selectedLeafId) {
      setSelectedLeafId(null);
      return;
    }
    setView('planet');
  };

  const handlePlanetPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button')) return;
    if (inertiaFrameRef.current !== null) {
      window.cancelAnimationFrame(inertiaFrameRef.current);
      inertiaFrameRef.current = null;
    }
    velocityRef.current = { x: 0, y: 0 };
    dragState.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };
    isDraggingRef.current = true;
    setIsDraggingPlanet(true);
    scheduleRotationRender();
  };

  const handlePlanetPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragState.current) return;
    if (dragState.current.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragState.current.x;
    const deltaY = event.clientY - dragState.current.y;
    dragState.current = { x: event.clientX, y: event.clientY, pointerId: event.pointerId };

    const inputX = -deltaY * 0.16;
    const inputY = deltaX * 0.24;

    targetRotationRef.current = {
      x: clamp(restingRotationRef.current.x + clamp(shortestAngleDelta(restingRotationRef.current.x, targetRotationRef.current.x) + inputX, -10, 10), -18, 8),
      y: restingRotationRef.current.y + clamp(targetRotationRef.current.y - restingRotationRef.current.y + inputY, -14, 14),
    };
    velocityRef.current = {
      x: lerp(velocityRef.current.x, inputX, 0.22),
      y: lerp(velocityRef.current.y, inputY, 0.22),
    };
    scheduleRotationRender();
  };

  const handlePlanetPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId !== event.pointerId) return;
    dragState.current = null;
    isDraggingRef.current = false;
    setIsDraggingPlanet(false);
    startInertia();
  };

  const handlePlanetWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    setZoom((current) => clamp(current - event.deltaY * 0.0012, 0.84, 1.18));
  };

  useEffect(() => () => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
    }
    if (inertiaFrameRef.current !== null) {
      window.cancelAnimationFrame(inertiaFrameRef.current);
    }
  }, []);

  const scheduleRotationRender = () => {
    if (animationFrameRef.current !== null) return;

    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null;
      rotationRef.current = {
        x: roundTo(lerpAngle(rotationRef.current.x, targetRotationRef.current.x, isDraggingRef.current ? 0.18 : 0.16), 3),
        y: roundTo(lerp(rotationRef.current.y, targetRotationRef.current.y, isDraggingRef.current ? 0.18 : 0.16), 3),
      };
      setRenderRotation({ ...rotationRef.current });

      const stillSettling =
        Math.abs(shortestAngleDelta(rotationRef.current.x, targetRotationRef.current.x)) > 0.08 ||
        Math.abs(rotationRef.current.y - targetRotationRef.current.y) > 0.08;

      if (stillSettling || dragState.current || inertiaFrameRef.current !== null) {
        scheduleRotationRender();
      } else {
        rotationRef.current = { ...targetRotationRef.current };
      }
    });
  };

  const startInertia = () => {
    const tick = () => {
      velocityRef.current = {
        x: roundTo(velocityRef.current.x * 0.72, 4),
        y: roundTo(velocityRef.current.y * 0.72, 4),
      };

      const hasMotion = Math.abs(velocityRef.current.x) > 0.04 || Math.abs(velocityRef.current.y) > 0.04;
      if (!hasMotion) {
        inertiaFrameRef.current = null;
        velocityRef.current = { x: 0, y: 0 };
        return;
      }

      targetRotationRef.current = {
        x: clamp(
          restingRotationRef.current.x +
            clamp(shortestAngleDelta(restingRotationRef.current.x, targetRotationRef.current.x) + velocityRef.current.x * 0.22, -10, 10),
          -18,
          8,
        ),
        y:
          restingRotationRef.current.y +
          clamp(targetRotationRef.current.y - restingRotationRef.current.y + velocityRef.current.y * 0.22, -14, 14),
      };
      scheduleRotationRender();
      inertiaFrameRef.current = window.requestAnimationFrame(tick);
    };

    inertiaFrameRef.current = window.requestAnimationFrame(tick);
  };

  return (
    <section className="relative min-h-[min(72vh,42rem)] overflow-hidden rounded-[32px] bg-[#101417] font-sans text-white">
      <SceneBackdrop />

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
        className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
          view === 'planet' ? 'scale-100 opacity-100' : 'pointer-events-none scale-150 opacity-0'
        }`}
      >
        <div
          className="group/planet relative aspect-square w-[min(72vw,32rem)] cursor-grab touch-none active:cursor-grabbing"
          onPointerDown={handlePlanetPointerDown}
          onPointerMove={handlePlanetPointerMove}
          onPointerUp={handlePlanetPointerUp}
          onPointerCancel={handlePlanetPointerUp}
          onWheel={handlePlanetWheel}
        >
          <div
            className={`pointer-events-none absolute inset-0 animate-[planet-float_12s_ease-in-out_infinite] ${
              isDraggingPlanet ? '' : 'transition-transform duration-500 ease-out'
            }`}
            style={{ transform: `scale(${zoom})` }}
          >
            <div
              className="absolute inset-0 transition-transform duration-500 ease-out group-hover/planet:scale-[1.02]"
              style={getPlanetContainerStyle(renderRotation)}
            >
              <div className="absolute inset-[-4%] rounded-full bg-[radial-gradient(circle,rgba(120,255,220,0.028)_0%,rgba(120,255,220,0.012)_38%,rgba(120,255,220,0)_72%)] blur-2xl transition-opacity duration-500 group-hover/planet:opacity-90" />
              <div className="absolute inset-0 overflow-hidden rounded-full shadow-[0_26px_78px_rgba(0,0,0,0.54),0_0_20px_rgba(120,255,220,0.028)] transition duration-500 group-hover/planet:brightness-[1.02]">
                <img
                  src={planetSource}
                  alt=""
                  aria-hidden="true"
                  className={`absolute inset-0 h-full w-full object-cover ${
                    isDraggingPlanet ? '' : 'transition-transform duration-200 ease-out'
                  }`}
                  style={getPlanetImageStyle(renderRotation)}
                />
                <div className="absolute inset-0 rounded-full" style={{ background: getPlanetImageShading(renderRotation) }} />
                <div className="absolute inset-0 rounded-full" style={{ background: getPlanetEdgeFalloff(renderRotation) }} />
                <div className="absolute inset-[1px] rounded-full bg-[radial-gradient(circle_at_18%_18%,rgba(165,232,255,0.045),transparent_16%),radial-gradient(circle_at_82%_82%,transparent_62%,rgba(0,0,0,0.1)_100%)] [mask-image:radial-gradient(circle_at_center,transparent_68%,black_96%)] [-webkit-mask-image:radial-gradient(circle_at_center,transparent_68%,black_96%)]" />
              </div>
            </div>
          </div>

          {categories.map((category) => {
            const projection = projectSpherePoint(category.sphere.latitude, category.sphere.longitude, renderRotation);

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => {
                  setSelectedCategoryId(category.id);
                  setSelectedLeafId(null);
                  setView('tree');
                }}
                className="group/marker absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{
                  top: `${projection.y}%`,
                  left: `${projection.x}%`,
                  opacity: projection.visible ? projection.opacity : 0,
                  transform: `translate(-50%, -50%) scale(${projection.scale})`,
                  pointerEvents: projection.visible ? 'auto' : 'none',
                } satisfies CSSProperties}
              >
                <span
                  className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(120,255,220,0.18)_0%,rgba(120,255,220,0.08)_38%,transparent_72%)] blur-[0.8px] transition duration-300 group-hover/marker:scale-110 group-hover/marker:opacity-100"
                  style={{
                    width: `${projection.glowSize}px`,
                    height: `${projection.glowSize}px`,
                    opacity: projection.markerOpacity,
                  }}
                />
                <span
                  className="pointer-events-none absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(173,255,240,0.16)] opacity-0 transition duration-300 group-hover/marker:animate-[marker-breath_1.8s_ease-out_infinite] group-hover/marker:opacity-100"
                  style={{
                    width: `${projection.pulseSize}px`,
                    height: `${projection.pulseSize}px`,
                  }}
                />
                <span
                  className="relative block rounded-full bg-[#d8fff8]/95 shadow-[0_0_7px_rgba(216,255,248,0.34)] transition duration-300 group-hover/marker:scale-110 group-hover/marker:bg-[#ebfffb] group-hover/marker:brightness-110 group-hover/marker:shadow-[0_0_10px_rgba(216,255,248,0.5)]"
                  style={{
                    width: `${projection.coreSize}px`,
                    height: `${projection.coreSize}px`,
                    opacity: projection.markerOpacity,
                  }}
                />
                <span className="pointer-events-none absolute left-1/2 top-5 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-white/78 opacity-0 shadow-[0_10px_26px_rgba(0,0,0,0.24)] backdrop-blur-md transition-all duration-300 group-hover/marker:translate-y-0 group-hover/marker:opacity-100">
                  {category.name}
                </span>
              </button>
            );
          })}

          {!categoriesQuery.isPending && categories.length === 0 ? (
            <div className="absolute inset-x-0 bottom-8 text-center text-sm text-white/45">
              표시할 아카이브 카테고리가 없습니다.
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={`absolute inset-0 transition-all duration-700 ${
          view === 'tree' ? 'scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0'
        }`}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-full w-full max-w-[58rem]">
            <TreeIllustration />

            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {sharedTagLinks.map(({ from, to, strength }) => (
                <line
                  key={`${from.id}-${to.id}`}
                  x1={parseFloat(from.position.left)}
                  y1={parseFloat(from.position.top)}
                  x2={parseFloat(to.position.left)}
                  y2={parseFloat(to.position.top)}
                  stroke="#00ffc2"
                  strokeOpacity={hasFocus ? getFocusedRelationOpacity(strength) : getRelationOpacity(strength)}
                  strokeDasharray="4 6"
                  strokeWidth={getRelationStrokeWidth(strength)}
                />
              ))}
            </svg>

            {leaves.map((leaf) => {
              const isSelected = leaf.id === selectedLeafId;
              const isRelated = relatedLeafIds.has(leaf.id);
              const isDimmed = hasFocus && !isSelected && !isRelated;

              return (
                <button
                  key={leaf.id}
                  type="button"
                  onClick={() => setSelectedLeafId(leaf.id)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 border px-4 py-3 text-left text-sm transition-all duration-300 ${
                    isSelected || isRelated
                      ? 'border-[#00ffc2]/80 bg-[#1e5056]/60 shadow-[0_0_28px_rgba(0,255,194,0.75)]'
                      : 'border-[#00ffc2]/30 bg-[#1e5056]/40 hover:bg-[#1e5056]/60 hover:shadow-[0_0_20px_rgba(0,255,194,0.4)]'
                  } ${isDimmed ? 'opacity-35 saturate-50' : 'opacity-100'}`}
                  style={{
                    top: leaf.position.top,
                    left: leaf.position.left,
                    borderRadius: '60% 40% 60% 40%',
                  }}
                >
                  <span className="block min-w-[6rem] text-xs font-medium text-white/90">{leaf.title}</span>
                </button>
              );
            })}

            {!cardsQuery.isPending && leaves.length === 0 ? (
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-sm text-white/45">
                이 카테고리에는 아직 지식 카드가 없습니다.
              </div>
            ) : null}
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
              <p className="mt-4 leading-7 text-white/75">
                {detailQuery.isPending
                  ? '요약을 불러오는 중입니다.'
                  : detailQuery.data?.summary?.trim()
                    ? detailQuery.data.summary
                    : selectedLeaf.summary ?? '이 카드의 요약은 아직 준비되지 않았습니다.'}
              </p>
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

function SceneBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(0,255,194,0.06),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(30,80,86,0.24),transparent_36%)]" />
      <div className="absolute left-1/2 top-1/2 h-[31rem] w-[31rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,255,194,0.18)_0%,rgba(0,255,194,0.08)_34%,rgba(0,255,194,0)_72%)] blur-2xl" />
      <div className="absolute left-1/2 top-1/2 h-[25rem] w-[25rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(133,255,220,0.1)_0%,rgba(133,255,220,0)_70%)] blur-xl" />
    </div>
  );
}

function TreeIllustration() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <radialGradient id="canopyGlow" cx="50%" cy="38%" r="45%">
          <stop offset="0%" stopColor="#00ffc2" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#00ffc2" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#315058" />
          <stop offset="100%" stopColor="#122328" />
        </linearGradient>
      </defs>
      <ellipse cx="50" cy="38" rx="31" ry="24" fill="url(#canopyGlow)" />
      <path d="M49 84 C48 73, 48 62, 50 50 C51 43, 49 36, 46 30" stroke="url(#trunkGradient)" strokeWidth="4.8" strokeLinecap="round" fill="none" />
      <path d="M50 58 C42 48, 34 42, 25 36" stroke="#234149" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M50 54 C58 46, 67 40, 76 33" stroke="#234149" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M49 67 C41 60, 35 57, 29 54" stroke="#1e373d" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M51 65 C58 58, 66 55, 72 50" stroke="#1e373d" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M50 83 C44 88, 38 90, 31 91" stroke="#183137" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M50 83 C57 88, 63 90, 70 91" stroke="#183137" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function formatArchiveDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function getRelationOpacity(strength: number) {
  return Math.min(0.22 + strength * 0.16, 0.82);
}

function getRelationStrokeWidth(strength: number) {
  return Math.min(0.28 + strength * 0.18, 1.1);
}

function getFocusedRelationOpacity(strength: number) {
  return Math.min(0.36 + strength * 0.2, 0.92);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function roundTo(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function shortestAngleDelta(from: number, to: number) {
  return wrapDegrees(to - from);
}

function lerpAngle(start: number, end: number, amount: number) {
  return wrapDegrees(start + shortestAngleDelta(start, end) * amount);
}

function projectSpherePoint(latitude: number, longitude: number, rotation: Rotation) {
  const lat = toRadians(latitude);
  const lon = toRadians(longitude + rotation.y);
  const pitch = toRadians(rotation.x);

  const x = Math.cos(lat) * Math.sin(lon);
  const yBase = Math.sin(lat);
  const zBase = Math.cos(lat) * Math.cos(lon);

  const y = yBase * Math.cos(pitch) - zBase * Math.sin(pitch);
  const z = yBase * Math.sin(pitch) + zBase * Math.cos(pitch);
  const visible = z > -0.08;
  const depth = clamp((z + 1) / 2, 0, 1);

  return {
    x: 50 + x * 38,
    y: 50 - y * 38,
    visible,
    scale: 0.72 + depth * 0.4,
    opacity: 0.28 + depth * 0.72,
    markerOpacity: 0.38 + depth * 0.56,
    coreSize: 2.2 + depth * 2.2,
    glowSize: 18 + depth * 12,
    pulseSize: 8 + depth * 6,
  };
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function wrapDegrees(value: number) {
  return ((value % 360) + 360) % 360 - 180;
}

function getPlanetImageShading(rotation: Rotation) {
  const lightX = clamp(30 + wrapDegrees(rotation.y) * 0.025, 27, 33);
  const lightY = clamp(24 - wrapDegrees(rotation.x) * 0.025, 21, 27);
  const shadowX = 100 - lightX;
  const shadowY = 100 - lightY;

  return [
    `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.045), transparent 18%)`,
    `radial-gradient(circle at ${shadowX}% ${shadowY}%, rgba(0,0,0,0.24), transparent 48%)`,
    'radial-gradient(circle at 50% 50%, transparent 60%, rgba(0,0,0,0.06) 78%, rgba(0,0,0,0.24) 100%)',
    'radial-gradient(ellipse at 68% 100%, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.12) 32%, transparent 60%)',
  ].join(',');
}

function getPlanetEdgeFalloff(rotation: Rotation) {
  const slowShiftX = clamp(50 - wrapDegrees(rotation.y) * 0.006, 48, 52);
  const slowShiftY = clamp(50 + wrapDegrees(rotation.x) * 0.004, 49, 51);

  return [
    `radial-gradient(circle at ${slowShiftX}% ${slowShiftY}%, transparent 56%, rgba(0,0,0,0.05) 74%, rgba(0,0,0,0.18) 100%)`,
  ].join(',');
}

function getPlanetContainerStyle(rotation: Rotation): CSSProperties {
  const tiltX = clamp((rotation.x - restingRotationBase.x) * 0.18, -2.8, 2.8);
  const tiltY = clamp((rotation.y - restingRotationBase.y) * 0.12, -3.2, 3.2);

  return {
    transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) rotateZ(-4deg) scaleY(0.975)`,
  };
}

function getPlanetImageStyle(rotation: Rotation): CSSProperties {
  const deltaX = rotation.x - restingRotationBase.x;
  const deltaY = rotation.y - restingRotationBase.y;
  const verticalScale = 1 - Math.abs(deltaX) * 0.0008;
  const verticalOffset = clamp(deltaX * -0.18, -0.8, 0.8);
  const horizontalOffset = clamp(deltaY * 0.18, -2.4, 2.4);

  return {
    transform: `scale(1.34) translate(${horizontalOffset}%, ${verticalOffset}%) scaleY(${verticalScale})`,
    objectPosition: '50% 50%',
    filter: 'saturate(0.98) contrast(1.02)',
  };
}
