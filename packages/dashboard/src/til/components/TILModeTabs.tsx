export type TILMode = 'drafts' | 'edit' | 'preview';

interface TILModeTabsProps {
  activeTab: TILMode;
  onChange?: (tab: TILMode) => void;
}

const tabs: Array<{ key: TILMode; label: string }> = [
  { key: 'drafts', label: 'Drafts' },
  { key: 'edit', label: 'Edit' },
  { key: 'preview', label: 'Preview' },
];

export function TILModeTabs({ activeTab, onChange }: TILModeTabsProps) {
  return (
    <nav className="flex items-center gap-1 rounded-lg border border-white/5 bg-surface-container p-1">
      {tabs.map((tab) => {
        const active = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange?.(tab.key)}
            className={[
              'rounded-md px-4 py-1.5 text-sm font-medium transition',
              active
                ? 'bg-surface-highest text-white shadow'
                : 'text-text-secondary hover:text-white hover:bg-surface-highest/50',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
