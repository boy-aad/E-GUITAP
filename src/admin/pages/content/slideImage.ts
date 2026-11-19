import { HERO_PHOTOS, stockImage } from '../../../content/stockPhotos';
import type { ImageSource } from '../../../content/types';
import { mediaImage } from '../../../lib/media';
import type { SlideRow } from './heroData';

/**
 * Image de fond d'une slide, comme sur le site : l'image choisie, sinon la photo par
 * défaut correspondant à sa place parmi les slides actives (une photo différente par slide).
 */
export function slideImage(slide: Pick<SlideRow, 'background'>, activeIndex: number): ImageSource {
  return slide.background ? mediaImage(slide.background) : stockImage(HERO_PHOTOS[Math.max(0, activeIndex) % HERO_PHOTOS.length] ?? 'heroRoutes');
}
