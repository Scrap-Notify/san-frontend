import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { Signup } from './pages/SignUpPage';
import { ResultPage } from './pages/ResultPage';
import { GithubAuthResultPage } from './pages/GithubAuthResultPage';
import { SettingsIntegrationsPage } from './pages/SettingsIntegrationsPage';
import { TilPage } from './pages/TilPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/auth/github/callback',
    element: <GithubAuthResultPage />,
  },
  {
    path: '/auth/github/success',
    element: <GithubAuthResultPage />,
  },
  {
    path: '/auth/github/failure',
    element: <GithubAuthResultPage />,
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/result',
        element: <ResultPage />,
      },
      {
        path: '/til',
        element: <TilPage />,
      },
      {
        path: '/settings',
        element: <SettingsIntegrationsPage />,
      },
      {
        path: '/settings/integrations',
        element: <SettingsIntegrationsPage />,
      },
    ],
  },
]);
