import type { ReactNode } from 'react';
import { Skyline, TricolorBand } from '../brand/Skyline';
import type { MediaAsset } from '../../content/types';
import { Breadcrumbs, type Crumb } from './Navigation';
import { Eyebrow } from './Eyebrow';
import { SmartImage } from './SmartImage';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  /** Fil d'Ariane après « Accueil » ; par défaut, le titre de la page. */
  crumbs?: Crumb[];
  /** Image de fond (bannière) ; sinon, scène de marque statique. */
  image?: MediaAsset | null;
};

/** Scène de marque statique : dégradé marine, skyline et repère d'angle doré. */
function BrandScene() {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-marine-dark via-marine to-marine-light" aria-hidden="true">
      <Skyline className="absolute inset-x-0 bottom-0 h-28 w-full text-marine-light/80 sm:h-40" />
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gold/10 blur-3xl" />
    </div>
  );
}

/**
 * Bannière des pages intérieures (format 21:9 sur grand écran) : image si disponible,
 * sinon scène de marque, avec fil d'Ariane, eyebrow, titre et introduction.
 */
export function PageHero({ eyebrow, title, children, crumbs, image }: PageHeroProps) {
  const trail: Crumb[] = [{ label: 'Accueil', to: '/' }, ...(crumbs ?? [{ label: title }])];
  return (
    <section className="relative isolate overflow-hidden bg-marine text-white">
      {image ? (
        <>
          <SmartImage media={image} ratio="auto" priority sizes="100vw" fallback={<BrandScene />} className="absolute! inset-0 -z-10" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-marine-dark/90 via-marine/70 to-marine/20" aria-hidden="true" />
        </>
      ) : (
        <div className="absolute inset-0 -z-10">
          <BrandScene />
        </div>
      )}
      <div className="relative mx-auto flex min-h-[300px] max-w-7xl flex-col justify-end px-4 pb-14 pt-12 sm:min-h-[340px] sm:px-6 lg:aspect-[21/9] lg:max-h-[520px] lg:min-h-[400px] lg:px-8 lg:pb-20">
        <div className="max-w-3xl space-y-5">
          <Breadcrumbs items={trail} onDark />
          <Eyebrow tone="dark">{eyebrow}</Eyebrow>
          <h1 className="font-poppins text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]">{title}</h1>
          {children && <div className="max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">{children}</div>}
        </div>
      </div>
      <TricolorBand className="relative h-1" />
    </section>
  );
}
