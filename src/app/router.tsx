import { createBrowserRouter } from 'react-router';
import { Layout } from '../components/layout/Layout';
import { LoadingScreen, RootErrorScreen } from '../components/layout/RootStatus';
import { loadSiteContent } from '../data/siteContent';
import { ROOT_ROUTE_ID } from '../data/useSiteContent';
import { HomePage } from '../pages/HomePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { adminRoutes } from '../admin/routes';

// L'hébergeur devra renvoyer index.html pour toutes les routes (réécriture SPA).
export const router = createBrowserRouter([
  {
    id: ROOT_ROUTE_ID,
    // Tout le contenu public est chargé une fois, puis partagé par les pages.
    loader: loadSiteContent,
    // Les navigations internes ne rechargent pas le contenu.
    shouldRevalidate: () => false,
    HydrateFallback: LoadingScreen,
    errorElement: <RootErrorScreen />,
    element: <Layout />,
    // L'accueil est dans le bundle initial ; les autres pages sont chargées à la demande.
    children: [
      { index: true, element: <HomePage /> },
      { path: 'entreprise', lazy: () => import('../pages/CompanyPage').then((m) => ({ Component: m.CompanyPage })) },
      { path: 'activites', lazy: () => import('../pages/ActivitiesPage').then((m) => ({ Component: m.ActivitiesPage })) },
      { path: 'offres', lazy: () => import('../pages/OffersPage').then((m) => ({ Component: m.OffersPage })) },
      { path: 'offres/:slug', lazy: () => import('../pages/OfferDetailPage').then((m) => ({ Component: m.OfferDetailPage })) },
      { path: 'projets', lazy: () => import('../pages/ProjectsPage').then((m) => ({ Component: m.ProjectsPage })) },
      { path: 'projets/:slug', lazy: () => import('../pages/ProjectDetailPage').then((m) => ({ Component: m.ProjectDetailPage })) },
      { path: 'contact', lazy: () => import('../pages/ContactPage').then((m) => ({ Component: m.ContactPage })) },
      { path: 'mentions-legales', lazy: () => import('../pages/LegalNoticePage').then((m) => ({ Component: m.LegalNoticePage })) },
      { path: 'confidentialite', lazy: () => import('../pages/PrivacyPage').then((m) => ({ Component: m.PrivacyPage })) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // Administration : arbre séparé, sans le loader du site public.
  adminRoutes,
]);
