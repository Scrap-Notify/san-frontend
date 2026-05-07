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
    <nav className="flex items-center gap-dashboard-gap">
      {tabs.map((tab) => {
        const active = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange?.(tab.key)}
            className={[
              'rounded-leaf px-sm py-xs transition hover:glow-neon',
              active
                ? 'bg-primary-signal/10 text-body-main-bold text-primary-signal glow-neon'
                : 'text-body-main text-text-secondary hover:bg-surface-container hover:text-text-primary',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
