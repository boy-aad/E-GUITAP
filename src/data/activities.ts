import { IMAGES } from '../assets/images';

export interface ActivityDomain {
  id: string;
  slug: 'btp' | 'immobilier' | 'commerce' | 'import-export';
  number: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  image: string;
  keyServices: string[];
  operationalScope: string[];
  advantages: string[];
  ctaText: string;
}

export const ACTIVITIES_DATA: ActivityDomain[] = [
  {
    id: 'activity-btp',
    slug: 'btp',
    number: '01',
    title: 'BTP & Travaux Publics',
    shortDescription:
      'Des activités liées au bâtiment et aux travaux publics, au service des projets de construction et d’infrastructure.',
    fullDescription:
      'E.GUITAP déploie une rigueur d’ingénierie et une gestion de chantier structurée pour concevoir et ériger des édifices institutionnels, des ouvrages de génie civil et des infrastructures fiables, adaptées aux contraintes climatiques et géographiques guinéennes.',
    image: IMAGES.btpSite,
    keyServices: [
      'Gros œuvre et maçonnerie structurée',
      'Ouvrages de génie civil et terrassement',
      'Aménagements urbains et voies d’accès',
      'Rénovation, réhabilitation lourde et second œuvre',
      'Supervision technique et pilotage de chantiers',
    ],
    operationalScope: [
      'Bâtiments administratifs et sièges sociaux',
      'Infrastructures industrielles et plateformes logistiques',
      'Résidences privées et programmes collectifs',
      'Travaux de voiries et réseaux divers (VRD)',
    ],
    advantages: [
      'Respect scrupuleux des cahiers des charges et délais',
      'Encadrement technique qualifié et sécurité rigoureuse sur site',
      'Maîtrise des matériaux et contrôle qualité continu',
    ],
    ctaText: 'Consulter nos offres BTP',
  },
  {
    id: 'activity-immobilier',
    slug: 'immobilier',
    number: '02',
    title: 'Immobilier & Aménagement',
    shortDescription:
      'Des opportunités et solutions dans les domaines de l’immobilier et de l’aménagement à Conakry et en région.',
    fullDescription:
      'Nous accompagnons les particuliers, entreprises et investisseurs institutionnels dans la recherche, la valorisation foncière, la commercialisation et la gestion d’actifs immobiliers stratégiques en République de Guinée.',
    image: IMAGES.realEstate,
    keyServices: [
      'Promotion et développement résidentiel de standing',
      'Commercialisation d’immeubles de bureaux et locaux professionnels',
      'Aménagement foncier, viabilisation et morcellement de parcelles',
      'Conseil en investissement immobilier et gestion locative',
      'Expertise de valorisation d’actifs fonciers',
    ],
    operationalScope: [
      'Résidences sécurisées et appartements modernes',
      'Bureaux d’affaires et plateaux tertiaires à Kaloum et Kipé',
      'Parcelles viabilisées avec titres fonciers sécurisés',
      'Espaces commerciaux et entrepôts de stockage',
    ],
    advantages: [
      'Transparence juridique et foncière intégrale',
      'Sélection rigoureuse des emplacements stratégiques',
      'Interlocuteur dédié de la négociation à la remise des clés',
    ],
    ctaText: 'Explorer les biens immobiliers',
  },
  {
    id: 'activity-commerce',
    slug: 'commerce',
    number: '03',
    title: 'Commerce Général',
    shortDescription:
      'Une activité commerciale diversifiée répondant aux besoins d’approvisionnement de différents secteurs clés.',
    fullDescription:
      'E.GUITAP opère comme un distributeur fiable de fournitures industrielles, de matériaux de construction de première qualité et de biens d’équipement, garantissant des flux d’approvisionnement constants pour les chantiers et entreprises guinéennes.',
    image: IMAGES.commerce,
    keyServices: [
      'Distribution de matériaux de construction (ciment, fer à béton, profilés)',
      'Fourniture de gros outillage et quincaillerie professionnelle',
      'Négoce d’équipements industriels et consommables techniques',
      'Vente en gros et demi-gros pour professionnels et détaillants',
      'Gestion de stocks tampons et logistique d’entrepôt',
    ],
    operationalScope: [
      'Approvisionnement des chantiers de construction nationaux',
      'Fourniture aux entreprises minières et industrielles',
      'Réseaux de distributeurs et quincailleries partenaires',
      'Réponses aux marchés et appels d’offres de fournitures',
    ],
    advantages: [
      'Disponibilité réelle et stocks immédiatement mobilisables',
      'Traçabilité et conformité des normes de fabrication',
      'Tarification transparente et conditions modulables pour professionnels',
    ],
    ctaText: 'Voir les produits & stocks',
  },
  {
    id: 'activity-import-export',
    slug: 'import-export',
    number: '04',
    title: 'Import-Export & Logistique',
    shortDescription:
      'Une ouverture sur les échanges commerciaux mondiaux et la fluidification des opérations internationales.',
    fullDescription:
      'Grâce à notre proximité avec les terminaux portuaires de Conakry et un réseau de correspondants internationaux, nous pilotons l’importation de marchandises stratégiques et facilitons l’exportation de productions ouest-africaines.',
    image: IMAGES.importExport,
    keyServices: [
      'Acheminement maritime, conteneurisation FCL / LCL',
      'Formalités douanières, dédouanement et conformité réglementaire',
      'Sourcing international de matières premières et équipements lourds',
      'Transit portuaire et acheminement multimodal vers l’hinterland',
      'Assistance documentaire et sécurisation des transactions financières (Crédit Doc)',
    ],
    operationalScope: [
      'Liaisons maritimes Asie - Guinée / Europe - Guinée',
      'Desserte des corridors sous-régionaux (Mali, hinterland)',
      'Produits agro-alimentaires, outillages techniques et marchandises diverses',
      'Fret spécialisé pour projets d’infrastructures',
    ],
    advantages: [
      'Maîtrise approfondie des procédures portuaires et douanières de Conakry',
      'Coordination de bout en bout pour limiter les temps de stationnement',
      'Sécurité documentaire et conformité internationale absolue',
    ],
    ctaText: 'Consulter nos opérations import-export',
  },
];
