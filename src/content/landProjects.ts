import type { LandCommercialStatus, LandDevelopmentStatus, LandProject } from './types';

// Libellés et textes fixes liés aux projets fonciers (les projets eux-mêmes viennent de Supabase).

/**
 * Avertissement affiché sur toutes les pages présentant les projets fonciers.
 * Texte juridique volontairement non modifiable depuis l'administration.
 */
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

export const totalAreaHa = (projects: LandProject[]) =>
  projects.reduce((sum, p) => sum + p.areaHa, 0);

export const formatHectares = (ha: number) => `${new Intl.NumberFormat('fr-FR').format(ha)} ha`;
