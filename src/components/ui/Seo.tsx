type SeoProps = {
  title: string;
  description: string;
};

const SITE = 'E-GUITAP';

/**
 * Titre et description par page. React 19 place automatiquement
 * <title> et <meta> dans le <head>.
 */
export function Seo({ title, description }: SeoProps) {
  const fullTitle = title === SITE ? `${SITE} — Construire • Échanger • Développer` : `${title} | ${SITE}`;
  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
    </>
  );
}
