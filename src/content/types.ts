// Types du contenu du site. Ils reprennent le futur schéma Supabase
// (company_profile, company_contacts, activity_domains, activity_services,
// land_projects…) pour que le passage à la base (étape C) ne change pas les pages.

/** Disponibilité d'une activité ou d'une prestation (enum availability_status). */
export type AvailabilityStatus = 'operationnelle' | 'en_developpement' | 'non_confirmee';

/** État d'avancement d'un projet foncier (enum land_dev_status). */
export type LandDevelopmentStatus =
  | 'identification'
  | 'etudes'
  | 'amenagement_en_cours'
  | 'morcellement_en_cours'
  | 'viabilisation_en_cours'
  | 'suspendu';

/** Statut de commercialisation d'un projet foncier (enum land_commercial_status). */
export type LandCommercialStatus =
  | 'non_commercialise'
  | 'pre_commercialisation'
  | 'commercialisation_ouverte'
  | 'suspendu'
  | 'cloture';

export type ContactKind = 'phone' | 'whatsapp' | 'email' | 'address';

export interface CompanyContact {
  kind: ContactKind;
  label: string;
  /** Valeur affichée. */
  value: string;
  /** Valeur technique (numéro international sans espaces, adresse e-mail…). */
  raw: string;
}

export interface CompanyProfile {
  brandName: string;
  /** Dénomination développée : réservée aux mentions légales et documents officiels. */
  fullName: string;
  country: string;
  headOffice: string;
  ambition: string;
  presentation: string[];
  mission: string;
  vision: string;
  values: string[];
  signatures: {
    brand: string;
    institutional: string;
    sectoral: string;
  };
  /** Champs juridiques non communiqués : laissés vides plutôt qu'inventés. */
  legal: {
    legalForm: string | null;
    rccm: string | null;
    nif: string | null;
    publicationManager: string | null;
    host: string | null;
  };
}

export interface ActivityService {
  title: string;
  availability: AvailabilityStatus;
}

export interface ActivityDomain {
  slug: 'btp' | 'immobilier-amenagement' | 'commerce-general' | 'import-export';
  letter: string;
  title: string;
  shortTitle: string;
  summary: string;
  availability: AvailabilityStatus;
  services: ActivityService[];
}

export interface LandProject {
  slug: string;
  name: string;
  /** Rattachement administratif, si communiqué. */
  prefecture: string | null;
  /** Superficie communiquée par l'entreprise (non mesurée par un géomètre). */
  areaHa: number;
  summary: string;
  description: string;
  objectives: string[];
  /** null = non communiqué : rien n'est affiché. */
  developmentStatus: LandDevelopmentStatus | null;
  commercialStatus: LandCommercialStatus | null;
}
