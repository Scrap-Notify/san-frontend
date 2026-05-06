import type { KnowledgeCardResponse } from '@san/shared';
import { CurvedButton } from '../../../../ui/src/components/Button/CurvedButton';

interface RelatedCardsProps {
  cards: KnowledgeCardResponse[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  hasScrapContext: boolean;
  onLogin: () => void;
}

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function RelatedCards({
  cards,
  isAuthenticated,
  isLoading,
  error,
  hasScrapContext,
  onLogin,
}: RelatedCardsProps) {
  if (!hasScrapContext) {
    return (
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <p className="text-sm font-semibold text-slate-400">유사 지식 카드</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          지식을 수집하시면 유사한 지식 카드를 보여드립니다. 웹에서 유용한 정보를 발견하면 스크랩해 보세요.
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-[#4ADE80]/20 bg-[#4ADE80]/5 p-4">
        <p className="text-sm font-semibold text-slate-300">로그인하시면 연관 지식 카드를 확인할 수 있습니다.</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          지식 카드의 유사도를 높이려면 대시보드에서 더 많은 지식 카드를 저장해 보세요.
        </p>
        <CurvedButton
          onClick={onLogin}
          size="sm"
          className="mt-3"
        >
          로그인
        </CurvedButton>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <p className="text-sm font-semibold text-slate-400">유사 지식 카드를 찾는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4">
        <p className="text-sm font-semibold text-red-300">유사 지식 카드를 불러올 수 없습니다</p>
        <p className="mt-1 text-xs leading-5 text-red-200/70">{error}</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
        <p className="text-sm font-semibold text-slate-400">유사 지식 카드를 찾을 수 없습니다</p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          대시보드에서 더 많은 지식 카드를 저장하여 유사도를 높여보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <article
          key={card.cardId}
          className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative gap-3 p-5 rounded-tl-[48px] rounded-tr-lg rounded-bl-lg rounded-br-[48px] bg-[#1c2023] border-t border-r-0 border-b-0 border-l border-[#3a4a43]/30"
        >
          <div className="flex justify-between items-start self-stretch flex-grow-0 flex-shrink-0 relative">
            <p className="flex-grow-0 flex-shrink-0 text-base font-bold text-left text-[#fbfffa]">
              {card.title}
            </p>
            <svg
              width={11}
              height={11}
              viewBox="0 0 11 11"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="flex-grow-0 flex-shrink-0"
              preserveAspectRatio="none"
            >
              <path
                d="M1.16667 10.5C0.845833 10.5 0.571181 10.3858 0.342708 10.1573C0.114236 9.92882 0 9.65417 0 9.33333V1.16667C0 0.845833 0.114236 0.571181 0.342708 0.342708C0.571181 0.114236 0.845833 0 1.16667 0H5.25V1.16667H1.16667V9.33333H9.33333V5.25H10.5V9.33333C10.5 9.65417 10.3858 9.92882 10.1573 10.1573C9.92882 10.3858 9.65417 10.5 9.33333 10.5H1.16667ZM3.90833 7.40833L3.09167 6.59167L8.51667 1.16667H6.41667V0H10.5V4.08333H9.33333V1.98333L3.90833 7.40833Z"
                fill="#B9CBC1"
              />
            </svg>
          </div>

          <div className="self-stretch flex-grow-0 flex-shrink-0 h-[68.25px] relative overflow-hidden">
            <p className="w-[307.85px] absolute left-0 top-[-1.25px] text-sm text-left text-[#b9cbc1]">
              {card.summary?.split('\n').map((line, index) => (
                <span key={index} className="w-[307.85px] text-sm text-left text-[#b9cbc1]">
                  {line}
                  <br />
                </span>
              ))}
            </p>
          </div>

          {card.tags.length > 0 ? (
            <div className="flex justify-start items-start self-stretch flex-grow-0 flex-shrink-0 gap-2 pt-1">
              {card.tags.slice(0, 3).map((tag) => (
                <div
                  key={tag.tagId}
                  className="flex flex-col justify-start items-start self-stretch flex-grow-0 flex-shrink-0 relative px-2.5 py-1 rounded-full bg-[#00ffc2]/5 border border-[#00ffc2]/20"
                >
                  <p className="flex-grow-0 flex-shrink-0 text-[10px] font-bold text-left uppercase text-[#00ffc2]">
                    {tag.tagName}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
