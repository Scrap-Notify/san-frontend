import { useState } from 'react';
import { CollectedDataPanel } from './components/CollectedDataPanel';
import { TILEditor } from './components/TILEditor';
import { TILWorkspaceHeader } from './components/TILWorkspaceHeader';
import { useTilPageLogic } from './hooks/useTilPageLogic';
import type { TILMode } from './components/TILModeTabs';

export function TilPage() {
  const {
    selectedDate,
    setSelectedDate,
    selectedSummaryId,
    setSelectedSummaryId,
    draft,
    setDraft,
    tilList,
    selectedTil,
    recallCardsQuery,
    generationStatusQuery,
    commitStatusQuery,
    generateMutation,
    commitMutation,
    generationTone,
    commitTone,
  } = useTilPageLogic();
  const [activeTab, setActiveTab] = useState<TILMode>('drafts');

  const dateLabel = formatDateForDisplay(selectedDate);

  return (
    <section className="flex h-[calc(100vh-6rem)] min-h-[720px] w-full min-w-0 flex-col gap-dashboard-gap text-text-primary">
      <TILWorkspaceHeader
        activeTab={activeTab}
        dateLabel={dateLabel}
        onTabChange={setActiveTab}
        onSearch={(value) => console.log(value)}
      />

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,2fr)_24rem] gap-dashboard-gap overflow-hidden">
        <TILEditor
          activeTab={activeTab}
          draft={draft}
          setDraft={setDraft}
          tilList={tilList}
          selectedTil={selectedTil}
          setSelectedSummaryId={setSelectedSummaryId}
          generateMutation={generateMutation}
          commitMutation={commitMutation}
          generationStatusQuery={generationStatusQuery}
          commitStatusQuery={commitStatusQuery}
        />

        <CollectedDataPanel />
      </div>
    </section>
  );
}

function formatDateForDisplay(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
