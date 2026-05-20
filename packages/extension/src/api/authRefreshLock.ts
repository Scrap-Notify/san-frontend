const REFRESH_LOCK_NAME = 'san-auth-refresh';
const REFRESH_LOCK_KEY = 'san_auth_refresh_lock';
const REFRESH_LOCK_TTL_MS = 12_000;
const REFRESH_LOCK_WAIT_MS = 10_000;

type StoredRefreshLock = {
  owner: string;
  expiresAt: number;
};

function getWebLocks() {
  return (globalThis.navigator as Navigator & {
    locks?: {
      request: <T>(name: string, callback: () => Promise<T>) => Promise<T>;
    };
  } | undefined)?.locks;
}

function createOwnerId() {
  return `${Date.now()}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(16).slice(2)}`;
}

function sleep(ms: number) {
  return new Promise((resolve) => globalThis.setTimeout(resolve, ms));
}

function parseStoredLock(value: unknown): StoredRefreshLock | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const maybe = value as Partial<StoredRefreshLock>;
  return typeof maybe.owner === 'string' && typeof maybe.expiresAt === 'number'
    ? { owner: maybe.owner, expiresAt: maybe.expiresAt }
    : null;
}

async function withChromeStorageLock<T>(task: () => Promise<T>): Promise<T> {
  const owner = createOwnerId();
  const deadline = Date.now() + REFRESH_LOCK_WAIT_MS;

  while (Date.now() < deadline) {
    const stored = await chrome.storage.local.get(REFRESH_LOCK_KEY);
    const lock = parseStoredLock(stored[REFRESH_LOCK_KEY]);

    if (!lock || lock.expiresAt <= Date.now()) {
      await chrome.storage.local.set({
        [REFRESH_LOCK_KEY]: { owner, expiresAt: Date.now() + REFRESH_LOCK_TTL_MS },
      });
      await sleep(20);

      const confirmed = await chrome.storage.local.get(REFRESH_LOCK_KEY);
      if (parseStoredLock(confirmed[REFRESH_LOCK_KEY])?.owner === owner) {
        try {
          return await task();
        } finally {
          const latest = await chrome.storage.local.get(REFRESH_LOCK_KEY);
          if (parseStoredLock(latest[REFRESH_LOCK_KEY])?.owner === owner) {
            await chrome.storage.local.remove(REFRESH_LOCK_KEY);
          }
        }
      }
    }

    await sleep(80 + Math.floor(Math.random() * 80));
  }

  throw new Error('Timed out waiting for auth refresh lock');
}

export function runAuthRefreshLock<T>(task: () => Promise<T>) {
  const locks = getWebLocks();
  if (locks) {
    return locks.request(REFRESH_LOCK_NAME, task);
  }

  return withChromeStorageLock(task);
}
