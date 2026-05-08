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
    sources: [mockSource],
  };
}

const mockSource: TilSourceContentResponse = {
  cardId: '22222222-2222-4222-8222-222222222222',
  scrapId: '33333333-3333-4333-8333-333333333333',
  title: 'Mock source scrap',
  sourceType: 'TEXT',
  rawContent: 'This is a development-only source scrap used to verify that the TIL source panel is wired correctly.',
  sourceUrl: null,
  imageUrl: null,
  category: {
    categoryId: '44444444-4444-4444-8444-444444444444',
    categoryName: 'Dev Mock',
  },
  createdAt: '2026-05-08T09:00:00',
};
