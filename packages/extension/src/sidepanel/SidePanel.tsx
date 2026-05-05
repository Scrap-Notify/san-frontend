// packages/extension/src/sidepanel/SidePanel.tsx
import { useCallback, useEffect, useState } from 'react';
import { DropZone } from './components/DropZone';
import { CardList } from './components/CardList';
import { RelatedCards } from './components/RelatedCards';
import {
  getApiErrorMessage,
  type CreateScrapRequest,
  type KnowledgeCardResponse,
} from '@san/shared';
import { asyncJobsApi, authTokenStorage, cardsApi, scrapsApi } from '../api/client';
import type { ExtensionMessage, PendingScrap, SavedInsight } from '../types';

const DEBUG_PREFIX = '[SAN:sidepanel]';
const STORAGE_KEY = 'san:saved-insights';
const PENDING_STORAGE_KEY = 'san:pending-scrap';
const ACCESS_TOKEN_KEY = 'san_access_token';
const isDebug = import.meta.env.DEV;
const dashboardBaseUrl = import.meta.env.VITE_DASHBOARD_BASE_URL ?? 'http://localhost:5174';
const JOB_POLL_INTERVAL_MS = 1500;
const JOB_POLL_MAX_ATTEMPTS = 40;

function debugLog(message: string, data?: unknown) {
  if (!isDebug) return;
  if (data === undefined) {
    console.debug(DEBUG_PREFIX, message);
    return;
  }
  console.debug(DEBUG_PREFIX, message, data);
}

function isPendingScrap(value: unknown): value is PendingScrap {
  if (!value || typeof value !== 'object') return false;
  const maybe = value as Partial<PendingScrap>;
  return typeof maybe.source_type === 'string' && typeof maybe.title === 'string';
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

function toCreateScrapRequest(scrap: PendingScrap): CreateScrapRequest {
  return {
    sourceUrl: scrap.source_url,
    rawContent: scrap.raw_content ?? scrap.source_url ?? scrap.title,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForCardAnalysis(jobId: string) {
  for (let attempt = 0; attempt < JOB_POLL_MAX_ATTEMPTS; attempt += 1) {
    const job = await asyncJobsApi.getStatus(jobId);

    if (job.status === 'COMPLETED') {
      return;
    }

    if (job.status === 'FAILED') {
      throw new Error(job.errorMessage ?? 'Knowledge card creation failed.');
    }

    await delay(JOB_POLL_INTERVAL_MS);
  }

  throw new Error('Knowledge card creation timed out.');
}

async function loadSavedInsights(): Promise<SavedInsight[]> {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const value = stored[STORAGE_KEY];
  return Array.isArray(value) ? value : [];
}

async function saveInsights(cards: SavedInsight[]) {
  await chrome.storage.local.set({ [STORAGE_KEY]: cards });
}

async function loadPendingScrap(): Promise<PendingScrap | null> {
  const stored = await chrome.storage.local.get(PENDING_STORAGE_KEY);
  const value = stored[PENDING_STORAGE_KEY];
  return isPendingScrap(value) ? value : null;
}

async function savePendingScrap(scrap: PendingScrap | null) {
  if (scrap) {
    await chrome.storage.local.set({ [PENDING_STORAGE_KEY]: scrap });
    return;
  }
  await chrome.storage.local.remove(PENDING_STORAGE_KEY);
}

async function requestActiveTabMetadata(): Promise<PendingScrap | null> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return null;

  try {
    return await chrome.tabs.sendMessage<ExtensionMessage, PendingScrap>(tab.id, { type: 'REQUEST_METADATA' });
  } catch (error) {
    debugLog('failed to read metadata from active tab, using fallback metadata', error);
    const url = tab.url ?? null;
    const domain = url ? new URL(url).hostname : '';
    return {
      source_type: 'TEXT',
      source_url: url,
      raw_content: null,
      image_url: null,
      title: tab.title ?? 'Dragged text',
      domain,
      favicon: domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32` : null,
    };
  }
}

export default function SidePanel() {
  const [pendingScrap, setPendingScrap] = useState<PendingScrap | null>(null);
  const [cards, setCards] = useState<SavedInsight[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savingLabel, setSavingLabel] = useState('Saving...');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [relatedCards, setRelatedCards] = useState<KnowledgeCardResponse[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [relatedError, setRelatedError] = useState<string | null>(null);

  useEffect(() => {
    debugLog('side panel mounted');

    Promise.all([loadSavedInsights(), loadPendingScrap()])
      .then(([savedCards, storedPendingScrap]) => {
        debugLog('saved insights loaded', { count: savedCards.length });
        setCards(savedCards);
        if (storedPendingScrap) {
          debugLog('pending scrap restored', storedPendingScrap);
          setPendingScrap(storedPendingScrap);
        }
      })
      .catch((error) => {
        console.error(DEBUG_PREFIX, 'failed to load side panel state', error);
      });

    const handleMessage = (msg: ExtensionMessage) => {
      debugLog('runtime message received', msg);
      if (msg.type === 'PUSH_TO_SIDEPANEL' && isPendingScrap(msg.payload)) {
        setPendingScrap(msg.payload);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  useEffect(() => {
    let ignore = false;

    authTokenStorage.getToken().then((token) => {
      if (!ignore) {
        setIsAuthenticated(Boolean(token));
      }
    });

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName === 'local' && changes[ACCESS_TOKEN_KEY]) {
        setIsAuthenticated(Boolean(changes[ACCESS_TOKEN_KEY].newValue));
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      ignore = true;
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const handleTextDrop = useCallback(async (text: string) => {
    const metadata = await requestActiveTabMetadata();
    const nextPending: PendingScrap = {
      ...(metadata ?? {
        source_type: 'TEXT',
        source_url: null,
        raw_content: null,
        image_url: null,
        title: 'Dragged text',
        domain: '',
        favicon: null,
      }),
      source_type: 'TEXT',
      raw_content: text,
    };

    setSaveError(null);
    setRelatedError(null);
    setRelatedCards([]);
    setIsLoadingRelated(false);
    debugLog('drop zone text received', {
      length: text.length,
      source_url: nextPending.source_url,
      title: nextPending.title,
    });
    setPendingScrap(nextPending);
    await savePendingScrap(nextPending);
  }, []);

  const handleSave = useCallback(async () => {
    if (!pendingScrap) return;

    setIsSaving(true);
    setSavingLabel(isAuthenticated ? 'Saving scrap...' : 'Saving locally...');
    setSaveError(null);
    setRelatedError(null);
    setRelatedCards([]);
    setIsLoadingRelated(false);

    try {
      if (!isAuthenticated) {
        const saved = toSavedInsight(pendingScrap);
        const nextCards = [saved, ...cards];
        setCards(nextCards);
        setPendingScrap(null);
        await savePendingScrap(null);
        await saveInsights(nextCards);
        debugLog('insight saved locally', saved);
        return;
      }

      const response = await scrapsApi.create(toCreateScrapRequest(pendingScrap));
      const saved = {
        ...toSavedInsight(pendingScrap),
        id: response.scrapId,
        created_at: response.createdAt,
      };
      const nextCards = [saved, ...cards];
      setCards(nextCards);
      setPendingScrap(null);
      await savePendingScrap(null);
      await saveInsights(nextCards);
      debugLog('insight saved', saved);

      setSavingLabel('Creating card...');
      setIsLoadingRelated(true);
      const cardJob = await cardsApi.create({ scrapId: response.scrapId });

      setSavingLabel('Finding related cards...');
      await waitForCardAnalysis(cardJob.jobId);

      const similarCards = await cardsApi.getSimilarByJob(cardJob.jobId);
      setRelatedCards(similarCards.similarCards);
    } catch (error) {
      console.error(DEBUG_PREFIX, 'failed to persist insight', error);
      setSaveError(getApiErrorMessage(error, 'Failed to save scrap.'));
      setRelatedError(getApiErrorMessage(error, 'Failed to load related cards.'));
    } finally {
      setIsSaving(false);
      setIsLoadingRelated(false);
    }
  }, [cards, isAuthenticated, pendingScrap]);

  const openDashboardLogin = useCallback(() => {
    chrome.tabs.create({ url: `${dashboardBaseUrl}/login` });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0A0F1E] text-slate-200 font-sans overflow-hidden">
      <header className="p-5 flex items-center justify-between border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#4ADE80] rounded-full animate-pulse shadow-[0_0_10px_#4ADE80]" />
          <h1 className="text-xl font-black tracking-tighter text-white">SAN</h1>
        </div>
        <button className="text-slate-500 hover:text-[#4ADE80] transition-colors" aria-label="Settings">
          <i className="fa-solid fa-gear"></i>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        <section>
          <DropZone
            pendingScrap={pendingScrap}
            onTextDrop={handleTextDrop}
            onSave={handleSave}
            onClear={() => {
              setPendingScrap(null);
              setSaveError(null);
              setRelatedError(null);
              setRelatedCards([]);
              setIsLoadingRelated(false);
              void savePendingScrap(null);
            }}
            isSaving={isSaving}
            savingLabel={savingLabel}
            saveError={saveError}
          />
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between px-1">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
              Related Cards
            </h2>
            {isAuthenticated ? (
              <span className="text-[10px] text-[#4ADE80]">Synced</span>
            ) : (
              <span className="text-[10px] text-slate-600">Login required</span>
            )}
          </div>
          <RelatedCards
            cards={relatedCards}
            isAuthenticated={isAuthenticated}
            isLoading={isLoadingRelated}
            error={relatedError}
            hasScrapContext={Boolean(pendingScrap) || relatedCards.length > 0 || isLoadingRelated}
            onLogin={openDashboardLogin}
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">Collected Insights</h2>
            <span className="text-[10px] text-slate-600">{cards.length} items</span>
          </div>
          <CardList cards={cards} />
        </section>
      </div>
    </div>
  );
}
