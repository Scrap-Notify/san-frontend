import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Archive,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Eye,
  Sparkles,
  Star,
} from 'lucide-react';
import { getApiErrorMessage } from '@san/shared';
import { CurvedButton, EmptyState, IconBox, TagBadge } from '@san/ui';
import { githubApi } from '../../api/client';

type ImportStage = 'idle' | 'loading' | 'ready';

interface MockRecommendation {
  id: string;
  title: string;
  url: string;
  repository: string;
  reason: string;
  tags: string[];
  score: number;
}

const MOCK_STAR_SOURCES = [
  'vercel/next.js',
  'facebook/react',
  'microsoft/TypeScript',
  'tailwindlabs/tailwindcss',
  'TanStack/query',
];

const MOCK_RECOMMENDATIONS: MockRecommendation[] = [
  {
    id: '1',
    title: 'React Server Components ?ㅼ쟾 ?뺣━',
    url: 'https://github.com/reactwg/server-components',
    repository: 'reactwg/server-components',
    reason: 'React 怨꾩뿴 愿?ъ궗媛 ?믪븘 ?곌껐?깆씠 媛뺥븳 ?ㅽ겕?⑹쑝濡??먮떒?⑸땲??',
    tags: ['React', 'SSR', 'Web'],
    score: 98,
  },
  {
    id: '2',
    title: 'TypeScript ????ㅺ퀎 ?⑦꽩 紐⑥쓬',
    url: 'https://github.com/microsoft/TypeScript',
    repository: 'microsoft/TypeScript',
    reason: '?몄뼱? ????덉쟾??以묒떖 ?먯깋怨???留욌뒗 異뺤엯?덈떎.',
    tags: ['TypeScript', 'Types', 'Architecture'],
    score: 95,
  },
  {
    id: '3',
    title: 'Query 罹먯떛 ?꾨왂 ?붿빟',
    url: 'https://github.com/TanStack/query',
    repository: 'TanStack/query',
    reason: '?곹깭 愿由ъ? ?쒕쾭 ?곗씠???⑥묶 ?먮쫫???④퍡 ?ㅻ（湲?醫뗭뒿?덈떎.',
    tags: ['Query', 'Cache', 'Data'],
    score: 93,
  },
  {
    id: '4',
    title: 'UI 而댄룷?뚰듃 ?덉씠?꾩썐 ?⑦꽩',
    url: 'https://github.com/tailwindlabs/tailwindcss',
    repository: 'tailwindlabs/tailwindcss',
    reason: '?꾩옱 ?붾㈃?먯꽌 ?곕뒗 ?덉씠?꾩썐 ?몄뼱? 媛??媛源뚯슫 異뺤엯?덈떎.',
    tags: ['UI', 'Tailwind', 'Layout'],
    score: 91,
  },
  {
    id: '5',
    title: 'GitHub Actions 배포 워크플로우',
    url: 'https://github.com/actions/starter-workflows',
    repository: 'actions/starter-workflows',
    reason: '?먮룞?붿? 諛고룷 愿??吏???먮쫫??蹂닿컯?섍린 醫뗭뒿?덈떎.',
    tags: ['CI/CD', 'GitHub Actions', 'Deploy'],
    score: 89,
  },
  {
    id: '6',
    title: '紐⑤끂?덊룷 ?댁쁺 媛?대뱶',
    url: 'https://github.com/turborepo/turborepo',
    repository: 'turborepo/turborepo',
    reason: '?⑦궎吏 援ъ“? 怨듭쑀 紐⑤뱢 愿由??⑦꽩??李멸퀬?섍린 醫뗭뒿?덈떎.',
    tags: ['Monorepo', 'Tooling', 'Workspace'],
    score: 88,
  },
  {
    id: '7',
    title: '접근성 체크리스트',
    url: 'https://github.com/w3c/aria-practices',
    repository: 'w3c/aria-practices',
    reason: 'UI ?덉쭏怨??ъ슜??寃쏀뿕???뚯뼱?щ━?????좊━?⑸땲??',
    tags: ['Accessibility', 'UX', 'A11y'],
    score: 87,
  },
  {
    id: '8',
    title: '???곹깭 愿由??⑦꽩',
    url: 'https://github.com/react-hook-form/react-hook-form',
    repository: 'react-hook-form/react-hook-form',
    reason: '?낅젰 ?쇱씠 留롮? ?섏씠吏??諛붾줈 ?곸슜 媛?ν븳 吏?앹엯?덈떎.',
    tags: ['Form', 'Input', 'Validation'],
    score: 86,
  },
  {
    id: '9',
    title: '?쒓컖??諛?李⑦듃 援ы쁽 李멸퀬',
    url: 'https://github.com/recharts/recharts',
    repository: 'recharts/recharts',
    reason: '??쒕낫?쒗삎 UI???뺣낫 諛?꾨? ?믪씠?????좊━?⑸땲??',
    tags: ['Chart', 'Dashboard', 'Data Viz'],
    score: 84,
  },
  {
    id: '10',
    title: '?뚯뒪???먮룞???덉젣',
    url: 'https://github.com/vitest-dev/vitest',
    repository: 'vitest-dev/vitest',
    reason: '諛섎났 寃利??먮쫫???ㅻ챸?섎뒗 ?ㅽ겕?⑹쑝濡??곌껐?섍린 醫뗭뒿?덈떎.',
    tags: ['Testing', 'Vitest', 'QA'],
    score: 83,
  },
];

export function GithubStarImportPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<ImportStage>('idle');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [scanPulse, setScanPulse] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const carouselRef = useRef<HTMLDivElement | null>(null);

  const githubLinkQuery = useQuery({
    queryKey: ['github', 'link-status'],
    queryFn: () => githubApi.getLinkStatus(),
    staleTime: 1000 * 30,
  });

  const linkedUsername = githubLinkQuery.data?.githubUsername ?? null;
  const isLinked = Boolean(githubLinkQuery.data?.linked);

  useEffect(() => {
    if (!isLinked) {
      setStage('idle');
      setAddedIds(new Set());
      setScanPulse(0);
      setPreviewMode(false);
    }
  }, [isLinked]);

  useEffect(() => {
    if (stage !== 'loading') return undefined;

    const start = window.setInterval(() => {
      setScanPulse((current) => (current + 1) % 100);
    }, 120);

    const finish = window.setTimeout(() => {
      setStage('ready');
      setScanPulse(100);
    }, 1800);

    return () => {
      window.clearInterval(start);
      window.clearTimeout(finish);
    };
  }, [stage]);

  const handleLoadStars = () => {
    if (!isLinked || stage === 'loading') return;
    setAddedIds(new Set());
    setStage('loading');
  };

  const handlePreviewResults = () => {
    if (!isLinked) return;
    setPreviewMode(true);
    setStage('ready');
    setScanPulse(100);
    setAddedIds(new Set());
  };

  const handleAdd = (id: string) => {
    setAddedIds((current) => {
      const next = new Set(current);
      next.add(id);
      return next;
    });
  };

  const scrollRecommendations = (direction: 'prev' | 'next') => {
    const node = carouselRef.current;
    if (!node) return;

    const scrollAmount = node.clientWidth * 0.9;
    node.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth',
    });
  };

  const addedCount = addedIds.size;
  const remainingCount = MOCK_RECOMMENDATIONS.length - addedCount;
  const progress = MOCK_RECOMMENDATIONS.length > 0 ? (addedCount / MOCK_RECOMMENDATIONS.length) * 100 : 0;
  const stageLabel = useMemo(() => {
    if (!isLinked) return '?곌껐 ?꾩슂';
    if (stage === 'loading') return '분석 중';
    if (stage === 'ready') return '異붿쿇 ?꾨즺';
    return '대기 중';
  }, [isLinked, stage]);

  if (githubLinkQuery.isError) {
    return (
      <section className="mx-auto w-full max-w-[960px] py-10">
        <EmptyState
          type="custom"
          variant="full"
          title="GitHub ?곕룞 ?곹깭瑜??뺤씤?????놁뒿?덈떎."
          description={getApiErrorMessage(githubLinkQuery.error, '?곌껐 ?뺣낫瑜?遺덈윭?ㅼ? 紐삵뻽?듬땲??')}
          primaryAction={{
            label: '연동하러 가기',
            onClick: () => navigate('/profile'),
          }}
        />
      </section>
    );
  }

  if (githubLinkQuery.isLoading) {
    return (
      <section className="mx-auto flex w-full max-w-[960px] flex-col items-center justify-center py-20 text-center">
        <Loader2 size={34} className="animate-spin text-primary-signal" />
        <p className="mt-4 text-sm font-medium text-text-secondary">GitHub ?곕룞 ?곹깭瑜??뺤씤?섍퀬 ?덉뒿?덈떎.</p>
      </section>
    );
  }

  if (!isLinked) {
    return (
      <section className="mx-auto w-full max-w-[960px] py-10">
        <EmptyState
          type="custom"
          variant="full"
          title="GitHub 怨꾩젙 ?곕룞???꾩슂?⑸땲??"
          description="star 紐⑸줉??遺덈윭?ㅻ젮硫?癒쇱? GitHub 怨꾩젙???곌껐?댁빞 ?⑸땲??"
          primaryAction={{
            label: '연동하러 가기',
            onClick: () => navigate('/settings/integrations'),
          }}
          secondaryAction={{
            label: '프로필로 돌아가기',
            onClick: () => navigate('/profile'),
          }}
        />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1180px] py-10 text-text-primary">
      <header className="flex flex-col gap-6 border-b border-text-secondary/8 pb-6">
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary-signal">
            GitHub star import
          </p>
          <h1 className="text-h1-bold text-text-primary">
            {linkedUsername ? (
              <>
                <span>諛섍컩?듬땲?? </span>
                <span className="text-primary-signal">{linkedUsername}</span>
                <span> ??</span>
                <br />
                <span>?뱀떊??吏???멸퀎瑜?遺꾩꽍?⑸땲??</span>
              </>
            ) : (
              '?뱀떊??吏???멸퀎瑜?遺꾩꽍?⑸땲??'
            )}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-text-secondary">
            GitHub star 紐⑸줉???쎄퀬, AI媛 愿?⑤룄 ?믪? ?ㅽ겕??二쇱냼 10媛쒕? 異붿쿇?⑸땲??
            ?ъ슜?먭? ?뺤씤????ぉ留?吏???꾩뭅?대툕??異붽??섎뒗 ?먮쫫?쇰줈 ?곌껐?⑸땲??
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <CurvedButton
            type="button"
            leadingIcon={<Star size={16} />}
            onClick={handleLoadStars}
            disabled={stage === 'loading'}
          >
            Star 遺덈윭?ㅺ린
          </CurvedButton>
          <CurvedButton
            type="button"
            tone="subtle"
            leadingIcon={<Eye size={16} />}
            onClick={handlePreviewResults}
          >
            異붿쿇 寃곌낵 誘몃━蹂닿린
          </CurvedButton>
          <CurvedButton type="button" tone="ghost" onClick={() => navigate('/profile')}>
            ?꾨줈?꾨줈 ?뚯븘媛湲?          </CurvedButton>
        </div>
      </header>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="rounded-leaf border border-text-secondary/10 glass-card bg-surface-container/80 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary/60">
                연결 상태
              </p>
              <h2 className="mt-2 text-body-lg-bold text-text-primary">분석 준비 상태</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-primary-signal/20 bg-primary-signal/10 px-3 py-1 text-[11px] font-bold text-primary-signal">
              <Sparkles size={12} className={stage === 'loading' ? 'animate-pulse' : ''} />
              {stageLabel}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <StatBlock label="연결 계정" value={linkedUsername ?? '확인됨'} />
            <StatBlock label="추천 예고" value={stage === 'ready' ? `${MOCK_RECOMMENDATIONS.length}개` : '대기'} />
            <StatBlock label="추가 완료" value={stage === 'ready' ? `${addedCount}개` : '0개'} accent />
          </div>

          <div className="mt-6 rounded-leaf border border-text-secondary/10 bg-surface-lowest/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-text-primary">진행 상태</p>
              <p className="text-xs font-semibold text-text-secondary/65">
                {stage === 'ready' ? `${addedCount}/${MOCK_RECOMMENDATIONS.length}` : '0/10'}
              </p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-text-primary/[0.05]">
              <div
                className="h-full rounded-full bg-primary-signal transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-text-secondary/70">
              <span>
                {stage === 'idle'
                  ? '버튼을 누르면 분석이 시작됩니다.'
                  : previewMode
                    ? '미리보기 모드로 추천 결과를 보여줍니다.'
                    : 'AI가 star와 스크랩의 연결을 계산하는 중입니다.'}
              </span>
              {stage === 'loading' ? <span className="tabular-nums">{scanPulse}%</span> : null}
            </div>
          </div>

          <div className="mt-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary/60">
              GitHub star 목록
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {MOCK_STAR_SOURCES.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-full border border-text-secondary/10 bg-surface-low px-3 py-2 text-xs font-medium text-text-secondary"
                >
                  <Star size={12} className="text-primary-signal" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-leaf border border-text-secondary/10 glass-card bg-surface-container/80 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-secondary/60">
                AI 추천 결과
              </p>
              <h2 className="mt-2 text-body-lg-bold text-text-primary">추천 스크랩 10개</h2>
            </div>
            <div className="rounded-full border border-primary-signal/20 bg-primary-signal/10 px-3 py-1 text-[11px] font-bold text-primary-signal">
              {remainingCount === 0 ? '모두 추가됨' : `${remainingCount}개 남음`}
            </div>
          </div>

          {!previewMode && stage !== 'ready' ? (
            <div className="mt-6">
              <AnalysisPlaceholder loading={stage === 'loading'} />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary/60">
                  추천 리스트
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => scrollRecommendations('prev')}
                    className="rounded-full border border-text-secondary/10 bg-surface-lowest p-2 text-text-secondary transition hover:border-primary-signal/30 hover:text-primary-signal"
                    aria-label="이전 추천"
                  >
                    <ArrowRight size={14} className="rotate-180" />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollRecommendations('next')}
                    className="rounded-full border border-text-secondary/10 bg-surface-lowest p-2 text-text-secondary transition hover:border-primary-signal/30 hover:text-primary-signal"
                    aria-label="다음 추천"
                  >
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              <div
                ref={carouselRef}
                className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2"
              >
                {MOCK_RECOMMENDATIONS.map((item, index) => {
                  const isAdded = addedIds.has(item.id);

                  return (
                    <div key={item.id} className="min-w-[calc((100%-1rem)/2)] snap-start md:min-w-[calc((100%-2rem)/5)]">
                      <RecommendationCard
                        item={item}
                        index={index}
                        isAdded={isAdded}
                        onAdd={() => handleAdd(item.id)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {stage === 'ready' && (
          <section className="rounded-leaf border border-primary-signal/15 bg-primary-signal/8 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold text-text-primary">
                  {previewMode ? '추천 결과 미리보기' : '검토 완료 후 아카이브 생성'}
                </p>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  {previewMode
                    ? '추천 결과를 먼저 확인하고, 선택한 항목만 아카이브에 추가할 수 있습니다.'
                    : '추가한 스크랩을 기반으로 새로운 지식 아카이브를 생성할 수 있습니다.'}
                </p>
              </div>
              <CurvedButton type="button" leadingIcon={<ArrowRight size={16} />} onClick={() => navigate('/archive')}>
                아카이브로 보기
              </CurvedButton>
            </div>
          </section>
        )}
      </div>
    </section>
  );
}

function AnalysisPlaceholder({ loading }: { loading: boolean }) {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-leaf border border-text-secondary/10 bg-surface-low px-6 py-10 text-center">
      {loading ? (
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-2 border-primary-signal/20" />
          <div className="absolute inset-0 rounded-full border-2 border-primary-signal/50 border-t-transparent animate-spin" />
          <Sparkles size={18} className="text-primary-signal" />
        </div>
      ) : (
        <IconBox variant="leaf" size="md">
          <Archive size={20} className="text-text-primary" />
        </IconBox>
      )}

      <h3 className="mt-5 text-body-sm-bold text-text-primary">
        {loading ? 'AI가 star 목록을 읽고 있어요.' : '분석을 시작하면 추천 결과가 표시됩니다.'}
      </h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
        {loading
          ? '최근 활동, 관심 기술, 저장소 맥락을 함께 읽어 관련 스크랩을 계산하는 중입니다.'
          : '왼쪽에서 Star 불러오기를 누르면 10개의 추천 스크랩이 순서대로 나타납니다.'}
      </p>
    </div>
  );
}
function RecommendationCard({
  item,
  index,
  isAdded,
  onAdd,
}: {
  item: MockRecommendation;
  index: number;
  isAdded: boolean;
  onAdd: () => void;
}) {
  return (
    <article
      className="group rounded-leaf border border-text-secondary/10 bg-surface-lowest/80 p-5 transition hover:border-primary-signal/20 hover:bg-surface-low"
      style={{
        animationDelay: `${index * 60}ms`,
        animationName: 'san-fade-up',
        animationDuration: '280ms',
        animationFillMode: 'both',
      }}
    >
      <div className="flex items-start gap-4">
        <IconBox variant="leaf" size="sm">
          <Archive size={18} className="text-text-primary" />
        </IconBox>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-body-sm-bold text-text-primary">{item.title}</h3>
                <span className="rounded-full bg-primary-signal/10 px-2 py-0.5 text-[10px] font-bold text-primary-signal">
                  {item.score}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-text-secondary">{item.repository}</p>
              <p className="mt-3 text-sm leading-6 text-text-secondary/80">{item.reason}</p>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-signal transition hover:opacity-80"
              >
                ?먮낯 蹂닿린
                <ExternalLink size={12} />
              </a>
              <button
                type="button"
                onClick={onAdd}
                disabled={isAdded}
                className="inline-flex min-h-10 items-center justify-center rounded-leaf bg-primary-signal px-4 text-xs font-bold text-text-on-accent transition hover:bg-primary-signal-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAdded ? (
                  <>
                    <CheckCircle2 size={14} className="mr-1.5" />
                    異붽???
                  </>
                ) : (
                  '???꾩뭅?대툕??異붽?'
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <TagBadge key={tag} label={tag} />
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function StatBlock({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-leaf border border-text-secondary/10 bg-surface-lowest/80 p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/55">{label}</p>
      <p className={`mt-2 text-lg font-black ${accent ? 'text-primary-signal' : 'text-text-primary'}`}>{value}</p>
    </div>
  );
}
