import { create } from 'zustand';
import type { ScrapCard } from '@san/shared/src/types';

interface ScrapStore {
  cards: ScrapCard[];
  viewMode: 'card' | 'graph';
  setCards: (cards: ScrapCard[]) => void;
  setViewMode: (mode: 'card' | 'graph') => void;
}

export const useScrapStore = create<ScrapStore>((set) => ({
  cards: [],
  viewMode: 'card',
  setCards: (cards) => set({ cards }),
  setViewMode: (viewMode) => set({ viewMode }),
}));