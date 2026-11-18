import { resolveOfferImage } from '../../../features/offers/offerImage';
import type { ImageSource, MediaAsset } from '../../../content/types';

type OfferLike = { slug: string; cover: MediaAsset | null; activity_domains?: { slug: string } | null; domainSlug?: string };

/** Image d'une offre vue de l'administration (même règle que le site : média → illustration). */
export function adminOfferImage(o: OfferLike): ImageSource {
  return resolveOfferImage({
    slug: o.slug,
    cover: o.cover,
    domainSlug: o.domainSlug ?? o.activity_domains?.slug ?? '',
  } as Parameters<typeof resolveOfferImage>[0]);
}
