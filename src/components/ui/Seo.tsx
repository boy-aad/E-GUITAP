import { useLocation } from 'react-router';
import { absoluteUrl, serializeJsonLd } from '../../lib/seo';

type SeoProps = {
  title: string;
  description: string;
  /** Image de partage (chemin du site ou URL absolue, idéalement 1200 × 630, JPG/PNG/WebP). */
  image?: string | null;
  /** Page à ne pas indexer (404…). */
  noindex?: boolean;
  /** Données structurées schema.org (JSON-LD). */
  jsonLd?: object | object[];
};

const SITE = 'E-GUITAP';
/** Image de partage par défaut, dérivée du logo (1200 × 630). */
export const DEFAULT_OG_IMAGE = '/og/default.png';

/**
 * Titre, description, lien canonique, balises de partage et données structurées par page.
 * React 19 place automatiquement <title>, <meta> et <link> dans le <head>.
 */
export function Seo({ title, description, image, noindex, jsonLd }: SeoProps) {
  const { pathname } = useLocation();
  const fullTitle = title === SITE ? `${SITE} — Construire • Échanger • Développer` : `${title} | ${SITE}`;
  const url = absoluteUrl(pathname);
  const ogImage = absoluteUrl(image ?? DEFAULT_OG_IMAGE);
  const isDefaultImage = !image;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex ? <meta name="robots" content="noindex" /> : <link rel="canonical" href={url} />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      {isDefaultImage && <meta property="og:image:width" content="1200" />}
      {isDefaultImage && <meta property="og:image:height" content="630" />}
      <meta name="twitter:card" content="summary_large_image" />
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      )}
    </>
  );
}
