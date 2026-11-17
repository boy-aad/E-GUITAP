import type { ImageSource, MediaAsset } from '../content/types';
import { supabase } from './supabase';

/** Bucket public des images du site. */
export const PUBLIC_MEDIA_BUCKET = 'public-media';

/** URL publique d'un fichier du bucket public-media (aucune requête réseau). */
export const publicMediaUrl = (path: string) =>
  supabase.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;

/** Mention à afficher selon la nature du média (règle 5 de CLAUDE.md). */
export function mediaNotice(media: MediaAsset): string | null {
  if (media.kind !== 'illustration') return null;
  return media.credit ? "Photo d'illustration" : "Visuel d'illustration";
}

/** Média de la base → image prête à afficher. */
export function mediaImage(media: MediaAsset): ImageSource {
  const srcSet = media.variants
    ? Object.entries(media.variants)
        .map(([width, path]) => `${publicMediaUrl(path)} ${width}w`)
        .join(', ')
    : undefined;
  return {
    src: publicMediaUrl(media.path),
    srcSet,
    alt: media.alt,
    width: media.width ?? undefined,
    height: media.height ?? undefined,
    notice: mediaNotice(media),
    credit: media.credit,
  };
}
