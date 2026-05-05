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
          className="rounded-lg border border-white/5 bg-white/[0.03] p-4 transition hover:border-[#4ADE80]/20 hover:bg-white/[0.06]"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-sm font-bold text-slate-200">{card.title}</h3>
            <span className="shrink-0 text-[10px] text-slate-600">
              {formatDate(card.createdAt)}
            </span>
          </div>
          {card.summary ? (
            <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{card.summary}</p>
          ) : null}
          {card.tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {card.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.tagId}
                  className="rounded-md border border-white/5 bg-slate-900 px-2 py-0.5 text-[9px] font-bold text-slate-500"
                >
                  #{tag.tagName}
                </span>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}
