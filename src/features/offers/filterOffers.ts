import type { AvailabilityStatus, Offer } from '../../content/types';

/** Minuscules, sans accents : la recherche ignore la casse et les accents. */
export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

export type OfferFilters = {
  /** Slug de catégorie ; '' = toutes. */
  category: string;
  query: string;
  /** '' = toutes disponibilités. */
  availability: AvailabilityStatus | '';
};

export function filterOffers(offers: Offer[], f: OfferFilters): Offer[] {
  const words = normalize(f.query).split(/\s+/).filter(Boolean);
  return offers.filter((o) => {
    if (f.category && o.domainSlug !== f.category) return false;
    if (f.availability && o.availability !== f.availability) return false;
    if (!words.length) return true;
    const haystack = normalize(`${o.title} ${o.summary ?? ''}`);
    return words.every((w) => haystack.includes(w));
  });
}
