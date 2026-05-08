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
    draft,
    setDraft,
    selectedTil,
    sourcesQuery,
    generationStatusQuery,
    commitStatusQuery,
    generateMutation,
    commitMutation,
    generationMessage,
    commitMessage,
  } = useTilPageLogic();

  const [activeTab, setActiveTab] = useState<TILMode>('drafts');
  const dateLabel = formatDateForDisplay(selectedDate);

  return (
    <section className="flex h-[calc(100vh-12rem)] min-h-[34rem] w-full min-w-0 flex-col gap-dashboard-gap bg-background text-text-primary">
      <TILWorkspaceHeader
        activeTab={activeTab}
        dateValue={selectedDate}
        dateLabel={dateLabel}
        onTabChange={setActiveTab}
        onDateChange={setSelectedDate}
        onSearch={(value) => console.log(value)}
      />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-dashboard-gap lg:grid-cols-[minmax(0,1fr)_24rem]">
        <TILEditor
          activeTab={activeTab}
          draft={draft}
          setDraft={setDraft}
          selectedTil={selectedTil}
          generateMutation={generateMutation}
          commitMutation={commitMutation}
          generationStatusQuery={generationStatusQuery}
          commitStatusQuery={commitStatusQuery}
          generationMessage={generationMessage}
          commitMessage={commitMessage}
        />

        <div className="hidden min-h-0 overflow-hidden lg:block">
          <CollectedDataPanel sourcesQuery={sourcesQuery} selectedTil={selectedTil} />
        </div>
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
