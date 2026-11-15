import type { LandCommercialStatus, LandDevelopmentStatus, LandProject } from './types';

// Source : projets fonciers communiqués par E-GUITAP.
// Les superficies et descriptions sont celles annoncées par l'entreprise : elles ne
// valent ni garantie de propriété, ni titre foncier, ni disponibilité commerciale,
// ni viabilisation effective. Statuts laissés à null tant qu'ils ne sont pas confirmés.

export const LAND_PROJECTS: LandProject[] = [
  {
    slug: 'amaria-ouassou',
    name: 'Amaria – Ouassou',
    prefecture: null,
    areaHa: 1000,
    summary: 'Un site destiné à accueillir des zones résidentielles, des infrastructures communautaires et des activités économiques.',
    description:
      "Le site d'Amaria – Ouassou présente un potentiel pour la création de zones résidentielles modernes, d'infrastructures communautaires et d'espaces dédiés aux activités économiques.",
    objectives: [
      'Création de zones résidentielles modernes',
      'Infrastructures communautaires',
      'Espaces dédiés aux activités économiques',
    ],
    developmentStatus: null,
    commercialStatus: null,
  },
  {
    slug: 'tanene-kenende',
    name: 'Tanènè – Kenendé',
    prefecture: null,
    areaHa: 300,
    summary: 'Un site au potentiel agricole, résidentiel et commercial, pensé comme un espace structuré et accessible.',
    description:
      "Le site de Tanènè – Kenendé présente un potentiel pour l'agriculture, l'implantation de logements et des projets commerciaux, avec l'objectif de développer un espace structuré et accessible.",
    objectives: [
      'Agriculture',
      'Implantation de logements',
      'Projets commerciaux',
      "Développement d'un espace structuré et accessible",
    ],
    developmentStatus: null,
    commercialStatus: null,
  },
  {
    slug: 'bady',
    name: 'Bady',
    prefecture: null,
    areaHa: 300,
    summary: "Un site dédié à l'aménagement durable, présentant des opportunités foncières.",
    description:
      "Le site de Bady est un site en développement dédié à l'aménagement durable et présentant des opportunités foncières.",
    objectives: ['Aménagement durable', 'Opportunités foncières'],
    developmentStatus: null,
    commercialStatus: null,
  },
  {
    slug: 'site-de-forecariah',
    name: 'Site de Forécariah',
    prefecture: 'Préfecture de Forécariah',
    areaHa: 3000,
    summary: "Un projet d'aménagement en cours, pouvant accueillir des initiatives d'envergure.",
    description:
      "Le site de Forécariah fait l'objet d'un projet d'aménagement en cours. Il peut accueillir des initiatives d'envergure : nouveaux pôles urbains, zones agro-industrielles et infrastructures structurantes.",
    objectives: ['Nouveaux pôles urbains', 'Zones agro-industrielles', 'Infrastructures structurantes'],
    developmentStatus: 'amenagement_en_cours',
    commercialStatus: null,
  },
];

/** Engagement annoncé par l'entreprise pour l'ensemble des sites. */
export const LAND_COMMITMENT =
  'E-GUITAP prévoit de mener des opérations de morcellement et de viabilisation progressives sur ces sites.';

/** Avertissement affiché sur toutes les pages présentant les projets fonciers. */
export const LAND_DISCLAIMER =
  "Superficies et informations communiquées par E-GUITAP à titre indicatif. Elles ne constituent ni une offre de vente, ni une garantie de disponibilité, de titre foncier ou de viabilisation. Renseignements sur demande.";

export const DEVELOPMENT_STATUS_LABELS: Record<LandDevelopmentStatus, string> = {
  identification: 'Identification',
  etudes: 'Études en cours',
  amenagement_en_cours: 'Aménagement en cours',
  morcellement_en_cours: 'Morcellement en cours',
  viabilisation_en_cours: 'Viabilisation en cours',
  suspendu: 'Suspendu',
};

export const COMMERCIAL_STATUS_LABELS: Record<LandCommercialStatus, string> = {
  non_commercialise: 'Non commercialisé',
  pre_commercialisation: 'Pré-commercialisation',
  commercialisation_ouverte: 'Commercialisation ouverte',
  suspendu: 'Commercialisation suspendue',
  cloture: 'Commercialisation clôturée',
};

export const TOTAL_AREA_HA = LAND_PROJECTS.reduce((sum, p) => sum + p.areaHa, 0);

export const formatHectares = (ha: number) =>
  `${new Intl.NumberFormat('fr-FR').format(ha)} ha`;

export const findLandProject = (slug: string | undefined) =>
  LAND_PROJECTS.find((p) => p.slug === slug);
