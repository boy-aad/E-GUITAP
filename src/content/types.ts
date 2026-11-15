import type { Enums } from '../types/database';

// Types du contenu tel que l'utilisent les pages. Ils sont construits à partir
// des lignes Supabase (voir src/data/siteContent.ts).

export type AvailabilityStatus = Enums<'availability_status'>;
export type LandDevelopmentStatus = Enums<'land_dev_status'>;
export type LandCommercialStatus = Enums<'land_commercial_status'>;

export interface CompanyContact {
  label: string;
  /** Valeur affichée. */
  value: string;
  /** Valeur technique (numéro international sans espaces, adresse e-mail…). */
  raw: string;
}

export interface CompanyContacts {
  phone: CompanyContact | null;
  whatsapp: CompanyContact | null;
  email: CompanyContact | null;
  address: CompanyContact | null;
}

export interface CompanyProfile {
  brandName: string;
  /** Dénomination développée : réservée aux mentions légales et documents officiels. */
  fullName: string;
  country: string;
  headOffice: string;
  ambition: string | null;
  presentation: string[];
  mission: string | null;
  vision: string | null;
  values: string[];
  signatures: {
    brand: string | null;
    institutional: string | null;
    sectoral: string | null;
  };
  /** Champs juridiques : null tant qu'ils ne sont pas communiqués. */
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
  slug: string;
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

export interface HeroSlide {
  eyebrow: string | null;
  title: string;
  titleHighlight: string | null;
  subtitle: string | null;
  showSignature: boolean;
  primaryCta: { label: string; href: string } | null;
  secondaryCta: { label: string; href: string } | null;
}

export type ContentBlockKey =
  | 'home.presentation'
  | 'home.cta'
  | 'company.presentation'
  | 'projects.intro'
  | 'contact.intro';

export interface ContentBlock {
  title: string | null;
  body: string | null;
}

/** Tout le contenu public du site, chargé une fois au démarrage. */
export interface SiteContent {
  company: CompanyProfile;
  contacts: CompanyContacts;
  domains: ActivityDomain[];
  projects: LandProject[];
  hero: HeroSlide | null;
  blocks: Partial<Record<ContentBlockKey, ContentBlock>>;
}
