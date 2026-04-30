// packages/extension/src/sidepanel/SidePanel.tsx
import { useCallback, useEffect, useState } from 'react';
import { DropZone } from './components/DropZone';
import { CardList } from './components/CardList';
import type { ExtensionMessage, PendingScrap, SavedInsight } from '../types';

const DEBUG_PREFIX = '[SAN:sidepanel]';
const STORAGE_KEY = 'san:saved-insights';
const PENDING_STORAGE_KEY = 'san:pending-scrap';
const isDebug = import.meta.env.DEV;

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

    const saved = toSavedInsight(pendingScrap);
    const nextCards = [saved, ...cards];
    setCards(nextCards);
    setPendingScrap(null);

    try {
      await savePendingScrap(null);
      await saveInsights(nextCards);
      debugLog('insight saved', saved);
    } catch (error) {
      console.error(DEBUG_PREFIX, 'failed to persist insight', error);
    }
  }, [cards, pendingScrap]);

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
              void savePendingScrap(null);
            }}
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
