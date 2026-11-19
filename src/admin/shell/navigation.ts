import {
  BookOpenText,
  Briefcase,
  Building2,
  FileText,
  FolderTree,
  History,
  Home,
  Image,
  Inbox,
  LandPlot,
  LayoutDashboard,
  Phone,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
  /** Module prévu dans une phase suivante (affiché, désactivé). */
  soon?: boolean;
  /** Compteur affiché à droite (clé des compteurs chargés par la coque). */
  badge?: 'newInquiries' | 'newQuotes';
};

export type NavGroup = { label: string; items: NavItem[]; adminOnly?: boolean };

/** Menu de l'administration, regroupé par usage (PRD § 6.1). */
export const NAV_GROUPS: NavGroup[] = [
  { label: 'Pilotage', items: [{ to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true }] },
  {
    label: 'Relation client',
    items: [
      { to: '/admin/demandes', label: 'Demandes', icon: Inbox, badge: 'newInquiries' },
      { to: '/admin/demandes?type=demande_devis', label: 'Devis', icon: FileText, badge: 'newQuotes' },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { to: '/admin/offres', label: 'Offres', icon: Briefcase },
      { to: '/admin/categories', label: 'Catégories', icon: FolderTree },
    ],
  },
  {
    label: 'Contenus',
    items: [
      { to: '/admin/accueil', label: "Page d'accueil", icon: Home },
      { to: '/admin/entreprise', label: 'Entreprise', icon: Building2 },
      { to: '/admin/coordonnees', label: 'Coordonnées et réseaux', icon: Phone },
      { to: '/admin/textes', label: 'Textes des pages', icon: BookOpenText },
      { to: '/admin/projets', label: 'Projets fonciers', icon: LandPlot },
      { to: '/admin/medias', label: 'Médiathèque', icon: Image },
    ],
  },
  {
    label: 'Administration',
    adminOnly: true,
    items: [
      { to: '/admin/equipe', label: 'Équipe', icon: Users },
      { to: '/admin/journal', label: "Journal d'activité", icon: History, soon: true },
    ],
  },
];

/** Libellés du fil d'Ariane pour les rubriques (premier segment après /admin). */
export const SECTION_LABELS: Record<string, string> = {
  demandes: 'Demandes',
  offres: 'Offres',
  categories: 'Catégories',
  projets: 'Projets fonciers',
  medias: 'Médiathèque',
  accueil: "Page d'accueil",
  entreprise: 'Entreprise',
  coordonnees: 'Coordonnées et réseaux',
  textes: 'Textes des pages',
  equipe: 'Équipe',
  outils: 'Outils',
};
