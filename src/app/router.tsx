import { createBrowserRouter } from 'react-router';
import { Layout } from '../components/layout/Layout';
import { LoadingScreen, RootErrorScreen } from '../components/layout/RootStatus';
import { loadSiteContent } from '../data/siteContent';
import { ROOT_ROUTE_ID } from '../data/useSiteContent';
import { HomePage } from '../pages/HomePage';
import { CompanyPage } from '../pages/CompanyPage';
import { ActivitiesPage } from '../pages/ActivitiesPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { ContactPage } from '../pages/ContactPage';
import { LegalNoticePage } from '../pages/LegalNoticePage';
import { PrivacyPage } from '../pages/PrivacyPage';
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
    children: [
      { index: true, element: <HomePage /> },
      { path: 'entreprise', element: <CompanyPage /> },
      { path: 'activites', element: <ActivitiesPage /> },
      { path: 'projets', element: <ProjectsPage /> },
      { path: 'projets/:slug', element: <ProjectDetailPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'mentions-legales', element: <LegalNoticePage /> },
      { path: 'confidentialite', element: <PrivacyPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // Administration : arbre séparé, sans le loader du site public.
  adminRoutes,
]);
