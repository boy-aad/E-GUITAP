import { supabase } from '../lib/supabase';
import { socialNetworkOf } from '../lib/social';
import { MEDIA_SELECT, toMediaAsset } from '../lib/media';
import type {
  ActivityDomain,
  CompanyContact,
  CompanyContacts,
  ContentBlock,
  ContentBlockKey,
  HeroSlide,
  LandProject,
  SiteContent,
} from '../content/types';

// Lecture du contenu public. Les filtres de publication sont répétés ici même si les
// règles RLS les appliquent déjà : un membre de l'équipe connecté ne doit pas voir
// de brouillons sur le site public.

/** Lève une erreur lisible si une requête Supabase échoue. */
function unwrap<T>(result: { data: T | null; error: { message: string } | null }, what: string): T {
  if (result.error) throw new Error(`Chargement impossible (${what}) : ${result.error.message}`);
  if (result.data === null) throw new Error(`Chargement impossible (${what}) : aucune donnée.`);
  return result.data;
}

/** Délai maximum de chargement : au-delà, l'écran d'erreur propose de réessayer. */
const LOAD_TIMEOUT_MS = 15_000;

/** Colonnes publiques d'un média (bucket public-media), tailles comprises. */
const MEDIA_COLUMNS = MEDIA_SELECT;
const toMedia = toMediaAsset;

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order;

export async function loadSiteContent({ request }: { request: Request }): Promise<SiteContent> {
  // Annulé si le visiteur quitte la page, ou si le réseau ne répond pas à temps.
  const signal = AbortSignal.any([request.signal, AbortSignal.timeout(LOAD_TIMEOUT_MS)]);

  const [profileRes, valuesRes, contactsRes, domainsRes, projectsRes, heroRes, blocksRes] = await Promise.all([
    supabase
      .from('company_profile')
      .select(
        'brand_name, full_name, country, head_office, ambition, presentation, mission, vision, signature_brand, signature_institutional, signature_sectoral, legal_form, rccm, nif, publication_manager, host_name',
      )
      .abortSignal(signal)
      .single(),
    supabase.from('company_values').select('title').eq('publication', 'publie').order('sort_order').abortSignal(signal),
    supabase
      .from('company_contacts')
      .select('kind, label, value, raw_value')
      .eq('is_public', true)
      .order('sort_order')
      .abortSignal(signal),
    supabase
      .from('activity_domains')
      .select(
        `slug, letter, title, short_title, summary, availability, sort_order, cover:media!activity_domains_cover_media_id_fkey (${MEDIA_COLUMNS}), activity_services (slug, title, summary, description, availability, publication, sort_order, is_featured, quote_enabled, cover:media!activity_services_cover_media_id_fkey (${MEDIA_COLUMNS}))`,
      )
      .eq('publication', 'publie')
      .neq('availability', 'non_confirmee')
      .order('sort_order')
      .abortSignal(signal),
    // Colonnes listées explicitement : anon n'a pas accès aux coordonnées ni au statut documentaire.
    supabase
      .from('land_projects')
      .select(
        'slug, name, prefecture, area_ha, summary, description, development_status, commercial_status, sort_order, land_project_objectives (label, sort_order)',
      )
      .eq('publication', 'publie')
      .order('sort_order')
      .abortSignal(signal),
    supabase
      .from('hero_slides')
      .select(
        `eyebrow, title, title_highlight, subtitle, show_signature, focal_x, focal_y, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, background:media!hero_slides_background_media_id_fkey (${MEDIA_COLUMNS})`,
      )
      .eq('is_active', true)
      .order('sort_order')
      .abortSignal(signal),
    supabase.from('content_blocks').select('key, title, body').eq('publication', 'publie').abortSignal(signal),
  ]);

  const profile = unwrap(profileRes, 'profil');
  const values = unwrap(valuesRes, 'valeurs');
  const contactRows = unwrap(contactsRes, 'coordonnées');
  const domainRows = unwrap(domainsRes, 'activités');
  const projectRows = unwrap(projectsRes, 'projets');
  const heroRows = unwrap(heroRes, 'accueil');
  const blockRows = unwrap(blocksRes, 'textes');

  const contactOf = (kind: string): CompanyContact | null => {
    const row = contactRows.find((c) => c.kind === kind);
    return row ? { label: row.label, value: row.value, raw: row.raw_value } : null;
  };
  const contacts: CompanyContacts = {
    phone: contactOf('phone'),
    whatsapp: contactOf('whatsapp'),
    email: contactOf('email'),
    address: contactOf('address'),
    // Seules les adresses https sont retenues.
    social: contactRows
      .filter((c) => c.kind === 'social' && /^https:\/\//i.test(c.raw_value))
      .map((c) => ({ network: socialNetworkOf(c.raw_value), label: c.label, url: c.raw_value })),
  };

  const domains: ActivityDomain[] = domainRows.map((d) => ({
    cover: toMedia(d.cover),
    slug: d.slug,
    letter: d.letter,
    title: d.title,
    shortTitle: d.short_title,
    summary: d.summary,
    availability: d.availability,
    services: d.activity_services
      .filter((s) => s.publication === 'publie' && s.availability !== 'non_confirmee')
      .sort(bySortOrder)
      .map((s) => ({
        slug: s.slug,
        title: s.title,
        summary: s.summary,
        description: s.description,
        availability: s.availability,
        isFeatured: s.is_featured,
        quoteEnabled: s.quote_enabled,
        cover: toMedia(s.cover),
        domainSlug: d.slug,
        sortOrder: s.sort_order,
      })),
  }));

  // Catalogue : mises en avant d'abord, puis ordre des catégories, puis ordre des offres.
  const offers = domains
    .flatMap((d) => d.services)
    .map((o, i) => ({ o, i }))
    .sort((a, b) => Number(b.o.isFeatured) - Number(a.o.isFeatured) || a.i - b.i)
    .map(({ o }) => o);

  const projects: LandProject[] = projectRows.map((p) => ({
    slug: p.slug,
    name: p.name,
    prefecture: p.prefecture,
    areaHa: Number(p.area_ha),
    summary: p.summary,
    description: p.description,
    objectives: [...p.land_project_objectives].sort(bySortOrder).map((o) => o.label),
    developmentStatus: p.development_status,
    commercialStatus: p.commercial_status,
  }));

  const heroSlides: HeroSlide[] = heroRows.map((h) => ({
    background: toMedia(h.background),
    focal: { x: Number(h.focal_x), y: Number(h.focal_y) },
    eyebrow: h.eyebrow,
    title: h.title,
    titleHighlight: h.title_highlight,
    subtitle: h.subtitle,
    showSignature: h.show_signature,
    primaryCta: h.primary_cta_label && h.primary_cta_href ? { label: h.primary_cta_label, href: h.primary_cta_href } : null,
    secondaryCta:
      h.secondary_cta_label && h.secondary_cta_href ? { label: h.secondary_cta_label, href: h.secondary_cta_href } : null,
  }));

  const blocks: Partial<Record<ContentBlockKey, ContentBlock>> = {};
  for (const b of blockRows) blocks[b.key as ContentBlockKey] = { title: b.title, body: b.body };

  return {
    company: {
      brandName: profile.brand_name,
      fullName: profile.full_name,
      country: profile.country,
      headOffice: profile.head_office,
      ambition: profile.ambition,
      presentation: profile.presentation,
      mission: profile.mission,
      vision: profile.vision,
      values: values.map((v) => v.title),
      signatures: {
        brand: profile.signature_brand,
        institutional: profile.signature_institutional,
        sectoral: profile.signature_sectoral,
      },
      legal: {
        legalForm: profile.legal_form,
        rccm: profile.rccm,
        nif: profile.nif,
        publicationManager: profile.publication_manager,
        host: profile.host_name,
      },
    },
    contacts,
    domains,
    projects,
    heroSlides,
    offers,
    blocks,
  };
}
