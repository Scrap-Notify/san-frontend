import type { ReactNode } from 'react';
import type { KnowledgeCardResponse } from '@san/shared';
import { RecentKnowledgeList } from './RecentKnowledgeList';

const TITLE = '\uC720\uC0AC \uC9C0\uC2DD';
const LOADING_MESSAGE = '\uC720\uC0AC\uD55C \uC9C0\uC2DD\uC744 \uCC3E\uB294 \uC911\uC774\uC5D0\uC694.';
const ERROR_MESSAGE = '\uC720\uC0AC \uC9C0\uC2DD\uC744 \uBD88\uB7EC\uC624\uC9C0 \uBABB\uD588\uC5B4\uC694.';
const EMPTY_TITLE = '\uC720\uC0AC\uD55C \uC9C0\uC2DD\uC774 \uC5C6\uC5B4\uC694.';

interface SimilarKnowledgeListProps {
  cards: KnowledgeCardResponse[];
  isLoading: boolean;
  error: string | null;
  action?: ReactNode;
  isScrollable?: boolean;
}

export function SimilarKnowledgeList({
  cards,
  isLoading,
  error,
  action,
  isScrollable = true,
}: SimilarKnowledgeListProps) {
  return (
    <RecentKnowledgeList
      cards={cards}
      isLoading={isLoading}
      error={error}
      action={action}
      isScrollable={isScrollable}
      title={TITLE}
      loadingMessage={LOADING_MESSAGE}
      errorMessage={ERROR_MESSAGE}
      emptyTitle={EMPTY_TITLE}
    />
  );
}
