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

export type SocialNetwork = 'facebook' | 'linkedin' | 'instagram' | 'tiktok' | 'youtube' | 'x' | 'autre';

/** Compte officiel sur un réseau social (company_contacts.kind = 'social'). */
export interface SocialLink {
  network: SocialNetwork;
  label: string;
  url: string;
}

export interface CompanyContacts {
  phone: CompanyContact | null;
  whatsapp: CompanyContact | null;
  email: CompanyContact | null;
  address: CompanyContact | null;
  /** Vide tant qu'aucun compte n'est publié : la section est alors masquée. */
  social: SocialLink[];
}

export type MediaKind = Enums<'media_kind'>;

/** Image du bucket public-media. */
export interface MediaAsset {
  path: string;
  kind: MediaKind;
  alt: string;
  credit: string | null;
  width: number | null;
  height: number | null;
  /** Autres tailles disponibles : largeur en px → chemin dans le bucket. */
  variants?: Record<number, string>;
}

/** Image prête à afficher, quelle que soit son origine (média en base, photo ou illustration du site). */
export interface ImageSource {
  src: string;
  srcSet?: string;
  alt: string;
  width?: number;
  height?: number;
  /** Mention affichée sur l'image (« Photo d'illustration »…), null pour une photo réelle. */
  notice: string | null;
  credit?: string | null;
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

/** Offre du catalogue = prestation d'un domaine (activity_services). */
export interface ActivityService {
  slug: string;
  title: string;
  /** Résumé de carte (≤ 200 caractères) ; null = non affiché. */
  summary: string | null;
  /** Description complète de la fiche. */
  description: string | null;
  availability: AvailabilityStatus;
  isFeatured: boolean;
  /** Bouton « Demander un devis » affiché. */
  quoteEnabled: boolean;
  /** Image téléversée ; sinon illustration par défaut. */
  cover: MediaAsset | null;
  /** Catégorie (slug du domaine). */
  domainSlug: string;
  sortOrder: number;
}

/** Alias explicite côté catalogue. */
export type Offer = ActivityService;

export interface ActivityDomain {
  /** Image de couverture téléversée (sinon : photo ou visuel par défaut de la catégorie). */
  cover: MediaAsset | null;
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
  /** Image de fond téléversée (sinon : photo par défaut de la slide). */
  background: MediaAsset | null;
  /** Point focal de l'image (0 à 1) : le cadrage reste centré dessus. */
  focal: { x: number; y: number };
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
  /** Slides actives du hero de l'accueil, dans l'ordre. */
  heroSlides: HeroSlide[];
  /** Toutes les offres publiées : mises en avant d'abord, puis par catégorie et ordre. */
  offers: Offer[];
  blocks: Partial<Record<ContentBlockKey, ContentBlock>>;
}
