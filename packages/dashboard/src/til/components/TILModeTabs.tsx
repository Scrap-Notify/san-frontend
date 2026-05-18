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
    <nav className="flex h-9 items-center gap-0.5 rounded-md border border-white/10 bg-white/[0.035] p-0.5">
      {tabs.map((tab) => {
        const active = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange?.(tab.key)}
            className={[
              'flex h-8 min-w-[78px] items-center justify-center rounded px-3 text-sm font-semibold transition-colors',
              active
                ? 'bg-action-accent text-black'
                : 'text-text-secondary hover:bg-white/[0.06] hover:text-white',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
