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
  // Petites tailles + grande taille (chemin principal) : le navigateur choisit selon l'écran.
  const srcSet =
    media.variants && Object.keys(media.variants).length
      ? [
          ...Object.entries(media.variants).map(([width, path]) => `${publicMediaUrl(path)} ${width}w`),
          ...(media.width ? [`${publicMediaUrl(media.path)} ${media.width}w`] : []),
        ].join(', ')
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

/** Colonnes d'un média utiles à l'affichage (sélection Supabase). */
export const MEDIA_SELECT = 'path, kind, alt, credit, width, height, variants';

type MediaDbRow = Omit<MediaAsset, 'variants'> & { variants?: unknown };

/** Ligne de la table media → MediaAsset (tailles : { "640": chemin } → { 640: chemin }). */
export function toMediaAsset(row: MediaDbRow | null | undefined): MediaAsset | null {
  if (!row) return null;
  const raw = row.variants && typeof row.variants === 'object' ? (row.variants as Record<string, unknown>) : {};
  const variants: Record<number, string> = {};
  for (const [w, p] of Object.entries(raw)) if (typeof p === 'string' && Number(w) > 0) variants[Number(w)] = p;
  return { path: row.path, kind: row.kind, alt: row.alt, credit: row.credit, width: row.width, height: row.height, variants };
}
