export interface ProjectItem {
  id: string;
  slug: string;
  title: string;
  category: 'btp' | 'immobilier' | 'commerce' | 'import-export';
  categoryLabel: string;
  location: string;
  year: string;
  summary: string;
  scope: string[];
  image: string;
  isDemoPresentation: boolean; // Flag to render the required badge "Exemple de présentation"
}

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'proj-01',
    slug: 'complexe-tertiaire-corniche-conakry',
    title: 'Complexe Tertiaire R+7 — Corniche Sud',
    category: 'btp',
    categoryLabel: 'BTP & Travaux Publics',
    location: 'Conakry (Kaloum)',
    year: 'Projet de référence',
    summary:
      'Supervision du gros œuvre et élévation d’une tour de bureaux avec façade bioclimatique et fondations sur pieux en bordure maritime.',
    scope: [
      'Coulage de 3 200 m³ de béton armé C30/37',
      'Pose de murs rideaux en double vitrage isolant',
      'Réseaux fluides et double colonne montante électrique',
    ],
    image: '/src/assets/images/hero_conakry_architecture_1794150312428.jpg',
    isDemoPresentation: true,
  },
  {
    id: 'proj-02',
    slug: 'residence-residentielle-kipe-centre',
    title: 'Résidence Moderne 16 Logements — Kipé',
    category: 'immobilier',
    categoryLabel: 'Immobilier & Aménagement',
    location: 'Conakry (Ratoma)',
    year: 'Projet de référence',
    summary:
      'Aménagement et réalisation d’un ensemble résidentiel privé clos comprenant 16 appartements standing avec piscine et espace vert aménagé.',
    scope: [
      'Aménagement paysager et voirie intérieure pavée',
      'Système solaire hybride pour l’éclairage des parties communes',
      'Commercialisation et remise des clés aux acquéreurs',
    ],
    image: '/src/assets/images/real_estate_residence_1794150314705.jpg',
    isDemoPresentation: true,
  },
  {
    id: 'proj-03',
    slug: 'plateforme-logistique-transit-matoto',
    title: 'Entrepôt Logistique Haute Cadence 4 500 m²',
    category: 'commerce',
    categoryLabel: 'Commerce Général',
    location: 'Zone Industrielle de Matoto',
    year: 'Projet de référence',
    summary:
      'Conception et fourniture d’équipements de stockage pour une plateforme logistique centrale dédiée à la distribution de matériaux de construction.',
    scope: [
      'Dallage industriel traité anti-poussière',
      'Installation de rayonnages pour charges lourdes',
      'Système de gestion informatisée des stocks',
    ],
    image: '/src/assets/images/general_commerce_distribution_1794150315331.jpg',
    isDemoPresentation: true,
  },
  {
    id: 'proj-04',
    slug: 'corridor-transit-maritime-conteneurs',
    title: 'Opération Multimodale de Fret Port-Hinterland',
    category: 'import-export',
    categoryLabel: 'Import-Export & Logistique',
    location: 'Port Autonome de Conakry',
    year: 'Projet de référence',
    summary:
      'Coordination du débarquement portuaire et acheminement routier sécurisé d’un convoi exceptionnel d’engins et de structures métalliques.',
    scope: [
      'Dédouanement prioritaire sous escorte agréée',
      'Gestion des autorisations spéciales de voirie',
      'Livraison sans incident sur le site d’exploitation',
    ],
    image: '/src/assets/images/import_export_port_containers_1794150316174.jpg',
    isDemoPresentation: true,
  },
  {
    id: 'proj-05',
    slug: 'amenagement-voirie-urbaine-drainage',
    title: 'Ouvrage d’Assainissement & Caniveaux Bétonnés',
    category: 'btp',
    categoryLabel: 'BTP & Travaux Publics',
    location: 'Conakry (Dixinn)',
    year: 'Projet de référence',
    summary:
      'Curage, recalibrage et bétonnage d’un collecteur pluvial pour éliminer les inondations récurrentes sur une artère urbaine stratégique.',
    scope: [
      'Terrassement de 850 mètres linéaires',
      'Pose de dalots préfabriqués en béton armé',
      'Rétablissement des bordures et trottoirs piétons',
    ],
    image: '/src/assets/images/btp_construction_site_1794150314495.jpg',
    isDemoPresentation: true,
  },
];
