import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Archive,
  ArrowRight,
  CheckSquare,
  Eye,
  ExternalLink,
  Loader2,
  Square,
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
  tags: string[];
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
    title: 'React Server Components',
    url: 'https://github.com/reactwg/server-components',
    tags: ['React', 'SSR', 'Web'],
  },
  {
    id: '2',
    title: 'TypeScript Handbook',
    url: 'https://github.com/microsoft/TypeScript',
    tags: ['TypeScript', 'Types', 'Architecture'],
  },
  {
    id: '3',
    title: 'Query Caching Patterns',
    url: 'https://github.com/TanStack/query',
    tags: ['Query', 'Cache', 'Data'],
  },
  {
    id: '4',
    title: 'UI Layout System',
    url: 'https://github.com/tailwindlabs/tailwindcss',
    tags: ['UI', 'Tailwind', 'Layout'],
  },
  {
    id: '5',
    title: 'GitHub Actions Starter Workflows',
    url: 'https://github.com/actions/starter-workflows',
    tags: ['CI/CD', 'GitHub Actions', 'Deploy'],
  },
  {
    id: '6',
    title: 'Monorepo Guide',
    url: 'https://github.com/turborepo/turborepo',
    tags: ['Monorepo', 'Tooling', 'Workspace'],
  },
  {
    id: '7',
    title: 'Accessibility Practices',
    url: 'https://github.com/w3c/aria-practices',
    tags: ['Accessibility', 'UX', 'A11y'],
  },
  {
    id: '8',
    title: 'Form State Guide',
    url: 'https://github.com/react-hook-form/react-hook-form',
    tags: ['Form', 'Input', 'Validation'],
  },
  {
    id: '9',
    title: 'Chart Components',
    url: 'https://github.com/recharts/recharts',
    tags: ['Chart', 'Dashboard', 'Data Viz'],
  },
  {
    id: '10',
    title: 'Testing Patterns',
    url: 'https://github.com/vitest-dev/vitest',
    tags: ['Testing', 'Vitest', 'QA'],
  },
];

const FLOW_STEPS = [
  {
    title: '리포지토리 스캔',
    description: '최근 star와 연결된 저장소를 먼저 읽습니다.',
  },
  {
    title: '패턴 추출',
    description: '기술 스택과 관심 흐름을 하나씩 묶습니다.',
  },
  {
    title: '추천 생성',
    description: '관련 스크랩 주소 10개를 뽑아 보여줍니다.',
  },
];

export function GithubStarImportPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<ImportStage>('idle');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [scanPulse, setScanPulse] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);

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

    const intervalId = window.setInterval(() => {
      setScanPulse((current) => (current + 1) % 100);
    }, 120);

    const timeoutId = window.setTimeout(() => {
      setStage('ready');
      setScanPulse(100);
    }, 1800);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [stage]);

  const handleLoadStars = () => {
    if (!isLinked || stage === 'loading') return;
    setAddedIds(new Set());
    setPreviewMode(false);
    setStage('loading');
    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 250);
  };

  const handlePreviewResults = () => {
    if (!isLinked) return;
    setPreviewMode(true);
    setStage('ready');
    setScanPulse(100);
    setAddedIds(new Set());
    window.setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  };

  const handleToggleRecommendation = (id: string) => {
    setAddedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const addedCount = addedIds.size;
  const remainingCount = MOCK_RECOMMENDATIONS.length - addedCount;
  const progress = MOCK_RECOMMENDATIONS.length > 0 ? (addedCount / MOCK_RECOMMENDATIONS.length) * 100 : 0;

  const stageLabel = useMemo(() => {
    if (!isLinked) return '연결 필요';
    if (stage === 'loading') return '분석 중';
    if (stage === 'ready') return '추천 준비 완료';
    return '대기 중';
  }, [isLinked, stage]);

  if (githubLinkQuery.isError) {
    return (
      <section className="mx-auto w-full max-w-[720px] py-10">
        <EmptyState
          type="custom"
          variant="full"
          title="GitHub 연결 상태를 확인할 수 없습니다."
          description={getApiErrorMessage(githubLinkQuery.error, '연결 정보를 불러오지 못했습니다.')}
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
      <section className="mx-auto flex w-full max-w-[720px] flex-col items-center justify-center py-20 text-center">
        <Loader2 size={34} className="animate-spin text-primary-signal" />
        <p className="mt-4 text-sm font-medium text-text-secondary">GitHub 연동 상태를 확인하는 중입니다.</p>
      </section>
    );
  }

  if (!isLinked) {
    return (
      <section className="mx-auto w-full max-w-[720px] py-10">
        <EmptyState
          type="custom"
          variant="full"
          title="GitHub 계정 연결이 필요합니다."
          description="star 목록을 불러오려면 먼저 GitHub 계정을 연결해야 합니다."
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
    <section className="mx-auto w-full max-w-[720px] py-10 text-text-primary">
      <header className="flex flex-col gap-6 border-b border-text-secondary/8 pb-6">
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary-signal">GitHub star import</p>
          <h1 className="text-h1-bold text-text-primary">
            {linkedUsername ? (
              <>
                <span>반갑습니다, </span>
                <span className="text-primary-signal">{linkedUsername}</span>
                <span> 님.</span>
                <br />
                <span>당신의 지식 세계를 분석합니다.</span>
              </>
            ) : (
              '당신의 지식 세계를 분석합니다.'
            )}
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-text-secondary">
            GitHub star 목록을 읽고, AI가 관련 스크랩 주소 10개를 추천합니다. 먼저 불러오고, 결과를 확인하고, 필요한 것만 아카이브에 추가하는 흐름입니다.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <CurvedButton type="button" leadingIcon={<Star size={16} />} onClick={handleLoadStars} disabled={stage === 'loading'}>
            Star 불러오기
          </CurvedButton>
          <CurvedButton type="button" tone="ghost" onClick={() => navigate('/profile')}>
            프로필로 돌아가기
          </CurvedButton>
        </div>
      </header>

      <div className="mt-8 flex flex-col gap-8">
        <section className="rounded-leaf border border-text-secondary/10 glass-card bg-surface-container/80 p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              <h2 className="mt-2 text-body-lg-bold text-text-primary">분석 준비 상태</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                지금 화면은 보고서가 아니라 연동용 로딩 화면입니다. 아래 10개 결과가 이 흐름의 끝입니다.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full bg-primary-signal/10 px-3 py-1 text-[11px] font-bold text-primary-signal">
              <Sparkles size={12} className={stage === 'loading' ? 'animate-pulse' : ''} />
              {stageLabel}
            </div>
          </div>

          <div className="mt-6">
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              {FLOW_STEPS.map((step, index) => {
                const active =
                  (index === 0 && stage !== 'idle') ||
                  (index === 1 && stage === 'loading') ||
                  (index === 2 && stage === 'ready');

                return (
                  <div
                    key={step.title}
                    className={`rounded-leaf p-4 transition ${
                      active ? 'bg-primary-signal/8' : 'bg-surface-lowest/80'
                    } ${stage === 'loading' && active ? 'animate-pulse' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="mt-1 text-body-sm-bold text-text-primary">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-text-secondary">{step.description}</p>
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-signal/10 text-[11px] font-black text-primary-signal">
                        {String(index + 1).padStart(2, '0')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 rounded-leaf bg-surface-lowest/80 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="mt-1 text-sm font-bold text-text-primary">
                  {stage === 'idle'
                    ? '버튼을 누르면 분석이 시작됩니다.'
                    : previewMode
                      ? '미리보기 모드로 10개 결과를 즉시 보여줍니다.'
                      : 'AI가 star와 스크랩의 연결을 계산하는 중입니다.'}
                </p>
              </div>
              {stage === 'loading' ? <span className="text-xs font-bold text-primary-signal tabular-nums">{scanPulse}%</span> : null}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-text-primary/[0.05]">
              <div
                className="h-full rounded-full bg-primary-signal transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </section>

        <section ref={resultsRef} className="rounded-leaf border border-text-secondary/10 glass-card bg-surface-container/80 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <h2 className="mt-2 text-body-lg-bold text-text-primary">추천 스크랩 10개</h2>
              <p className="mt-2 text-sm leading-6 text-text-secondary">
                가장 중요한 부분은 추천 결과 10개입니다. 여기에 결과가 채워지고, 사용자는 필요한 것만 아카이브에 넣습니다.
              </p>
            </div>
            <div className="rounded-full bg-primary-signal/10 px-3 py-1 text-[11px] font-bold text-primary-signal">
              {remainingCount === 0 ? '모두 추가됨' : `${remainingCount}개 남음`}
            </div>
          </div>

          {!previewMode && stage !== 'ready' ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="flex min-h-[168px] flex-col justify-between rounded-leaf bg-surface-lowest/80 p-4">
                  <div className="space-y-3">
                    <div className="h-3 w-10 rounded-full bg-text-secondary/10" />
                    <div className="h-4 w-4/5 rounded-full bg-text-secondary/10" />
                    <div className="h-3 w-full rounded-full bg-text-secondary/10" />
                    <div className="h-3 w-5/6 rounded-full bg-text-secondary/10" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-text-secondary/50">0{index + 1}</span>
                    <Sparkles size={14} className={stage === 'loading' ? 'animate-pulse text-primary-signal' : 'text-text-secondary/30'} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {MOCK_RECOMMENDATIONS.map((item, index) => {
                const isSelected = addedIds.has(item.id);
                return (
                  <RecommendationCard
                    key={item.id}
                    item={item}
                    index={index}
                    isSelected={isSelected}
                    onToggle={() => handleToggleRecommendation(item.id)}
                  />
                );
              })}
            </div>
          )}
        </section>

        {stage === 'ready' && (
          <section className="rounded-leaf bg-primary-signal/8 p-5">
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

function RecommendationCard({
  item,
  index,
  isSelected,
  onToggle,
}: {
  item: MockRecommendation;
  index: number;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <article
      className="group rounded-leaf bg-surface-lowest/80 p-4 transition hover:bg-surface-low"
      style={{
        animationDelay: `${index * 60}ms`,
        animationName: 'san-fade-up',
        animationDuration: '280ms',
        animationFillMode: 'both',
      }}
    >
      <div className="flex h-full flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={onToggle}
            aria-pressed={isSelected}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-lowest text-primary-signal transition hover:bg-primary-signal/8"
          >
            {isSelected ? <CheckSquare size={16} /> : <Square size={16} className="text-text-secondary/45" />}
          </button>
          <h3 className="min-w-0 flex-1 break-words text-sm font-bold text-text-primary">{item.title}</h3>
          <span className="rounded-full bg-primary-signal/10 px-2 py-0.5 text-[10px] font-bold text-primary-signal">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.tags.map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-2">
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary-signal transition hover:opacity-80"
          >
            URL 열기
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </article>
  );
}
