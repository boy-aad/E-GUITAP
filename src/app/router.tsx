import { createBrowserRouter } from 'react-router';
import { Layout } from '../components/layout/Layout';
import { HomePage } from '../pages/HomePage';
import { CompanyPage } from '../pages/CompanyPage';
import { ActivitiesPage } from '../pages/ActivitiesPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { ProjectDetailPage } from '../pages/ProjectDetailPage';
import { ContactPage } from '../pages/ContactPage';
import { LegalNoticePage } from '../pages/LegalNoticePage';
import { PrivacyPage } from '../pages/PrivacyPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// L'hébergeur devra renvoyer index.html pour toutes les routes (réécriture SPA).
export const router = createBrowserRouter([
  {
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
]);
