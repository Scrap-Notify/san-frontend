import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  useArchiveCardTagRelations,
  useArchiveCategories,
  useArchiveCategoryCards,
  useCardDetail,
} from '@san/shared';
import planetImage from '../../assets/ph1_sphere.png';
import treeImage from '../../assets/ph2_tree.png';
import { graphCategories, graphLeavesByCategory } from './graph/mockGraphData';
import type { GraphCategory, GraphLeaf } from './graph/types';
import { createCanopyLeafPositions, createPlanetMarkerPositions } from './graph/layout';

export function KnowledgePlanetPrototype() {
  const [view, setView] = useState<'planet' | 'tree'>('planet');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedLeafId, setSelectedLeafId] = useState<string | null>(null);
  const categoriesQuery = useArchiveCategories();
  const cardsQuery = useArchiveCategoryCards(selectedCategoryId);
  const relationsQuery = useArchiveCardTagRelations(selectedLeafId);
  const detailQuery = useCardDetail(selectedLeafId);

  const categories = useMemo<GraphCategory[]>(() => {
    const apiCategories = categoriesQuery.data?.categories;
    if (!apiCategories?.length) {
      const fallbackPositions = createPlanetMarkerPositions(graphCategories.length);
      return graphCategories.map((category, index) => ({
        ...category,
        position: fallbackPositions[index] ?? category.position,
      }));
    }

    const positions = createPlanetMarkerPositions(apiCategories.length);

    return apiCategories.map((category, index) => ({
      id: category.categoryId,
      name: category.categoryName,
      position: positions[index],
    }));
  }, [categoriesQuery.data?.categories]);

  useEffect(() => {
    if (!categoriesQuery.data?.categories.length) return;
    if (categoriesQuery.data.categories.some((category) => category.categoryId === selectedCategoryId)) return;

    setSelectedCategoryId(categoriesQuery.data.categories[0].categoryId);
  }, [categoriesQuery.data?.categories, selectedCategoryId]);

  const leaves = useMemo<GraphLeaf[]>(() => {
    const apiCards = cardsQuery.data?.cards;
    if (!apiCards?.length) {
      const fallbackLeaves = graphLeavesByCategory[selectedCategoryId ?? 'nature'] ?? [];
      const fallbackPositions = createCanopyLeafPositions(fallbackLeaves.length);

      return fallbackLeaves.map((leaf, index) => ({
        ...leaf,
        position: fallbackPositions[index] ?? leaf.position,
      }));
    }

    const positions = createCanopyLeafPositions(apiCards.length);

    return apiCards.map((card, index) => ({
      id: card.cardId,
      title: card.title,
      tags: card.tags.map((tag) => tag.tagName),
      collectedAt: formatArchiveDate(card.createdAt),
      position: positions[index],
    }));
  }, [cardsQuery.data?.cards, selectedCategoryId]);

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

        links.push({
          from: selectedLeaf,
          to: relatedLeaf,
          strength: relatedCard.matchedTagCount,
        });
      });

      return links;
    }

    leaves.forEach((from, index) => {
      leaves.slice(index + 1).forEach((to) => {
        const sharedTagCount = from.tags.filter((tag) => to.tags.includes(tag)).length;
        if (sharedTagCount > 0) {
          links.push({ from, to, strength: sharedTagCount });
        }
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
              onClick={() => {
                setSelectedCategoryId(category.id);
                setSelectedLeafId(null);
                setView('tree');
              }}
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ top: category.position.top, left: category.position.left }}
            >
              <span className="block h-3 w-3 rounded-full bg-[#00ffc2] shadow-[0_0_18px_rgba(0,255,194,0.95)] transition duration-300 group-hover:scale-125" />
              <span className="absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap rounded-full border border-[#00ffc2]/20 bg-[#101417]/85 px-3 py-1 text-xs text-white/80 backdrop-blur-sm">
                {category.name}
              </span>
              <span className="pointer-events-none absolute left-1/2 top-11 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#00ffc2] px-3 py-1 text-xs font-semibold text-[#101417] opacity-0 transition duration-300 group-hover:opacity-100">
                {category.name} 보기
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
