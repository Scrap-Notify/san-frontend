import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { Signup } from './pages/SignUpPage';
import { ResultPage } from './pages/ResultPage';
import { GithubAuthResultPage } from './pages/GithubAuthResultPage';

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
        path: '/date-range',
        element: (
          <PlaceholderPage
            eyebrow="Filters"
            title="Date range"
            description="Date range selection will be connected here."
          />
        ),
      },
      {
        path: '/result',
        element: <ResultPage />,
      },
      {
        path: '/til',
        element: (
          <PlaceholderPage
            eyebrow="Create"
            title="Add TIL"
            description="The TIL creation flow will be connected here."
          />
        ),
      },
      {
        path: '/settings',
        element: (
          <PlaceholderPage
            eyebrow="Workspace"
            title="Settings"
            description="Dashboard preferences and integrations will be managed here."
          />
        ),
      },
      {
        path: '/account',
        element: (
          <PlaceholderPage
            eyebrow="Profile"
            title="Account"
            description="Account details and sign-in state will be shown here."
          />
        ),
      },
      {
        path: '/archive/previous',
        element: (
          <PlaceholderPage
            eyebrow="Archive"
            title="Previous archive page"
            description="Archive pagination will load the previous page here."
          />
        ),
      },
      {
        path: '/archive/next',
        element: (
          <PlaceholderPage
            eyebrow="Archive"
            title="Next archive page"
            description="Archive pagination will load the next page here."
          />
        ),
      },
    ],
  },
]);
