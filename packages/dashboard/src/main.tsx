// packages/dashboard/src/main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiProvider } from '@san/shared';
import { authApi, authTokenStorage, scrapsApi, cardsApi } from './api/client';
import { syncExtensionBridgeTicket } from './api/extensionAuth';
import { router } from './router';
import './index.css';

void syncStoredExtensionAuth();

async function syncStoredExtensionAuth() {
  const accessToken = await authTokenStorage.getToken();
  if (!accessToken) {
    return;
  }

  try {
    const { ticket } = await authApi.createBridgeTicket();
    await syncExtensionBridgeTicket(ticket);
  } catch (error) {
    console.info('[SAN:extension-auth] bridge sync skipped', error);
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ApiProvider scrapsApi={scrapsApi} cardsApi={cardsApi}>
        <RouterProvider router={router} />
      </ApiProvider>
    </QueryClientProvider>
  </StrictMode>
);
