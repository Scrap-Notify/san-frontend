import { useMemo, useState } from 'react';

interface TilSource {
  id: string;
  title: string;
  origin: string;
  capturedAt: string;
  excerpt: string;
}

interface TilKnowledgeCard {
  id: string;
  title: string;
  tag: string;
  summary: string;
}

interface TilDay {
  date: string;
  label: string;
  draft: string;
  sources: TilSource[];
  cards: TilKnowledgeCard[];
}

const TIL_DAYS: TilDay[] = [
  {
    date: '2026-05-05',
    label: '2026.05.05',
    draft: [
      '# 2026.05.05 TIL',
      '',
      '## 오늘 배운 것',
      '- 검색 결과 페이지는 URL query를 기준으로 서버 검색 API를 호출하도록 정리했다.',
      '- GNB 검색바는 독립 컴포넌트로 분리하고, 입력 후 엔터 시 결과 페이지로 이동한다.',
      '- 대시보드 섹션은 실제 기능이 없는 영역을 과도하게 꾸미기보다 준비 상태를 명확히 보여주는 편이 낫다.',
      '',
      '## 내일 확인할 것',
      '- TIL 생성 API 응답 구조',
      '- 지식 카드와 원문 데이터의 연결 키',
      '- Markdown 저장 및 GitHub 연동 플로우',
    ].join('\n'),
    sources: [
      {
        id: 'source-1',
        title: '검색 API 명세 확인',
        origin: 'backend/SearchController',
        capturedAt: '10:24',
        excerpt: 'GET /search는 keyword, tag, fromDate, toDate, page, size를 쿼리로 받는다.',
      },
      {
        id: 'source-2',
        title: '대시보드 GNB 리팩토링',
        origin: 'dashboard/GNB',
        capturedAt: '14:08',
        excerpt: '검색바, GitHub 버튼, User 버튼을 한 줄 레이아웃으로 정리했다.',
      },
      {
        id: 'source-3',
        title: 'GraphSection 준비중 처리',
        origin: 'dashboard/GraphSection',
        capturedAt: '18:31',
        excerpt: '2차 배포 예정 기능은 네온 점선 영역으로 비워두는 방식이 적합하다.',
      },
    ],
    cards: [
      {
        id: 'card-1',
        title: 'React Router query 기반 검색 흐름',
        tag: 'React',
        summary: '검색어를 URL에 보존하면 새로고침과 공유 시에도 동일한 결과 화면을 복원할 수 있다.',
      },
      {
        id: 'card-2',
        title: 'Flex/Grid 기반 GNB 정렬',
        tag: 'UI',
        summary: '좁은 폭에서는 햄버거 메뉴로 접고, 넓은 폭에서는 주요 액션을 한 줄에 유지한다.',
      },
      {
        id: 'card-3',
        title: '미구현 섹션의 명시적 상태',
        tag: 'Product',
        summary: '임시 그래프보다 준비중 메시지가 사용자 기대치를 더 정확히 조정한다.',
      },
    ],
  },
  {
    date: '2026-05-04',
    label: '2026.05.04',
    draft: [
      '# 2026.05.04 TIL',
      '',
      '## 오늘 배운 것',
      '- Chrome extension manifest의 localhost host permission은 포트 와일드카드보다 origin 패턴을 맞춰야 한다.',
      '- Dropzone preview save 버튼은 공통 버튼 기본 스타일을 덮어써야 의도한 색상으로 보인다.',
      '',
      '## 남은 질문',
      '- 배포 환경별 extension URL 관리는 어떤 설정 파일에서 분기할지 결정이 필요하다.',
    ].join('\n'),
    sources: [
      {
        id: 'source-4',
        title: 'Extension manifest 검토',
        origin: 'extension/manifest',
        capturedAt: '11:16',
        excerpt: 'localhost와 실제 배포 주소를 모두 host_permissions에 포함했다.',
      },
      {
        id: 'source-5',
        title: 'Dropzone save 버튼 스타일',
        origin: 'extension/DropZone',
        capturedAt: '16:45',
        excerpt: '아이콘을 제거하고 네온 배경과 검정 텍스트로 CTA를 분명하게 만들었다.',
      },
    ],
    cards: [
      {
        id: 'card-4',
        title: 'Chrome extension host permission',
        tag: 'Extension',
        summary: '실행 환경별 origin을 manifest에 명시해야 외부 페이지와 안정적으로 통신할 수 있다.',
      },
      {
        id: 'card-5',
        title: '공통 버튼 스타일 override',
        tag: 'Design',
        summary: '공통 컴포넌트가 강한 스타일을 갖고 있으면 CTA 변형에는 className 우선순위가 중요하다.',
      },
    ],
  },
];

export function TilPage() {
  const [selectedDate, setSelectedDate] = useState(TIL_DAYS[0].date);
  const selectedTil = useMemo(
    () => TIL_DAYS.find((item) => item.date === selectedDate) ?? TIL_DAYS[0],
    [selectedDate],
  );
  const [draftByDate, setDraftByDate] = useState<Record<string, string>>(
    () => Object.fromEntries(TIL_DAYS.map((item) => [item.date, item.draft])),
  );
  const draft = draftByDate[selectedTil.date] ?? selectedTil.draft;

  return (
    <section className="flex w-full min-w-0 flex-col gap-8 py-6 text-[#fbfffa]">
      <header className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-widest text-[#00ffc2]">Recall</p>
          <h1 className="mt-2 text-4xl font-semibold">TIL</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#b9cbc1]">
            전날 수집한 지식 카드를 Markdown TIL 초안으로 정리합니다.
          </p>
        </div>

        <DateNavigator
          selectedDate={selectedDate}
          days={TIL_DAYS}
          onDateChange={setSelectedDate}
        />
      </header>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.8fr)]">
        <TilEditor
          value={draft}
          onChange={(value) =>
            setDraftByDate((current) => ({ ...current, [selectedTil.date]: value }))
          }
        />
        <SourceList sources={selectedTil.sources} />
      </div>

      <KnowledgeCardList cards={selectedTil.cards} />
    </section>
  );
}

function DateNavigator({
  selectedDate,
  days,
  onDateChange,
}: {
  selectedDate: string;
  days: TilDay[];
  onDateChange: (date: string) => void;
}) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-3 rounded-tl-[32px] rounded-tr-lg rounded-bl-lg rounded-br-[32px] border border-[#3a4a43]/30 bg-[#181c1f] p-2">
      {days.map((day) => {
        const active = day.date === selectedDate;
        return (
          <button
            key={day.date}
            type="button"
            onClick={() => onDateChange(day.date)}
            className={[
              'min-h-11 rounded-full px-5 text-sm font-bold transition',
              active
                ? 'bg-[#00ffc2] text-[#101417]'
                : 'text-[#b9cbc1] hover:bg-[#22282c] hover:text-[#fbfffa]',
            ].join(' ')}
          >
            {day.label}
          </button>
        );
      })}
    </div>
  );
}

function TilEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <section className="flex min-h-[34rem] min-w-0 flex-col overflow-hidden rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] border border-[#00ffc2]/25 bg-[#181c1f]">
      <div className="flex min-h-16 items-center justify-between gap-4 border-b border-[#3a4a43]/30 px-6">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#00ffc2]">Editor</p>
          <h2 className="text-lg font-semibold">TIL 초안</h2>
        </div>
        <span className="rounded-full border border-[#00ffc2]/30 px-3 py-1 text-xs font-bold text-[#00ffc2]">
          MD
        </span>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        className="min-h-0 flex-1 resize-none bg-[#101417]/70 p-6 font-mono text-sm leading-7 text-[#fbfffa] outline-none placeholder:text-[#83958c] focus:bg-[#101417]"
      />
    </section>
  );
}

function SourceList({ sources }: { sources: TilSource[] }) {
  return (
    <aside className="flex min-h-[34rem] min-w-0 flex-col rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] border border-[#3a4a43]/30 bg-[#181c1f] p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#00ffc2]">Sources</p>
          <h2 className="mt-1 text-lg font-semibold">사용된 원문 데이터</h2>
        </div>
        <span className="rounded-full bg-[#00ffc2]/10 px-3 py-1 text-xs font-bold text-[#00ffc2]">
          {sources.length}
        </span>
      </div>

      <div className="grid gap-3 overflow-y-auto pr-1">
        {sources.map((source) => (
          <article
            key={source.id}
            className="rounded-2xl border border-white/5 bg-[#101417]/70 p-4 transition hover:border-[#00ffc2]/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#fbfffa]">{source.title}</p>
                <p className="mt-1 text-xs font-semibold text-[#00ffc2]">{source.origin}</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-[#83958c]">{source.capturedAt}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-[#b9cbc1]">{source.excerpt}</p>
          </article>
        ))}
      </div>
    </aside>
  );
}

function KnowledgeCardList({ cards }: { cards: TilKnowledgeCard[] }) {
  return (
    <section className="min-w-0 rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] border border-dashed border-[#00ffc2]/35 bg-[#181c1f]/60 p-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#00ffc2]">Knowledge Cards</p>
          <h2 className="mt-1 text-xl font-semibold">해당일에 생성된 지식 카드</h2>
        </div>
        <span className="text-sm font-bold text-[#b9cbc1]">{cards.length} cards</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.id}
            className="flex min-h-44 flex-col rounded-2xl border border-[#3a4a43]/30 bg-[#101417] p-5 transition hover:-translate-y-0.5 hover:border-[#00ffc2]/35"
          >
            <span className="w-fit rounded-full bg-[#00ffc2] px-3 py-1 text-xs font-black text-[#101417]">
              #{card.tag}
            </span>
            <h3 className="mt-4 text-lg font-semibold leading-7 text-[#fbfffa]">{card.title}</h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#b9cbc1]">{card.summary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
