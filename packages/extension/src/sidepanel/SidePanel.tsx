import { useCallback, useEffect, useState } from 'react';
import type { KnowledgeCardResponse, KnowledgeCardView } from '@san/shared';
import { authTokenStorage, cardsApi } from '../api/client';
import type { ExtensionMessage, PendingScrap, SavedInsight } from '../types';
import { ArchiveList } from './components/ArchiveList';
import { DropZone } from './components/DropZone';
import { EmptyState } from './components/EmptyState';
import GlowBackground from './components/GlowBackground';
import KnowledgeProgressCard from './components/KnowledgeProgressCard';
import { KnowledgeSearchBar } from './components/KnowledgeSearchBar';
import { RecentKnowledgeList } from './components/RecentKnowledgeList';
import SidePanelHeader from './components/SidePanelHeader';
import {
  loadPendingScrap,
  loadSavedInsights,
  savePendingScrap,
  useSaveScrap,
} from './hooks/useSaveScrap';

const DEBUG_PREFIX = '[SAN:sidepanel]';
const ACCESS_TOKEN_KEY = 'san_access_token';
const IMAGE_DB_NAME = 'san-extension-images';
const IMAGE_STORE_NAME = 'pending-images';
const isDebug = import.meta.env.DEV;
const defaultDashboardBaseUrl = import.meta.env.PROD
  ? 'https://k14a309.p.ssafy.io'
  : 'http://localhost:5173';
const dashboardBaseUrl = import.meta.env.VITE_DASHBOARD_BASE_URL ?? defaultDashboardBaseUrl;

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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function toKnowledgeCardResponse(card: KnowledgeCardView): KnowledgeCardResponse {
  return {
    cardId: card.card_id,
    title: card.title,
    summary: card.summary,
    category: card.category_name
      ? {
        categoryId: card.category_id ?? card.category_name,
        categoryName: card.category_name,
      }
      : null,
    tags: card.tags.map((tag) => ({
      tagId: tag.tag_id,
      tagName: tag.name,
    })),
    createdAt: card.createdAt ?? card.created_at,
  };
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
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [cards, setCards] = useState<SavedInsight[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [relatedCards, setRelatedCards] = useState<KnowledgeCardResponse[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [relatedError, setRelatedError] = useState<string | null>(null);
  const [hasRelatedResult, setHasRelatedResult] = useState(false);
  const [isRestoringPendingImage, setIsRestoringPendingImage] = useState(false);
  const [createdCard, setCreatedCard] = useState<KnowledgeCardView | null>(null);
  const [recentCards, setRecentCards] = useState<KnowledgeCardView[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [knowledgeSearchQuery, setKnowledgeSearchQuery] = useState('');
  const [knowledgeSearchCards, setKnowledgeSearchCards] = useState<KnowledgeCardResponse[]>([]);
  const [isSearchingKnowledge, setIsSearchingKnowledge] = useState(false);
  const [knowledgeSearchError, setKnowledgeSearchError] = useState<string | null>(null);
  const [hasKnowledgeSearchResult, setHasKnowledgeSearchResult] = useState(false);

  const refreshRecentCards = useCallback(async () => {
    setIsLoadingRecent(true);
    setRecentError(null);
    try {
      const response = await cardsApi.getAll({ page: 0, limit: 3 });
      setRecentCards(response.cards);
    } catch (error) {
      console.error(DEBUG_PREFIX, 'failed to load recent cards', error);
      setRecentError('Recent cards could not be loaded.');
    } finally {
      setIsLoadingRecent(false);
    }
  }, []);

  const {
    isSaving,
    savingLabel,
    saveError,
    saveNotice,
    handleSave,
    clearSaveFeedback,
    setSaveError,
  } = useSaveScrap({
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
  });

  const clearResultState = useCallback(() => {
    clearSaveFeedback();
    setRelatedError(null);
    setRelatedCards([]);
    setHasRelatedResult(false);
    setCreatedCard(null);
    setIsLoadingRelated(false);
  }, [clearSaveFeedback]);

  useEffect(() => {
    debugLog('side panel mounted');

    Promise.all([loadSavedInsights(), loadPendingScrap()])
      .then(([savedCards, storedPendingScrap]) => {
        debugLog('saved insights loaded', { count: savedCards.length });
        setCards(savedCards);
        if (!storedPendingScrap) return;

        debugLog('pending scrap restored', storedPendingScrap);
        setPendingScrap(storedPendingScrap);

        if (storedPendingScrap.source_type !== 'IMAGE' || !storedPendingScrap.image_blob_id) {
          return;
        }

        setIsRestoringPendingImage(true);
        loadPendingImageFile(
          storedPendingScrap.image_blob_id,
          storedPendingScrap.image_file_name ?? storedPendingScrap.title,
          storedPendingScrap.image_mime_type ?? undefined
        )
          .then((file) => {
            if (file) {
              setPendingImageFile(file);
              return;
            }
            setSaveError('Pending image could not be restored. Please drop the image again.');
          })
          .catch((error) => {
            console.error(DEBUG_PREFIX, 'failed to restore pending image file', error);
            setSaveError('Pending image could not be restored. Please drop the image again.');
          })
          .finally(() => {
            setIsRestoringPendingImage(false);
          });
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
  }, [setSaveError]);

  useEffect(() => {
    let ignore = false;

    const refreshAuthState = async () => {
      const token = await authTokenStorage.getToken();
      if (ignore) {
        return;
      }

      const hasToken = Boolean(token);
      setIsAuthenticated(hasToken);
      if (hasToken) {
        void refreshRecentCards();
      } else {
        setRecentCards([]);
        setCreatedCard(null);
        setRelatedCards([]);
      }
    };

    void refreshAuthState();

    const handleStorageChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName === 'local' && changes[ACCESS_TOKEN_KEY]) {
        void refreshAuthState();
      }
    };

    const handleAuthMessage = (msg: ExtensionMessage) => {
      if (msg.type === 'SAN_AUTH_STATE_CHANGED') {
        void refreshAuthState();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    chrome.runtime.onMessage.addListener(handleAuthMessage);
    return () => {
      ignore = true;
      chrome.storage.onChanged.removeListener(handleStorageChange);
      chrome.runtime.onMessage.removeListener(handleAuthMessage);
    };
  }, [refreshRecentCards]);

  const handleTextDrop = useCallback(async (text: string) => {
    const metadata = await requestActiveTabMetadata();
    await deletePendingImageFile(pendingScrap?.image_blob_id);
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
      image_blob_id: null,
    };

    clearResultState();
    debugLog('drop zone text received', {
      length: text.length,
      source_url: nextPending.source_url,
      title: nextPending.title,
    });
    setPendingScrap(nextPending);
    setPendingImageFile(null);
    await savePendingScrap(nextPending);
  }, [clearResultState, pendingScrap?.image_blob_id]);

  const handleImageDrop = useCallback(async (file: File) => {
    const metadata = await requestActiveTabMetadata();
    const previewUrl = await fileToDataUrl(file);
    const imageBlobId = await savePendingImageFile(file);
    await deletePendingImageFile(pendingScrap?.image_blob_id);
    const nextPending: PendingScrap = {
      ...(metadata ?? {
        source_type: 'IMAGE',
        source_url: null,
        raw_content: null,
        image_url: null,
        title: file.name || 'Dropped image',
        domain: '',
        favicon: null,
      }),
      source_type: 'IMAGE',
      raw_content: file.name || 'Dropped image',
      image_url: null,
      image_preview_url: previewUrl,
      image_file_name: file.name,
      image_mime_type: file.type,
      image_blob_id: imageBlobId,
      title: file.name || metadata?.title || 'Dropped image',
    };

    clearResultState();
    setPendingScrap(nextPending);
    setPendingImageFile(file);
    await savePendingScrap(nextPending);
  }, [clearResultState, pendingScrap?.image_blob_id]);

  const handleClearPending = useCallback(() => {
    void deletePendingImageFile(pendingScrap?.image_blob_id);
    setPendingScrap(null);
    setPendingImageFile(null);
    clearResultState();
    void savePendingScrap(null);
  }, [clearResultState, pendingScrap?.image_blob_id]);

  const openDashboardLogin = useCallback(() => {
    chrome.tabs.create({ url: `${dashboardBaseUrl}/login` });
  }, []);

  const openDashboard = useCallback(() => {
    chrome.tabs.create({ url: isAuthenticated ? dashboardBaseUrl : `${dashboardBaseUrl}/login` });
  }, [isAuthenticated]);

  const hasKnowledgeResult = isLoadingRelated || Boolean(createdCard) || relatedCards.length > 0 || Boolean(relatedError);
  const displayedCards = hasKnowledgeSearchResult ? knowledgeSearchCards : relatedCards;
  const isLoadingDisplayedCards = hasKnowledgeSearchResult ? isSearchingKnowledge : isLoadingRelated;
  const displayedCardsError = hasKnowledgeSearchResult ? knowledgeSearchError : relatedError;

  const handleKnowledgeSearch = useCallback(async () => {
    const search = knowledgeSearchQuery.trim();

    if (!search) {
      setHasKnowledgeSearchResult(false);
      setKnowledgeSearchCards([]);
      setKnowledgeSearchError(null);
      return;
    }

    if (!isAuthenticated) {
      setHasKnowledgeSearchResult(true);
      setKnowledgeSearchCards([]);
      setKnowledgeSearchError('Login is required to search your knowledge archive.');
      return;
    }

    setHasKnowledgeSearchResult(true);
    setIsSearchingKnowledge(true);
    setKnowledgeSearchError(null);

    try {
      const response = await cardsApi.getAll({ page: 0, limit: 10, search });
      setKnowledgeSearchCards(response.cards.map(toKnowledgeCardResponse));
    } catch (error) {
      console.error(DEBUG_PREFIX, 'failed to search knowledge cards', error);
      setKnowledgeSearchCards([]);
      setKnowledgeSearchError('Knowledge archive search failed.');
    } finally {
      setIsSearchingKnowledge(false);
    }
  }, [isAuthenticated, knowledgeSearchQuery]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#101417] text-white">
      <div className="custom-scrollbar relative flex-1 overflow-y-auto">
        <SidePanelHeader isAuthenticated={isAuthenticated} onOpenDashboard={openDashboard} />
        <GlowBackground />
        <div className="relative z-10 px-4 py-6 space-y-6">
          {isLoadingRelated ? (
            <KnowledgeProgressCard
              cards={relatedCards}
              isLoading={isLoadingRelated}
              error={relatedError}
              hasScrapContext
              createdCard={createdCard}
            />
          ) : (
            <DropZone
              pendingScrap={pendingScrap}
              onTextDrop={handleTextDrop}
              onImageDrop={handleImageDrop}
              onSave={handleSave}
              onClear={() => {
                setPendingScrap(null);
                setPendingImageFile(null);
                clearSaveFeedback();
                setRelatedError(null);
                setRelatedCards([]);
                setIsLoadingRelated(false);
                void savePendingScrap(null);
              }}
              isSaving={isSaving}
              savingLabel={savingLabel}
              saveLabel={isAuthenticated ? 'Save' : 'Save locally'}
              saveError={saveError}
              saveNotice={saveNotice}
              canSave={isAuthenticated}
              authNotice={!isAuthenticated && pendingScrap ? 'Login to save this source and turn it into a knowledge card.' : null}
              onLogin={!isAuthenticated ? openDashboardLogin : undefined}
            />
          )}
          {isAuthenticated ? (
            <KnowledgeSearchBar
              value={knowledgeSearchQuery}
              disabled={isSearchingKnowledge}
              onChange={(value) => {
                setKnowledgeSearchQuery(value);
                if (!value.trim()) {
                  setHasKnowledgeSearchResult(false);
                  setKnowledgeSearchCards([]);
                  setKnowledgeSearchError(null);
                }
              }}
              onSubmit={handleKnowledgeSearch}
            />
          ) : null}
          {!isAuthenticated ? (
            pendingScrap ? null : <EmptyState onLogin={openDashboardLogin} />
          ) : !isLoadingRelated && (hasKnowledgeResult || hasKnowledgeSearchResult) ? (
            <>
              <KnowledgeProgressCard
                cards={displayedCards}
                isLoading={isLoadingDisplayedCards}
                error={displayedCardsError}
                hasScrapContext={hasKnowledgeResult || hasKnowledgeSearchResult}
                createdCard={hasKnowledgeSearchResult ? null : createdCard}
              />
            </>
          ) : pendingScrap ? (
            null
          ) : (
            null
          )}
          {isAuthenticated && !hasKnowledgeResult && !hasKnowledgeSearchResult ? (
            <RecentKnowledgeList
              cards={recentCards}
              isLoading={isLoadingRecent}
              error={recentError}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
