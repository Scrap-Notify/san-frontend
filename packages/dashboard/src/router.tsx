// packages/dashboard/src/router.tsx
import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';

export const router = createBrowserRouter([
  {
    // GNB 없는 페이지
    path: '/login',
    element: <LoginPage />,
  },
  {
    // GNB 있는 페이지 — MainLayout이 Outlet으로 하위 페이지 렌더링
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      // 추후 페이지 추가 시 여기에 추가
      // { path: '/til', element: <TILPage /> },
      // { path: '/graph', element: <GraphPage /> },
    ],
  },
]);
