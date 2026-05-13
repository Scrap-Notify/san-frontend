import { useCallback, useState } from 'react';
import {
  getApiErrorMessage,
  toKnowledgeCardView,
  type CreateScrapRequest,
  type CreateScrapResponse,
  type KnowledgeCardResponse,
  type KnowledgeCardView,
} from '@san/shared';
import { asyncJobsApi, cardsApi, scrapsApi, s3Api } from '@extension/api/client';
import type { PendingScrap, SavedInsight } from '@extension/types';

const STORAGE_KEY = 'san:saved-insights';
const PENDING_STORAGE_KEY = 'san:pending-scrap';
const JOB_POLL_INTERVAL_MS = 1500;
const JOB_POLL_MAX_ATTEMPTS = 40;
const DUPLICATE_SCRAP_NOTICE = '\uC774\uBBF8 \uAC19\uC740 \uB370\uC774\uD130\uAC00 \uC218\uC9D1\uB418\uC5C8\uC5B4\uC694.';

function isPendingScrap(value: unknown): value is PendingScrap {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as Partial<PendingScrap>;
  return typeof maybe.source_type === 'string' && typeof maybe.title === 'string';
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForCardAnalysis(jobId: string) {
  for (let attempt = 0; attempt < JOB_POLL_MAX_ATTEMPTS; attempt += 1) {
    const job = await asyncJobsApi.getStatus(jobId);
    if (job.status === 'COMPLETED') return;
    if (job.status === 'FAILED') {
      throw new Error(job.errorMessage ?? 'Knowledge card creation failed.');
    }
    await delay(JOB_POLL_INTERVAL_MS);
  }

  throw new Error('Knowledge card creation timed out.');
}

async function resolveCreatedCard(response: CreateScrapResponse) {
  if (response.jobId) {
    await waitForCardAnalysis(response.jobId);
  }

  const cardResponse = response.cardId
    ? { cardId: response.cardId }
    : await cardsApi.getByScrapId(response.scrapId);
  const cardsResponse = await cardsApi.getAll();
  const card = cardsResponse.cards.find((item) => item.cardId === cardResponse.cardId) ?? null;

  return {
    cardId: cardResponse.cardId,
    card,
  };
}

function toSavedInsight(scrap: PendingScrap): SavedInsight {
  const id = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    ...scrap,
    id,
    created_at: new Date().toISOString(),
  };
}

function toCreateScrapRequest(scrap: PendingScrap, imageObjectKey?: string | null): CreateScrapRequest {
  if (scrap.source_type === 'LINK') {
    return {
      sourceUrl: scrap.source_url,
      rawContent: scrap.source_url ?? scrap.raw_content ?? scrap.title,
    };
  }

  if (scrap.source_type === 'IMAGE') {
    return {
      sourceUrl: scrap.source_url,
      rawContent: scrap.image_url ?? scrap.raw_content ?? scrap.image_file_name ?? scrap.title,
      imageObjectKey,
    };
  }

  return {
    sourceUrl: scrap.source_url,
    rawContent: scrap.raw_content ?? scrap.source_url ?? scrap.image_file_name ?? scrap.title,
  };
}

export async function loadSavedInsights(): Promise<SavedInsight[]> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const value = stored[STORAGE_KEY];
  return Array.isArray(value) ? value : [];
}

export async function saveInsights(cards: SavedInsight[]) {
  await chrome.storage.local.set({ [STORAGE_KEY]: cards });
}

export async function loadPendingScrap(): Promise<PendingScrap | null> {
  const stored = await chrome.storage.local.get(PENDING_STORAGE_KEY);
  const value = stored[PENDING_STORAGE_KEY];
  return isPendingScrap(value) ? value : null;
}

export async function savePendingScrap(scrap: PendingScrap | null) {
  if (scrap) {
    await chrome.storage.local.set({ [PENDING_STORAGE_KEY]: scrap });
    return;
  }
  await chrome.storage.local.remove(PENDING_STORAGE_KEY);
}

interface UseSaveScrapParams {
  cards: SavedInsight[];
  setCards: (next: SavedInsight[]) => void;
  pendingScrap: PendingScrap | null;
  setPendingScrap: (next: PendingScrap | null) => void;
  pendingImageFile: File | null;
  setPendingImageFile: (next: File | null) => void;
  isAuthenticated: boolean;
  setRelatedCards: (next: KnowledgeCardResponse[]) => void;
  setRelatedError: (next: string | null) => void;
  setIsLoadingRelated: (next: boolean) => void;
  setHasRelatedResult: (next: boolean) => void;
  isRestoringPendingImage: boolean;
  deletePendingImageFile: (id: string | null | undefined) => void | Promise<void>;
  setCreatedCard: (next: KnowledgeCardView | null) => void;
  refreshRecentCards: () => void | Promise<void>;
}

export function useSaveScrap({
  cards,
  setCards,
  pendingScrap,
  setPendingScrap,
  pendingImageFile,
  setPendingImageFile,
  isAuthenticated,
  setRelatedCards,
  setRelatedError,
  setIsLoadingRelated,
  setHasRelatedResult,
  isRestoringPendingImage,
  deletePendingImageFile,
  setCreatedCard,
  refreshRecentCards,
}: UseSaveScrapParams) {
  const [isSaving, setIsSaving] = useState(false);
  const [savingLabel, setSavingLabel] = useState('Saving...');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const clearSaveFeedback = useCallback(() => {
    setSaveError(null);
    setSaveNotice(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (!pendingScrap) return;

    setIsSaving(true);
    setSavingLabel(isAuthenticated ? 'Saving scrap...' : 'Saving locally...');
    setSaveError(null);
    setSaveNotice(null);
    setRelatedError(null);
    setRelatedCards([]);
    setHasRelatedResult(false);
    setCreatedCard(null);
    setIsLoadingRelated(false);

    try {
      if (isRestoringPendingImage) {
        throw new Error('Image is still being restored. Please try again in a moment.');
      }

      if (!isAuthenticated) {
        setSaveNotice('Login to save this source as a knowledge card.');
        return;
      }

      let imageObjectKey: string | null = null;
      if (pendingScrap.source_type === 'IMAGE' && pendingImageFile) {
        setSavingLabel('Uploading image...');
        const uploadResult = await s3Api.uploadImage(pendingImageFile);
        imageObjectKey = uploadResult.objectKey;
      }

      const request = toCreateScrapRequest(pendingScrap, imageObjectKey);
      setSavingLabel('Saving scrap...');
      const response = await scrapsApi.create(request);
      const saved = {
        ...toSavedInsight(pendingScrap),
        id: response.scrapId,
        created_at: response.createdAt,
      };
      const nextCards = response.duplicated ? cards : [saved, ...cards];
      setCards(nextCards);
      setPendingScrap(null);
      setPendingImageFile(null);
      await savePendingScrap(null);
      await saveInsights(nextCards);
      await deletePendingImageFile(pendingScrap.image_blob_id);
      if (response.duplicated) {
        setSaveNotice(DUPLICATE_SCRAP_NOTICE);
      }

      setSavingLabel(response.jobId ? 'Creating card...' : 'Loading card...');
      setIsLoadingRelated(true);
      const createdCard = await resolveCreatedCard(response);

      setCreatedCard(createdCard.card ? toKnowledgeCardView(createdCard.card) : null);
      setSavingLabel('Finding related cards...');
      const similarCards = await cardsApi.getSimilarByCardId(createdCard.cardId);
      setRelatedCards(similarCards.similarCards.slice(0, 3));
      setHasRelatedResult(true);
      void refreshRecentCards();
    } catch (error) {
      setSaveError(getApiErrorMessage(error, 'Failed to save scrap.'));
      setRelatedError(getApiErrorMessage(error, 'Failed to load related cards.'));
    } finally {
      setIsSaving(false);
      setIsLoadingRelated(false);
    }
  }, [
    cards,
    deletePendingImageFile,
    isAuthenticated,
    isRestoringPendingImage,
    pendingImageFile,
    pendingScrap,
    refreshRecentCards,
    setCards,
    setCreatedCard,
    setHasRelatedResult,
    setIsLoadingRelated,
    setPendingImageFile,
    setPendingScrap,
    setRelatedCards,
    setRelatedError,
  ]);

  return {
    isSaving,
    savingLabel,
    saveError,
    saveNotice,
    handleSave,
    clearSaveFeedback,
    setSaveError,
    setSaveNotice,
  };
}
