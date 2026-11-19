import type { RouteObject } from 'react-router';
import { LoadingScreen } from '../components/layout/RootStatus';
import { AdminError } from './AdminError';

// Routes de l'administration. Chaque page est chargée à la demande (lazy) : le code de
// l'administration n'est jamais téléchargé par les visiteurs du site public.
export const adminRoutes: RouteObject = {
  path: 'admin',
  HydrateFallback: LoadingScreen,
  errorElement: <AdminError />,
  children: [
    { path: 'connexion', lazy: () => import('./pages/LoginPage') },
    { path: 'mot-de-passe-oublie', lazy: () => import('./pages/ForgotPasswordPage') },
    { path: 'reinitialisation', lazy: () => import('./pages/ResetPasswordPage') },
    {
      lazy: () => import('./AdminLayout'),
      errorElement: <AdminError />,
      children: [
        { index: true, lazy: () => import('./pages/DashboardPage') },
        { path: 'demandes', lazy: () => import('./pages/InquiriesPage') },
        { path: 'demandes/:id', lazy: () => import('./pages/InquiryDetailPage') },
        { path: 'offres', lazy: () => import('./pages/OffersPage') },
        { path: 'offres/nouvelle', lazy: () => import('./pages/OfferEditPage') },
        { path: 'offres/:id', lazy: () => import('./pages/OfferEditPage') },
        { path: 'categories', lazy: () => import('./pages/CategoriesPage') },
        { path: 'categories/nouvelle', lazy: () => import('./pages/CategoryEditPage') },
        { path: 'categories/:id', lazy: () => import('./pages/CategoryEditPage') },
        { path: 'accueil', lazy: () => import('./pages/HeroSlidesPage') },
        { path: 'accueil/nouvelle', lazy: () => import('./pages/HeroSlideEditPage') },
        { path: 'accueil/:id', lazy: () => import('./pages/HeroSlideEditPage') },
        { path: 'entreprise', lazy: () => import('./pages/CompanyPage') },
        { path: 'coordonnees', lazy: () => import('./pages/ContactsPage') },
        { path: 'textes', lazy: () => import('./pages/TextsPage') },
        { path: 'medias', lazy: () => import('./pages/MediaPage') },
        { path: 'projets', lazy: () => import('./pages/ProjectsPage') },
        { path: 'projets/nouveau', lazy: () => import('./pages/ProjectEditPage') },
        { path: 'projets/:id', lazy: () => import('./pages/ProjectEditPage') },
        { path: 'equipe', lazy: () => import('./pages/TeamPage') },
        { path: 'journal', lazy: () => import('./pages/JournalPage') },
        { path: 'journal/:id', lazy: () => import('./pages/JournalEntryPage') },
        // Outil de contrôle : déclaré seulement en développement (absent du build de production).
        ...(import.meta.env.DEV ? [{ path: 'outils/illustrations', lazy: () => import('./pages/IllustrationsPage') }] : []),
        { path: '*', element: <AdminError notFound /> },
      ],
    },
  ],
};
