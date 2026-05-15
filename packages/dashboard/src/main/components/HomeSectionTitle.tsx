import type { ReactNode } from 'react';

export function HomeSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="bg-gradient-to-r from-white to-white/40 bg-clip-text text-h1-bold text-transparent">
      {children}
    </h2>
  );
}
