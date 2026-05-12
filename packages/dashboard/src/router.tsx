import { createBrowserRouter, redirect } from 'react-router-dom';
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
import { authTokenStorage } from './api/client';

async function requireAuth() {
  const token = await authTokenStorage.getToken();
  if (!token) {
    throw redirect('/login');
  }

  return null;
}

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
        path: '/profile',
        loader: requireAuth,
        element: <ProfilePage />,
      },
      {
        path: '/settings',
        element: <SettingsIntegrationsPage />,
      },
      {
        path: '/settings/integrations',
        element: <SettingsIntegrationsPage />,
      },
      {
        path: '/settings/repositories',
        element: <GithubRepositorySelectPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
