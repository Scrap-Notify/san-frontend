import type { TilResponse, TilSourceContentResponse, TilSourcesResponse } from '@san/shared';

export const MOCK_TIL_SUMMARY_ID = '11111111-1111-4111-8111-111111111111';

export function shouldUseTilMockFallback(tilList: TilResponse[] | undefined) {
  return import.meta.env.DEV && (!tilList || tilList.length === 0);
}

export function isMockTilSummaryId(summaryId: string | null | undefined) {
  return import.meta.env.DEV && summaryId === MOCK_TIL_SUMMARY_ID;
}

export function createMockTil(targetDate: string): TilResponse {
  const timestamp = `${targetDate}T09:00:00`;

  return {
    summaryId: MOCK_TIL_SUMMARY_ID,
    targetDate,
    title: 'Mock TIL - Frontend Integration Check',
    content: [
      '# Mock TIL - Frontend Integration Check',
      '',
      '## API flow',
      '',
      '- The TIL page still calls the real backend API first.',
      '- This mock appears only in development when the backend returns no TIL rows.',
      '- Once real data exists for the selected date, this mock is hidden automatically.',
      '',
      '## Source scrap rendering',
      '',
      'The right panel is populated from the same summaryId path that real source scraps use.',
    ].join('\n'),
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function getMockTilSources(): TilSourcesResponse {
  return {
    sources: [
      {
        cardId: '1',
        scrapId: '1',
        title: 'React 19 New Features Summary',
        sourceType: 'TEXT',
        rawContent: 'React 19 introduces exciting new features like the "use" hook, better error handling, and server components improvements.',
        sourceUrl: 'https://react.dev',
        imageUrl: null,
        category: { categoryId: 'c1', categoryName: 'Development' },
        createdAt: new Date().toISOString(),
      },
      {
        cardId: '2',
        scrapId: '2',
        title: 'Modern UI Design Trends 2026',
        sourceType: 'IMAGE',
        rawContent: 'A beautiful dashboard design with glassmorphism and vibrant gradients.',
        sourceUrl: 'https://dribbble.com',
        imageUrl: 'https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop',
        category: { categoryId: 'c2', categoryName: 'Design' },
        createdAt: new Date().toISOString(),
      },
      {
        cardId: '3',
        scrapId: '3',
        title: 'Tailwind CSS v4 Release Notes',
        sourceType: 'LINK',
        rawContent: 'Check out the latest updates in Tailwind CSS v4, including the new engine and CSS-first configuration.',
        sourceUrl: 'https://tailwindcss.com/blog',
        imageUrl: null,
        category: { categoryId: 'c1', categoryName: 'Development' },
        createdAt: new Date().toISOString(),
      },
      {
        cardId: '4',
        scrapId: '4',
        title: 'TypeScript 5.5 Advanced Patterns',
        sourceType: 'TEXT',
        rawContent: 'Exploring inferred type predicates and new utility types in the latest TS release for safer codebases.',
        sourceUrl: null,
        imageUrl: null,
        category: { categoryId: 'c1', categoryName: 'Development' },
        createdAt: new Date().toISOString(),
      },
      {
        cardId: '5',
        scrapId: '5',
        title: 'Cyberpunk Aesthetic Palette',
        sourceType: 'IMAGE',
        rawContent: 'Neon-infused color schemes for futuristic application interfaces.',
        sourceUrl: 'https://pinterest.com',
        imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
        category: { categoryId: 'c2', categoryName: 'Design' },
        createdAt: new Date().toISOString(),
      },
      {
        cardId: '6',
        scrapId: '6',
        title: 'System Architecture Principles',
        sourceType: 'TEXT',
        rawContent: 'Understanding SOLID, DRY, and KISS principles to build scalable and maintainable backend systems.',
        sourceUrl: 'https://medium.com',
        imageUrl: null,
        category: { categoryId: 'c3', categoryName: 'Architecture' },
        createdAt: new Date().toISOString(),
      }
    ],
  };
}
