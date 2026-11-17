import { CATEGORY_ILLUSTRATIONS, OFFER_ILLUSTRATIONS } from '../../content/offerIllustrations';
import type { ImageSource, Offer } from '../../content/types';
import { mediaImage } from '../../lib/media';

const ILLUSTRATION_NOTICE = "Visuel d'illustration";
const BASE = '/assets/illustrations';

/**
 * Image d'une offre (PRD § 5.3) : média téléversé → illustration de l'offre →
 * illustration de sa catégorie → illustration générique. Les illustrations sont
 * décoratives (alt vide) et portent la mention « Visuel d'illustration ».
 */
export function resolveOfferImage(offer: Offer): ImageSource {
  if (offer.cover) return mediaImage(offer.cover);
  const src = OFFER_ILLUSTRATIONS.has(offer.slug)
    ? `${BASE}/offres/${offer.slug}.svg`
    : CATEGORY_ILLUSTRATIONS.has(offer.domainSlug)
      ? `${BASE}/categories/${offer.domainSlug}.svg`
      : `${BASE}/defaut.svg`;
  return { src, alt: '', width: 800, height: 600, notice: ILLUSTRATION_NOTICE };
}
