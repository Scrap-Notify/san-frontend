import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Hash,
  Image,
  Link as LinkIcon,
  Loader2,
  Sparkles,
  Tags,
} from 'lucide-react';
import { useCardDetail, useSimilarCards, type KnowledgeCardDetailResponse, type KnowledgeCardResponse } from '@san/shared';

export type KnowledgeSourceType = 'LINK' | 'IMAGE' | 'PDF' | 'OCR' | 'TEXT';

export interface KnowledgeCardDetailData {
  cardId: string;
  source: {
    type: KnowledgeSourceType;
    url?: string | null;
    previewUrl?: string | null;
    rawContent: string;
    collectedAt?: string | null;
  };
  processedText: {
    refinedContent: string;
    updatedAt?: string | null;
  };
  finalCard: {
    title: string;
    summary: string;
    keyPoints: string[];
    categoryName: string;
    tags: string[];
    relatedKeywords: string[];
    createdAt?: string | null;
  };
  relatedCards: Array<{
    cardId: string;
    title: string;
    categoryName: string;
  }>;
}

const sectionCardClass = 'rounded-tl-[32px] rounded-br-[32px] rounded-tr-2xl rounded-bl-2xl border border-white/5 bg-[#131718] p-6 shadow-md';
const panelCardClass = 'rounded-tl-[28px] rounded-br-[28px] rounded-tr-xl rounded-bl-xl border border-white/5 bg-[#181c1f] p-5';
const REFINE_POLL_INTERVAL_MS = 2000;
const REFINE_POLL_TIMEOUT_MS = 30000;

export function KnowledgeCardDetailPage() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const [refinePollStartedAt, setRefinePollStartedAt] = useState<number | null>(null);
  const [refinePollTimedOut, setRefinePollTimedOut] = useState(false);
  const detailQuery = useCardDetail(cardId, {
    refetchInterval: (query) => {
      if (!query.state.data || refinePollTimedOut) return false;
      if (query.state.data.refinedContent?.trim()) return false;
      return REFINE_POLL_INTERVAL_MS;
    },
  });
  const similarQuery = useSimilarCards(cardId);
  const hasRefinedContent = Boolean(detailQuery.data?.refinedContent?.trim());

  useEffect(() => {
    setRefinePollStartedAt(null);
    setRefinePollTimedOut(false);
  }, [cardId]);

  useEffect(() => {
    if (!detailQuery.data || hasRefinedContent) return;
    setRefinePollStartedAt((current) => current ?? Date.now());
  }, [detailQuery.data, hasRefinedContent]);

  useEffect(() => {
    if (!refinePollStartedAt || hasRefinedContent) return undefined;

    const timeoutId = window.setTimeout(() => {
      setRefinePollTimedOut(true);
    }, REFINE_POLL_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [hasRefinedContent, refinePollStartedAt]);

  const data = useMemo(() => {
    if (!cardId || !detailQuery.data) return null;
    return toDetailData(cardId, detailQuery.data, similarQuery.data?.similarCards ?? []);
  }, [cardId, detailQuery.data, similarQuery.data?.similarCards]);

  const isCheckingRefinedContent = Boolean(detailQuery.data) && !hasRefinedContent && !refinePollTimedOut;

  if (!cardId) {
    return <DetailStatus tone="error" title="잘못된 카드 주소입니다." description="상세보기로 이동할 지식카드 ID가 없습니다." />;
  }

  if (detailQuery.isPending) {
    return <DetailStatus title="지식카드를 불러오는 중입니다." description="원본 데이터와 AI 정제 결과를 조회하고 있습니다." />;
  }

  if (detailQuery.isError || !data) {
    return (
      <DetailStatus
        tone="error"
        title="지식카드를 불러올 수 없습니다."
        description="카드가 삭제되었거나 접근 권한이 없을 수 있습니다."
      />
    );
  }

  return (
    <section className="flex w-full min-w-0 flex-col gap-8 text-white">
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/40 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            돌아가기
          </button>
          <p className="text-md font-bold uppercase tracking-wide text-[#4ade80]">지식카드 상세보기</p>
          <h1 className="mt-3 max-w-4xl text-h1-bold leading-[1.25] text-white md:text-[40px]">
            {data.finalCard.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-white/50">
            원본 데이터에서 AI 1차 정제 텍스트를 거쳐 최종 지식카드가 만들어진 흐름을 확인합니다.
          </p>
        </div>
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex min-w-0 flex-col gap-6">
          <SourceDataSection source={data.source} />
          <ProcessedTextSection processedText={data.processedText} isCheckingRefinedContent={isCheckingRefinedContent} />
          <FinalKnowledgeCardSection finalCard={data.finalCard} />
        </div>
        <DetailMetaPanel data={data} isLoadingRelated={similarQuery.isPending} />
      </div>
    </section>
  );
}

function SourceDataSection({ source }: { source: KnowledgeCardDetailData['source'] }) {
  const SourceIcon = getSourceIcon(source.type);

  return (
    <section className={sectionCardClass}>
      <SectionHeader
        icon={<FileText size={18} />}
        title="원본 데이터"
        description="최초 수집된 원본 데이터입니다. 이 영역은 읽기 전용입니다."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 rounded-2xl border border-white/5 bg-[#0B0D0F]/60 p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#4ade80]/20 bg-[#4ade80]/5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#4ade80]">
              <SourceIcon size={14} aria-hidden="true" />
              {source.type}
            </span>
            <span className="text-xs text-white/40">
              수집 일시 {source.collectedAt ? formatDateTime(source.collectedAt) : 'API 미제공'}
            </span>
          </div>

          {source.url ? (
            <a
              href={source.url}
              target="_blank"
              rel="noreferrer"
              className="mb-4 flex min-w-0 items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-white/60 transition hover:border-white/10 hover:text-white"
            >
              <LinkIcon size={15} className="shrink-0 text-[#4ade80]" aria-hidden="true" />
              <span className="truncate">{source.url}</span>
            </a>
          ) : null}

          <p className="whitespace-pre-wrap text-sm leading-7 text-white/60">
            {source.rawContent || '원본 데이터가 비어 있습니다.'}
          </p>
        </div>

        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-white/5 bg-[#181c1f] p-5 text-center">
          {source.previewUrl ? (
            <img src={source.previewUrl} alt="" className="max-h-56 rounded-xl object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/40">
              <SourceIcon size={34} strokeWidth={1.5} aria-hidden="true" />
              <p className="text-sm leading-6">원본 preview URL은 현재 상세 API에서 제공되지 않습니다.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProcessedTextSection({
  processedText,
  isCheckingRefinedContent,
}: {
  processedText: KnowledgeCardDetailData['processedText'];
  isCheckingRefinedContent: boolean;
}) {
  const [value, setValue] = useState(processedText.refinedContent);
  const hasRefinedContent = processedText.refinedContent.trim().length > 0;

  useEffect(() => {
    setValue(processedText.refinedContent);
  }, [processedText.refinedContent]);

  return (
    <section className={sectionCardClass}>
      <SectionHeader
        icon={<Sparkles size={18} />}
        title="AI 1차 정제 텍스트"
        description="원본을 읽기 쉽게 변환한 텍스트입니다. 오타나 OCR 오류 정도만 수정할 수 있으며, 수정 내용은 기존 최종 지식카드에 자동 반영되지 않습니다."
      />

      {hasRefinedContent ? (
        <div className="mt-6 rounded-2xl border border-white/5 bg-[#0B0D0F]/60 p-1">
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            spellCheck={false}
            className="min-h-[22rem] w-full resize-y rounded-[14px] bg-transparent px-5 py-4 text-base leading-8 text-white/70 outline-none placeholder:text-white/20 focus:bg-white/[0.02]"
            aria-label="AI 1차 정제 텍스트"
          />
        </div>
      ) : isCheckingRefinedContent ? (
        <div className="mt-6 flex min-h-48 items-center justify-center rounded-2xl border border-white/5 bg-[#0B0D0F]/60 p-6 text-center">
          <div className="flex max-w-md flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-[#4ade80]" aria-hidden="true" />
            <p className="text-base font-semibold text-white/70">1차 정제 데이터를 확인하는 중입니다.</p>
            <p className="text-sm leading-6 text-white/40">
              원본 저장 직후라면 정제 작업이 아직 끝나지 않았을 수 있어요.
              <br />
              잠시 동안 자동으로 다시 확인합니다.
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex min-h-48 items-center justify-center rounded-2xl border border-white/5 bg-[#0B0D0F]/60 p-6 text-center">
          <div className="flex max-w-md flex-col items-center gap-3">
            <Sparkles size={24} className="text-white/25" aria-hidden="true" />
            <p className="text-base font-semibold text-white/70">1차 정제 데이터가 없습니다.</p>
            <p className="text-sm leading-6 text-white/40">
              현재 상세 API에서 정제된 텍스트가 제공되지 않아 
              <br />원본 데이터와 최종 지식카드만 확인할 수 있습니다.
            </p>
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-white/35">
        <span>문서 편집기가 아니라 정제 텍스트 확인과 경미한 보정 용도입니다.</span>
        {processedText.updatedAt ? <span>정제 일시 {formatDateTime(processedText.updatedAt)}</span> : null}
      </div>
    </section>
  );
}

function FinalKnowledgeCardSection({ finalCard }: { finalCard: KnowledgeCardDetailData['finalCard'] }) {
  return (
    <section className={sectionCardClass}>
      <SectionHeader
        icon={<CheckCircle2 size={18} />}
        title="최종 지식카드"
        description="최종 지식카드는 최초 생성 시점의 정제 텍스트를 기준으로 생성되었습니다."
      />

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <div className="rounded-2xl border border-white/5 bg-[#181c1f] p-5">
            <p className="text-sm font-bold tracking-wide text-white/35">핵심 요약</p>
            <ul className="mt-4 space-y-3">
              {finalCard.keyPoints.map((point) => (
                <li key={point} className="flex gap-3 text-sm leading-7 text-white/70">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#4ade80]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <InfoBlock label="카테고리" value={finalCard.categoryName} />
          <div className={panelCardClass}>
            <p className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wide text-white/35">
              <Tags size={14} aria-hidden="true" />
              태그
            </p>
            <TagList values={finalCard.tags} />
          </div>
          <div className={panelCardClass}>
            <p className="mb-3 flex items-center gap-2 text-sm font-bold tracking-wide text-white/35">
              <Hash size={14} aria-hidden="true" />
              관련 키워드
            </p>
            <TagList values={finalCard.relatedKeywords} subtle />
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailMetaPanel({ data, isLoadingRelated }: { data: KnowledgeCardDetailData; isLoadingRelated: boolean }) {
  return (
    <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-28 xl:self-start">
      <div className={panelCardClass}>
        <p className="text-xs font-bold uppercase tracking-wide text-[#4ade80]">Metadata</p>
        <dl className="mt-5 space-y-4 text-sm">
          <MetaRow label="Card ID" value={data.cardId} />
          <MetaRow label="Source" value={data.source.type} />
          <MetaRow label="Created" value={data.finalCard.createdAt ? formatDateTime(data.finalCard.createdAt) : 'API 미제공'} />
          <MetaRow label="Collected" value={data.source.collectedAt ? formatDateTime(data.source.collectedAt) : 'API 미제공'} />
        </dl>
      </div>

      <div className={panelCardClass}>
        <p className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/35">
          <Tags size={14} aria-hidden="true" />
          Tags
        </p>
        <TagList values={data.finalCard.tags} />
      </div>

      <div className={panelCardClass}>
        <p className="mb-4 text-sm font-bold tracking-wide text-white/35">관련 카드</p>
        {isLoadingRelated ? (
          <p className="text-sm text-white/40">관련 카드를 불러오는 중입니다.</p>
        ) : data.relatedCards.length > 0 ? (
          <div className="space-y-3">
            {data.relatedCards.map((card) => (
              <Link
                key={card.cardId}
                to={`/cards/${card.cardId}`}
                className="block rounded-xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-[#4ade80]/30 hover:bg-[#4ade80]/5"
              >
                <p className="text-xs font-bold text-[#4ade80]">{card.categoryName}</p>
                <p className="mt-2 line-clamp-2 text-sm font-semibold leading-6 text-white/70">{card.title}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/40">표시할 관련 카드가 없습니다.</p>
        )}
      </div>
    </aside>
  );
}

function DetailStatus({ title, description, tone = 'default' }: { title: string; description: string; tone?: 'default' | 'error' }) {
  const Icon = tone === 'error' ? AlertCircle : Loader2;

  return (
    <section className="grid min-h-[calc(100vh-14rem)] w-full place-items-center text-white">
      <div className="flex max-w-xl flex-col items-center gap-4 rounded-tl-[32px] rounded-br-[32px] rounded-tr-2xl rounded-bl-2xl border border-white/5 bg-[#131718] p-8 text-center">
        <Icon className={tone === 'error' ? 'text-red-400' : 'animate-spin text-[#4ade80]'} size={28} aria-hidden="true" />
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm leading-6 text-white/45">{description}</p>
      </div>
    </section>
  );
}

function SectionHeader({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tl-[18px] rounded-br-[18px] rounded-tr-md rounded-bl-md bg-[#4ade80]/10 text-[#4ade80]">
          {icon}
        </span>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <p className="w-full text-[16px] leading-7 text-white/50">{description}</p>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className={panelCardClass}>
      <p className="text-sm font-bold tracking-wide text-white/35">{label}</p>
      <p className="mt-3 text-base font-semibold text-white/80">{value}</p>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4">
      <dt className="shrink-0 text-white/35">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-white/65">{value}</dd>
    </div>
  );
}

function TagList({ values, subtle = false }: { values: string[]; subtle?: boolean }) {
  if (values.length === 0) {
    return <p className="text-sm text-white/40">표시할 항목이 없습니다.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span
          key={value}
          className={[
            'rounded-md border px-3 py-1.5 text-sm font-medium',
            subtle
              ? 'border-white/5 bg-white/[0.03] text-white/50'
              : 'border-[#4ade80]/15 bg-[#4ade80]/5 text-[#b9cbc1]',
          ].join(' ')}
        >
          {value.startsWith('#') ? value : `#${value}`}
        </span>
      ))}
    </div>
  );
}

function toDetailData(
  cardId: string,
  detail: KnowledgeCardDetailResponse,
  similarCards: KnowledgeCardResponse[],
): KnowledgeCardDetailData {
  const sourceContent = detail.sourceContent ?? '';
  const tags = detail.tags ?? [];

  return {
    cardId,
    source: {
      type: detail.sourceType,
      url: detail.sourceType === 'LINK' ? sourceContent : null,
      previewUrl: detail.sourceType === 'IMAGE' ? sourceContent : null,
      rawContent: detail.sourceType === 'TEXT' ? sourceContent : '',
      collectedAt: detail.collectedAt,
    },
    processedText: {
      refinedContent: detail.refinedContent ?? '',
      updatedAt: null,
    },
    finalCard: {
      title: detail.title,
      summary: detail.summary ?? '요약 내용이 아직 생성되지 않았습니다.',
      keyPoints: toKeyPoints(detail.summary),
      categoryName: detail.categoryName,
      tags,
      relatedKeywords: toRelatedKeywords(detail.categoryName, tags),
      createdAt: null,
    },
    relatedCards: similarCards.map((card) => ({
      cardId: card.cardId,
      title: card.title,
      categoryName: card.category?.categoryName ?? 'Uncategorized',
    })),
  };
}

function toKeyPoints(summary: string | null) {
  if (!summary?.trim()) return ['요약 내용이 아직 생성되지 않았습니다.'];

  const points = summary
    .split(/(?<=[.!?。])\s+|\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);

  return points.length > 0 ? points : [summary.trim()];
}

function toRelatedKeywords(categoryName: string, tags: string[]) {
  return Array.from(new Set([categoryName, ...tags].filter(Boolean)));
}

function getSourceIcon(type: KnowledgeSourceType) {
  if (type === 'IMAGE' || type === 'OCR') return Image;
  if (type === 'LINK') return LinkIcon;
  return FileText;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
