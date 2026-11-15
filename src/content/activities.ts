import type { ActivityDomain, ActivityService } from './types';

// Source : domaines d'activité communiqués par E-GUITAP (charte v1.3, p. 6).
// Disponibilité : « opérationnelle » par défaut en attendant l'administration (étape E),
// où chaque prestation pourra passer « en développement » ou « non confirmée ».

const operational = (titles: string[]): ActivityService[] =>
  titles.map((title) => ({ title, availability: 'operationnelle' }));

export const ACTIVITY_DOMAINS: ActivityDomain[] = [
  {
    slug: 'btp',
    letter: 'A',
    title: 'BTP — Bâtiment et travaux publics',
    shortTitle: 'BTP',
    summary: 'Terrassement, ouverture de routes, viabilisation de terrains et travaux de construction.',
    availability: 'operationnelle',
    services: operational([
      'Travaux de terrassement et de remblayage',
      'Ouverture et aménagement de routes',
      'Préparation et viabilisation de terrains',
      'Travaux de construction',
      'Fourniture de latérite et matériaux de construction',
      "Location et mobilisation d'engins de chantier",
      "Travaux d'aménagement et de développement de sites",
    ]),
  },
  {
    slug: 'immobilier-amenagement',
    letter: 'B',
    title: 'Immobilier et aménagement foncier',
    shortTitle: 'Immobilier et foncier',
    summary: 'Achat et vente de terrains, lotissement, commercialisation de parcelles et développement de projets.',
    availability: 'operationnelle',
    services: operational([
      'Achat et vente de terrains',
      'Lotissement et aménagement foncier',
      'Commercialisation de parcelles',
      'Recherche et acquisition de domaines fonciers',
      'Développement de projets immobiliers',
      'Aménagement de zones résidentielles, industrielles et agricoles',
      'Accompagnement des investisseurs et partenaires fonciers',
    ]),
  },
  {
    slug: 'commerce-general',
    letter: 'C',
    title: 'Commerce général',
    shortTitle: 'Commerce général',
    summary: 'Commercialisation de produits, fourniture de matériels et approvisionnement.',
    availability: 'operationnelle',
    services: operational([
      'Commercialisation de produits et marchandises diverses',
      'Fourniture de matériels et équipements',
      'Approvisionnement des entreprises et particuliers',
    ]),
  },
  {
    slug: 'import-export',
    letter: 'D',
    title: 'Import-export',
    shortTitle: 'Import-export',
    summary: 'Importation, exportation, recherche de fournisseurs et négoce commercial.',
    availability: 'operationnelle',
    services: operational([
      'Importation et exportation de marchandises',
      'Recherche de fournisseurs et partenaires internationaux',
      'Négoce commercial',
      'Approvisionnement en équipements, matériaux et produits divers',
    ]),
  },
];

/** Prestations visibles publiquement : les « non confirmées » sont masquées. */
export const publicServices = (domain: ActivityDomain) =>
  domain.services.filter((s) => s.availability !== 'non_confirmee');

export const publicDomains = () =>
  ACTIVITY_DOMAINS.filter((d) => d.availability !== 'non_confirmee');
