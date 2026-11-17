import { useState, type ReactNode } from 'react';
import type { ImageSource } from '../../content/types';

export type ImageRatio = '4/3' | '16/9' | '21/9' | '1/1' | 'auto';

const RATIOS: Record<ImageRatio, string> = {
  '4/3': 'aspect-[4/3]',
  '16/9': 'aspect-video',
  '21/9': 'aspect-[21/9]',
  '1/1': 'aspect-square',
  auto: '',
};

type SmartImageProps = {
  /** Image à afficher (voir mediaImage, stockImage) ; null → repli. */
  image?: ImageSource | null;
  ratio?: ImageRatio;
  /** Image principale de la page (hero, bannière) : chargement prioritaire. */
  priority?: boolean;
  /** Largeurs d'affichage, pour que le navigateur choisisse la bonne taille. */
  sizes?: string;
  /** Rendu de repli si aucune image n'est disponible ou si le chargement échoue. */
  fallback?: ReactNode;
  /** Position de la mention d'illustration. */
  noticePosition?: 'bottom-right' | 'top-left';
  className?: string;
  imgClassName?: string;
};

/**
 * Image de contenu : ratio fixe (pas de décalage de mise en page), chargement différé
 * hors écran, deux tailles si disponibles, mention d'illustration, et repli aux
 * couleurs de la charte si l'image manque ou ne se charge pas.
 */
export function SmartImage({
  image,
  ratio = '4/3',
  priority,
  sizes = '(min-width: 1024px) 33vw, 100vw',
  fallback,
  noticePosition = 'bottom-right',
  className = '',
  imgClassName = '',
}: SmartImageProps) {
  const [failed, setFailed] = useState<string | null>(null);
  const showImage = image && failed !== image.src;

  return (
    <div className={`relative overflow-hidden bg-marine ${RATIOS[ratio]} ${className}`}>
      {showImage ? (
        <img
          src={image.src}
          srcSet={image.srcSet}
          sizes={image.srcSet ? sizes : undefined}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onError={() => setFailed(image.src)}
          className={`absolute inset-0 h-full w-full object-cover ${imgClassName}`}
        />
      ) : (
        <div className="absolute inset-0">{fallback}</div>
      )}
      {showImage && image.notice && <ImageNotice position={noticePosition}>{image.notice}</ImageNotice>}
    </div>
  );
}

/** Mention discrète « Photo d'illustration » / « Visuel d'illustration ». */
export function ImageNotice({ children, position = 'bottom-right' }: { children: ReactNode; position?: 'bottom-right' | 'top-left' | 'bottom-left' }) {
  const place = {
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'top-left': 'left-2 top-2',
  }[position];
  return (
    <span className={`pointer-events-none absolute z-10 rounded bg-marine-dark/75 px-1.5 py-0.5 text-[10px] font-medium leading-4 text-white ${place}`}>
      {children}
    </span>
  );
}
