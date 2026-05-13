import { Leaf } from 'lucide-react';

interface ContentEmptyStateProps {
  title: string;
  description: string;
}

export function ContentEmptyState({ title, description }: ContentEmptyStateProps) {
  return (
    <div className="flex w-full flex-col-reverse items-center justify-center py-20 text-center">
      <div className="flex max-w-2xl flex-col items-center gap-4">
        <h2 className="text-h1-bold text-text-primary">{title}</h2>
        <p className="whitespace-pre-line text-body-lg font-medium leading-7 text-text-secondary">
          {description}
        </p>
      </div>

      <div className="relative pb-10">
        <div className="absolute left-1/2 top-4 h-[296px] w-64 -translate-x-1/2 rounded-full bg-primary-signal/5" />
        <div className="relative flex h-64 w-64 items-center justify-center rounded-leaf bg-misty-teal/40 text-teal backdrop-blur-xl">
          <Leaf size={86} strokeWidth={1.3} className="text-teal/70" aria-hidden="true" />
          <span className="absolute right-16 top-20 h-1.5 w-1.5 rounded-full bg-primary-signal/40 shadow-[0_0_10px_#00ffc2]" />
          <span className="absolute bottom-20 left-16 h-1 w-1 rounded-full bg-primary-signal/30 shadow-[0_0_8px_#00ffc2]" />
          <span className="absolute bottom-16 right-20 h-2 w-2 rounded-full bg-primary-signal/20 opacity-50 shadow-[0_0_12px_#00ffc2]" />
        </div>
      </div>
    </div>
  );
}
