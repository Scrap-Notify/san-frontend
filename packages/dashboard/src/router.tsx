import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './auth/LoginPage';
import { HomePage } from './main/HomePage';
import { Signup } from './auth/SignUpPage';
import { ResultPage } from './github/ResultPage';
import { GithubAuthResultPage } from './auth/GithubAuthResultPage';
import { SettingsIntegrationsPage } from './main/SettingsIntegrationsPage';
import { TilPage } from './til/TilPage';
import { GithubRepositorySelectPage } from './main/GithubRepositorySelectPage';
import { ProfilePage } from './main/ProfilePage';
import { NotFoundPage } from './main/NotFoundPage';
import { AuthGate } from './auth/AuthGate';

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
        element: (
          <AuthGate>
            <ResultPage />
          </AuthGate>
        ),
      },
      {
        path: '/til',
        element: (
          <AuthGate>
            <TilPage />
          </AuthGate>
        ),
      },
      {
        path: '/profile',
        element: (
          <AuthGate>
            <ProfilePage />
          </AuthGate>
        ),
      },
      {
        path: '/settings',
        element: (
          <AuthGate>
            <SettingsIntegrationsPage />
          </AuthGate>
        ),
      },
      {
        path: '/settings/integrations',
        element: (
          <AuthGate>
            <SettingsIntegrationsPage />
          </AuthGate>
        ),
      },
      {
        path: '/settings/repositories',
        element: (
          <AuthGate>
            <GithubRepositorySelectPage />
          </AuthGate>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
