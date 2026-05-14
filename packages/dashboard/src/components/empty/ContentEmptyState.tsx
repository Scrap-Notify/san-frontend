import { Leaf } from 'lucide-react';

interface ContentEmptyStateProps {
  title: string;
  description: string;
}

export function ContentEmptyState({ title, description }: ContentEmptyStateProps) {
  return (
    <div className="flex w-full flex-col-reverse items-center justify-center py-14 text-center">
      <div className="flex max-w-xl flex-col items-center gap-3">
        <h2 className="text-h2-bold text-text-primary">{title}</h2>
        <p className="whitespace-pre-line text-body-main font-medium leading-6 text-text-secondary">
          {description}
        </p>
      </div>

      <div className="pb-8 text-primary-signal">
        <Leaf size={72} strokeWidth={1.4} aria-hidden="true" />
      </div>
    </div>
  );
}
