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
    <nav className="flex items-center gap-8">
      {tabs.map((tab) => {
        const active = tab.key === activeTab;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange?.(tab.key)}
            className={[
              'pb-1 text-base transition',
              active
                ? 'border-b-2 border-[#00ffc2] font-bold text-[#00ffc2]'
                : 'text-[#b9cbc1] hover:text-[#e0e3e7]',
            ].join(' ')}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}