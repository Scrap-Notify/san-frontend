import type { GraphCategory, GraphLeaf } from './types';

export const graphFixtureCategories: Omit<GraphCategory, 'position' | 'sphere'>[] = [
  { id: 'nature', name: '자연' },
  { id: 'science', name: '과학' },
  { id: 'history', name: '역사' },
  { id: 'art', name: '예술' },
  { id: 'philosophy', name: '철학' },
];

export const graphFixtureLeavesByCategory: Record<string, Omit<GraphLeaf, 'position'>[]> = {
  nature: [
    {
      id: 'cycle',
      title: '자연의 순환',
      summary: '모든 생명은 서로 연결되어 순환한다. 작은 시작이 모여 거대한 변화를 만든다.',
      tags: ['자연', '순환'],
      collectedAt: '2024.05.31',
    },
    {
      id: 'water',
      title: '물의 지혜',
      summary: '흐름은 가장 낮은 곳을 향하지만, 결국 가장 넓은 생태계를 살린다.',
      tags: ['자연', '순환'],
      collectedAt: '2024.05.24',
    },
    {
      id: 'light',
      title: '빛의 언어',
      summary: '빛은 닿는 곳마다 형태와 온도를 바꾸며 보이지 않던 결을 드러낸다.',
      tags: ['자연', '감각'],
      collectedAt: '2024.05.19',
    },
    {
      id: 'wind',
      title: '바람의 기억',
      summary: '보이지 않는 움직임도 흔적을 남긴다. 방향은 사라져도 변화는 남는다.',
      tags: ['감각', '기억'],
      collectedAt: '2024.05.12',
    },
    {
      id: 'time',
      title: '시간의 흐름',
      summary: '시간은 겹겹이 쌓여 풍경을 만들고, 우리는 그 층위 위를 걷는다.',
      tags: ['기억', '순환'],
      collectedAt: '2024.05.03',
    },
  ],
};
