import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Hash,
  Image,
  Link as LinkIcon,
  Sparkles,
  Tags,
} from 'lucide-react';

export type KnowledgeSourceType = 'LINK' | 'IMAGE' | 'PDF' | 'OCR' | 'TEXT';

export interface KnowledgeCardDetailData {
  cardId: string;
  source: {
    type: KnowledgeSourceType;
    url?: string | null;
    previewUrl?: string | null;
    rawContent: string;
    collectedAt: string;
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
    createdAt: string;
  };
  relatedCards: Array<{
    cardId: string;
    title: string;
    categoryName: string;
  }>;
}

const sectionCardClass = 'rounded-tl-[32px] rounded-br-[32px] rounded-tr-2xl rounded-bl-2xl border border-white/5 bg-[#131718] p-6 shadow-md';
const panelCardClass = 'rounded-tl-[28px] rounded-br-[28px] rounded-tr-xl rounded-bl-xl border border-white/5 bg-[#181c1f] p-5';

const MOCK_CARD_DETAIL: KnowledgeCardDetailData = {
  cardId: 'mock-card-1',
  source: {
    type: 'LINK',
    url: 'https://research.biolume.eco/system-analysis-2024',
    rawContent:
      '자생적 지식 생태계는 비정형 원본 데이터를 사용자의 사고 흐름에 맞게 재배열하는 구조를 가진다. 수집된 링크, 이미지, 문서는 먼저 원본으로 저장되고, 이후 정제된 텍스트와 최종 지식카드로 단계적으로 확장된다.',
    collectedAt: '2024-05-22T10:24:00',
  },
  processedText: {
    refinedContent:
      '자생적 지식 생태계는 비정형 데이터를 구조화해 사용자가 다시 활용할 수 있는 지식 단위로 변환하는 시스템이다.\n\n원본 데이터는 먼저 수집 상태 그대로 보존되고, AI 정제 단계에서 기사 본문, OCR 텍스트, PDF 추출문처럼 읽기 쉬운 텍스트로 변환된다. 이 정제 텍스트는 최종 카드 생성의 입력이 될 수 있지만, 생성 이후 사용자가 오타나 줄바꿈을 수정하더라도 기존 최종 지식카드가 자동으로 다시 만들어지지는 않는다.\n\n최종 지식카드는 생성 시점의 정제 텍스트를 기준으로 제목, 요약, 카테고리, 태그를 구성한다.',
    updatedAt: '2024-05-22T10:26:00',
  },
  finalCard: {
    title: '자생적 지식 생태계의 구조적 메커니즘',
    summary:
      '원본 데이터가 즉시 저장된 뒤 AI 정제를 거쳐 읽기 가능한 텍스트로 변환되고, 최종적으로 지식카드가 생성되는 흐름을 설명한다. 이 구조는 원본 보존, 정제 결과 활용, 카드 요약을 분리해 데이터의 출처와 생성 시점을 명확하게 유지한다.',
    keyPoints: [
      '원본 데이터는 저장 또는 재사용된 Scrap을 기준으로 보존된다.',
      'AI 1차 정제 텍스트는 OCR, 본문 추출, PDF 텍스트 추출처럼 읽기 쉬운 형태를 담당한다.',
      '최종 지식카드는 최초 생성 시점의 정제 텍스트를 기준으로 요약과 태그를 생성한다.',
    ],
    categoryName: 'Knowledge System',
    tags: ['AI 정제', '지식카드', '데이터 파이프라인'],
    relatedKeywords: ['SCRAP_REFINE', 'CARD_ANALYSIS', 'refinedContent', 'Knowledge Graph'],
    createdAt: '2024-05-22T10:28:00',
  },
  relatedCards: [
    { cardId: 'mock-card-2', title: '비동기 작업 상태 모델', categoryName: 'Backend' },
    { cardId: 'mock-card-3', title: 'OCR 텍스트 정제 기준', categoryName: 'AI Pipeline' },
    { cardId: 'mock-card-4', title: '지식 아카이브 탐색 UX', categoryName: 'Product' },
  ],
};

export function KnowledgeCardDetailPage() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  const data = useMemo(() => ({ ...MOCK_CARD_DETAIL, cardId: cardId ?? MOCK_CARD_DETAIL.cardId }), [cardId]);

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
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#4ade80]">Knowledge Card Detail</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-extrabold leading-tight text-white md:text-5xl">
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
          <ProcessedTextSection processedText={data.processedText} />
          <FinalKnowledgeCardSection finalCard={data.finalCard} />
        </div>
        <DetailMetaPanel data={data} />
      </div>
    </section>
  );
}

function SourceDataSection({ source }: { source: KnowledgeCardDetailData['source'] }) {
  const SourceIcon = getSourceIcon(source.type);

  return (
    <section className={sectionCardClass}>
      <SectionHeader icon={<FileText size={18} />} title="원본 데이터" description="최초 수집된 원본 데이터입니다. 이 영역은 읽기 전용입니다." />

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="min-w-0 rounded-2xl border border-white/5 bg-[#0B0D0F]/60 p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#4ade80]/20 bg-[#4ade80]/5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#4ade80]">
              <SourceIcon size={14} aria-hidden="true" />
              {source.type}
            </span>
            <span className="text-xs text-white/40">수집 일시 {formatDateTime(source.collectedAt)}</span>
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

          <p className="whitespace-pre-wrap text-sm leading-7 text-white/60">{source.rawContent}</p>
        </div>

        <div className="flex min-h-48 items-center justify-center rounded-2xl border border-white/5 bg-[#181c1f] p-5 text-center">
          {source.previewUrl ? (
            <img src={source.previewUrl} alt="" className="max-h-56 rounded-xl object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-3 text-white/40">
              <SourceIcon size={34} strokeWidth={1.5} aria-hidden="true" />
              <p className="text-sm leading-6">원본 preview가 연결되면 이미지 또는 PDF 미리보기가 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ProcessedTextSection({ processedText }: { processedText: KnowledgeCardDetailData['processedText'] }) {
  const [value, setValue] = useState(processedText.refinedContent);

  return (
    <section className={sectionCardClass}>
      <SectionHeader
        icon={<Sparkles size={18} />}
        title="AI 1차 정제 텍스트"
        description="원본을 읽기 쉽게 변환한 텍스트입니다. 오타나 OCR 오류 정도만 수정할 수 있으며, 수정 내용은 기존 최종 지식카드에 자동 반영되지 않습니다."
      />

      <div className="mt-6 rounded-2xl border border-white/5 bg-[#0B0D0F]/60 p-1">
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          spellCheck={false}
          className="min-h-[22rem] w-full resize-y rounded-[14px] bg-transparent px-5 py-4 text-base leading-8 text-white/70 outline-none placeholder:text-white/20 focus:bg-white/[0.02]"
          aria-label="AI 1차 정제 텍스트"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-white/35">
        <span>문서 편집이 아니라 정제 텍스트 확인과 경미한 보정 용도입니다.</span>
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
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">AI Summary</p>
            <p className="mt-4 text-base leading-8 text-white/70">{finalCard.summary}</p>
          </div>

          <div className="mt-5 rounded-2xl border border-white/5 bg-[#181c1f] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">핵심 요약</p>
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
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/35">
              <Tags size={14} aria-hidden="true" />
              태그
            </p>
            <TagList values={finalCard.tags} />
          </div>
          <div className={panelCardClass}>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/35">
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

function DetailMetaPanel({ data }: { data: KnowledgeCardDetailData }) {
  return (
    <aside className="flex min-w-0 flex-col gap-5 xl:sticky xl:top-28 xl:self-start">
      <div className={panelCardClass}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#4ade80]">Metadata</p>
        <dl className="mt-5 space-y-4 text-sm">
          <MetaRow label="Card ID" value={data.cardId} />
          <MetaRow label="Source" value={data.source.type} />
          <MetaRow label="Created" value={formatDateTime(data.finalCard.createdAt)} />
          <MetaRow label="Collected" value={formatDateTime(data.source.collectedAt)} />
        </dl>
      </div>

      <div className={panelCardClass}>
        <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-white/35">
          <Tags size={14} aria-hidden="true" />
          Tags
        </p>
        <TagList values={data.finalCard.tags} />
      </div>

      <div className={panelCardClass}>
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.18em] text-white/35">관련 카드</p>
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
      </div>
    </aside>
  );
}

function SectionHeader({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-tl-[18px] rounded-br-[18px] rounded-tr-md rounded-bl-md bg-[#4ade80]/10 text-[#4ade80]">
          {icon}
        </span>
        <h2 className="text-xl font-bold text-white">{title}</h2>
      </div>
      <p className="max-w-2xl text-sm leading-6 text-white/45 sm:text-right">{description}</p>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className={panelCardClass}>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/35">{label}</p>
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
  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span
          key={value}
          className={[
            'rounded-md border px-3 py-1.5 text-xs font-medium',
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
