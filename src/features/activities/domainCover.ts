import { CATEGORY_PHOTOS, stockImage } from '../../content/stockPhotos';
import type { ActivityDomain, ImageSource } from '../../content/types';
import { mediaImage } from '../../lib/media';

/** Couverture d'un domaine : image téléversée, sinon photo par défaut de la catégorie, sinon rien. */
export function domainCoverImage(domain: ActivityDomain): ImageSource | null {
  if (domain.cover) return mediaImage(domain.cover);
  const key = CATEGORY_PHOTOS[domain.slug];
  return key ? { ...stockImage(key), alt: '' } : null;
}
