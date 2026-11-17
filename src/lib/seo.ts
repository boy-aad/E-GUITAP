import { env } from '../config/env';
import type { SiteContent } from '../content/types';
import type { Crumb } from '../components/ui/Navigation';

/** Origine publique du site : VITE_SITE_URL, sinon l'adresse courante. */
export const siteOrigin = () => env.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '');

/** URL absolue d'un chemin du site (laisse intactes les URL déjà absolues). */
export const absoluteUrl = (path: string) => (/^https?:\/\//i.test(path) ? path : `${siteOrigin()}${path.startsWith('/') ? '' : '/'}${path}`);

/**
 * Organization + LocalBusiness (schema.org), construits uniquement à partir des champs
 * publiés en base : un champ vide est omis, rien n'est inventé.
 */
export function organizationJsonLd({ company, contacts }: Pick<SiteContent, 'company' | 'contacts'>) {
  const origin = siteOrigin();
  const base = {
    name: company.brandName,
    legalName: company.fullName,
    url: `${origin}/`,
    logo: `${origin}/assets/logo/eguitap-logo.svg`,
    ...(company.signatures.institutional ? { description: company.signatures.institutional } : {}),
    ...(contacts.phone ? { telephone: contacts.phone.raw } : {}),
    ...(contacts.email ? { email: contacts.email.raw } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(contacts.address ? { streetAddress: contacts.address.value } : {}),
      addressLocality: company.headOffice,
      addressCountry: 'GN',
    },
    ...(contacts.social.length ? { sameAs: contacts.social.map((s) => s.url) } : {}),
  };
  return [
    { '@context': 'https://schema.org', '@type': 'Organization', '@id': `${origin}/#organisation`, ...base },
    {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': `${origin}/#etablissement`,
      ...base,
      image: `${origin}/og/default.png`,
      parentOrganization: { '@id': `${origin}/#organisation` },
    },
  ];
}

/** Fil d'Ariane (schema.org BreadcrumbList) ; le dernier élément est la page courante. */
export function breadcrumbJsonLd(items: Crumb[], currentPath: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: absoluteUrl(item.to ?? currentPath),
    })),
  };
}

/** Sérialise des données JSON-LD pour une balise <script> (aucun « < » ne peut fermer la balise). */
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
