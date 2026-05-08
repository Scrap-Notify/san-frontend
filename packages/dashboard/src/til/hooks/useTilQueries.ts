import { useQuery } from '@tanstack/react-query';
import { asyncJobsApi, tilApi } from '@dashboard/api/client';

export const tilKeys = {
  all: ['til'] as const,
  byDate: (date: string) => [...tilKeys.all, date] as const,
  recallCards: (summaryId: string | null | undefined) => [...tilKeys.all, 'recall-cards', summaryId] as const,
  sources: (summaryId: string | null | undefined) => [...tilKeys.all, 'sources', summaryId] as const,
  asyncJob: (jobId: string | null | undefined) => ['async-job', jobId] as const,
};

export function useTilByDate(date: string) {
  return useQuery({
    queryKey: tilKeys.byDate(date),
    queryFn: () => tilApi.getByDate(date),
  });
}

export function useTilRecallCards(summaryId: string | null | undefined) {
  return useQuery({
    queryKey: tilKeys.recallCards(summaryId),
    queryFn: async () => {
      // For testing purposes, return mock data
      return {
        sources: [
          {
            cardId: '1',
            title: 'Adam: A Method for Stochastic Optimization',
            sourceType: 'LINK',
            rawContent: 'arXiv paper by Kingma & Ba (2014) describing the core Adam algorithm...',
            sourceUrl: 'https://arxiv.org/abs/1412.6980',
            category: { categoryName: 'RESEARCH' },
            createdAt: '2026-05-08T10:30:00',
          },
          {
            cardId: '2',
            title: 'PyTorch: Optimizer Documentation',
            sourceType: 'LINK',
            rawContent: 'Official documentation for torch.optim implementations and hyperparameters.',
            sourceUrl: 'https://pytorch.org/docs/stable/optim.html',
            category: { categoryName: 'WEB PAGE' },
            createdAt: '2026-05-08T11:00:00',
          },
          {
            cardId: '3',
            title: 'Gradient Descent vs Adam',
            sourceType: 'TEXT',
            rawContent: 'Comparison between traditional SGD and adaptive learning rate methods.',
            category: { categoryName: 'NOTE' },
            createdAt: '2026-05-08T12:00:00',
          },
          {
            cardId: '4',
            title: 'Learning Rate Schedulers',
            sourceType: 'LINK',
            rawContent: 'Blog post explaining StepLR, MultiStepLR and ExponentialLR in deep learning.',
            sourceUrl: 'https://example.com/blog/lr-schedulers',
            category: { categoryName: 'ARTICLE' },
            createdAt: '2026-05-08T13:00:00',
          },
          {
            cardId: '5',
            title: 'Loss Functions in Computer Vision',
            sourceType: 'IMAGE',
            rawContent: 'Visual representation of CrossEntropy and MSE loss surfaces.',
            imageUrl: 'https://example.com/loss-plot.png',
            category: { categoryName: 'VISUAL' },
            createdAt: '2026-05-08T14:00:00',
          },
          {
            cardId: '6',
            title: 'Backpropagation Algorithm',
            sourceType: 'TEXT',
            rawContent: 'Detailed derivation of the chain rule used in neural network training.',
            category: { categoryName: 'LECTURE' },
            createdAt: '2026-05-08T15:00:00',
          },
        ],
      };
      // Original API call: return tilApi.getRecallCards(summaryId ?? '');
    },
    enabled: true, // Always enabled for testing mock data
  });
}

export function useTilSources(summaryId: string | null | undefined) {
  return useQuery({
    queryKey: tilKeys.sources(summaryId),
    queryFn: () => tilApi.getSources(summaryId ?? ''),
    enabled: Boolean(summaryId),
  });
}

export function useTilAsyncJobStatus(jobId: string | null | undefined) {
  return useQuery({
    queryKey: tilKeys.asyncJob(jobId),
    queryFn: () => asyncJobsApi.getStatus(jobId ?? ''),
    enabled: Boolean(jobId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === 'PENDING' || status === 'PROCESSING' ? 1500 : false;
    },
  });
}
