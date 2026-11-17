import { useState, type ReactNode } from 'react';
import type { MediaAsset } from '../../content/types';
import { publicMediaUrl } from '../../lib/media';

export type ImageRatio = '4/3' | '16/9' | '21/9' | '1/1' | 'auto';

const RATIOS: Record<ImageRatio, string> = {
  '4/3': 'aspect-[4/3]',
  '16/9': 'aspect-video',
  '21/9': 'aspect-[21/9]',
  '1/1': 'aspect-square',
  auto: '',
};

type SmartImageProps = {
  /** Média de la base (bucket public-media). */
  media?: MediaAsset | null;
  /** Ou une image du site (ex. illustration SVG par défaut). */
  src?: string | null;
  /** Texte alternatif quand `src` est utilisé (vide = image décorative). */
  alt?: string;
  /** Mention affichée sur l'image si elle n'est pas une photo réelle d'E-GUITAP. */
  notice?: string | null;
  ratio?: ImageRatio;
  /** Image principale de la page (hero) : chargement prioritaire. */
  priority?: boolean;
  /** Largeurs d'affichage, pour que le navigateur choisisse la bonne taille. */
  sizes?: string;
  /** Rendu de repli si aucune image n'est disponible ou si le chargement échoue. */
  fallback?: ReactNode;
  className?: string;
  imgClassName?: string;
};

/** Mention à afficher selon la nature du média (règle 5 de CLAUDE.md). */
export function mediaNotice(media: MediaAsset): string | null {
  if (media.kind !== 'illustration') return null;
  return media.credit ? "Photo d'illustration" : "Visuel d'illustration";
}

/**
 * Image de contenu : ratio fixe (pas de décalage de mise en page), chargement différé
 * hors écran, deux tailles si le média en dispose, mention d'illustration, et repli
 * aux couleurs de la charte si l'image manque ou ne se charge pas.
 */
export function SmartImage({
  media,
  src,
  alt = '',
  notice,
  ratio = '4/3',
  priority,
  sizes = '(min-width: 1024px) 33vw, 100vw',
  fallback,
  className = '',
  imgClassName = '',
}: SmartImageProps) {
  const [failed, setFailed] = useState(false);

  const url = media ? publicMediaUrl(media.path) : (src ?? null);
  const srcSet = media?.variants
    ? Object.entries(media.variants)
        .map(([width, path]) => `${publicMediaUrl(path)} ${width}w`)
        .join(', ')
    : undefined;
  const label = notice !== undefined ? notice : media ? mediaNotice(media) : null;
  const showImage = url && !failed;

  return (
    <div className={`relative overflow-hidden bg-marine ${RATIOS[ratio]} ${className}`}>
      {showImage ? (
        <img
          src={url}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          alt={media ? media.alt : alt}
          width={media?.width ?? undefined}
          height={media?.height ?? undefined}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
        />
      ) : (
        <div className="absolute inset-0">{fallback}</div>
      )}
      {showImage && label && (
        <span className="pointer-events-none absolute bottom-2 right-2 rounded bg-marine-dark/75 px-1.5 py-0.5 text-[10px] font-medium leading-4 text-white">
          {label}
        </span>
      )}
    </div>
  );
}
