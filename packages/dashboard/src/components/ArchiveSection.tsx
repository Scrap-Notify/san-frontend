import { ArrowLeft, ArrowRight, Brain, FlaskConical, NotebookText } from 'lucide-react';

const archiveCards = [
  {
    title: '기억의 시각적 위계 설정',
    date: '2024. 05. 21',
    summary: '우리의 뇌는 정보를 선형으로 저장하지 않는다. 비선형적 지식 구조를 효과적으로 탐색할 수 있는 노드 시스템의...',
    tags: ['#Psychology', '#Cognition'],
    icon: Brain,
  },
  {
    title: 'Bioluminescence 시스템 고안',
    date: '2024. 05. 18',
    summary: '깊은 숲속의 어둠 속에서 빛나는 생물체들로부터 영감을 받은 컬러 스킴 정의. 명도 대비가 아닌 채도 대비를 활용한...',
    tags: ['#Colors', '#Systems'],
    icon: FlaskConical,
  },
  {
    title: '바이오필릭 디자인과 UI의 결합',
    date: '2024. 05. 24',
    summary: '자연의 곡선과 색채를 디지털 환경에 이식하는 방법에 대한 연구. 특히 빛의 감도를 조절하여 사용자 경험을...',
    tags: ['#Design', '#Research'],
    icon: NotebookText,
  },
];

export function ArchiveSection() {
  return (
    <section className="pb-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-4xl font-black text-[#fbfffa]">Archive</h2>
          <p className="mt-1 text-xl text-[#b9cbc1]">저장된 기억의 파편들</p>
        </div>

        <div className="flex gap-4">
          {[ArrowLeft, ArrowRight].map((Icon, index) => (
            <button
              key={index}
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full border border-[#3a4a43] text-[#b9cbc1] transition hover:border-[#00ffc2]/60 hover:text-[#00ffc2]"
            >
              <Icon size={20} />
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <div className="absolute -inset-x-10 -top-8 bottom-[-80px] rounded-[48px] bg-[radial-gradient(circle_at_center,rgba(0,255,194,0.12),transparent_62%)] blur-2xl" />

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {archiveCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="flex min-h-[308px] flex-col justify-between rounded-tl-[48px] rounded-br-[48px] rounded-tr-lg rounded-bl-lg border-l border-t border-[#83958c]/10 bg-[#1c2023]/60 p-8 shadow-[0_40px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl"
              >
                <div>
                  <div className="mb-7 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-tl-[48px] rounded-br-[48px] rounded-tr-lg rounded-bl-lg bg-[#1e5056]/30 text-[#00ffc2]">
                      <Icon size={22} />
                    </div>

                    <time className="text-xs font-bold uppercase tracking-[0.08em] text-[#b9cbc1]">
                      {card.date}
                    </time>
                  </div>

                  <h3 className="text-xl font-bold leading-snug text-[#fbfffa]">
                    {card.title}
                  </h3>

                  <p className="mt-4 max-w-[320px] text-sm font-medium leading-7 text-[#b9cbc1]">
                    {card.summary}
                  </p>
                </div>

                <div className="mt-8 flex gap-2">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-tl-[48px] rounded-br-[48px] rounded-tr-lg rounded-bl-lg bg-[#313539]/50 px-3 py-1 text-[10px] text-[#b9cbc1]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}