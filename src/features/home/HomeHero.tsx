import { useState } from 'react';
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { TricolorBand } from '../../components/brand/Skyline';
import { Button } from '../../components/ui/Button';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { HERO_PHOTOS, stockImage } from '../../content/stockPhotos';
import type { HeroSlide } from '../../content/types';
import { useSiteContent } from '../../data/useSiteContent';
import { mediaImage } from '../../lib/media';
import { useInquiry } from '../inquiry/InquiryContext';
import { HeroBackground } from './HeroBackground';
import { useCarousel } from './useCarousel';

/** Un CTA dont l'adresse vaut « #devis » ouvre la demande au lieu de naviguer. */
const INQUIRY_HREF = '#devis';
const INTERVAL_MS = 7000;

/**
 * Hero de l'accueil : carrousel des slides actives (table hero_slides). Fond : image de la
 * slide, sinon photo par défaut, sinon scène animée de marque. L'en-tête transparent s'y superpose.
 */
export function HomeHero() {
  const { company, heroSlides } = useSiteContent();
  const { openInquiry } = useInquiry();
  // Aucune slide active : une slide minimale construite à partir du profil de l'entreprise.
  const slides: HeroSlide[] = heroSlides.length
    ? heroSlides
    : [
        {
          background: null,
          focal: { x: 0.5, y: 0.5 },
          eyebrow: null,
          title: company.brandName,
          titleHighlight: null,
          subtitle: company.signatures.institutional,
          showSignature: true,
          primaryCta: null,
          secondaryCta: null,
        },
      ];
  const carousel = useCarousel(slides.length, INTERVAL_MS);
  // Image de chaque slide : téléversée, sinon photo par défaut (une différente par slide).
  const sources = slides.map((s, i) =>
    s.background ? mediaImage(s.background) : stockImage(HERO_PHOTOS[i % HERO_PHOTOS.length] ?? 'heroRoutes'),
  );
  const [failed, setFailed] = useState<ReadonlySet<number>>(new Set());
  const activeSource = failed.has(carousel.index) ? null : sources[carousel.index];
  const multiple = slides.length > 1;
  const slide = slides[carousel.index] ?? slides[0];

  const cta = (c: { label: string; href: string }, primary: boolean) => {
    const common = {
      size: 'lg' as const,
      variant: primary ? ('primary' as const) : ('secondary' as const),
      onDark: true,
      iconRight: primary ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : undefined,
    };
    if (c.href === INQUIRY_HREF) {
      return (
        <Button {...common} onClick={() => openInquiry()}>
          {c.label}
        </Button>
      );
    }
    return /^(https?:|mailto:|tel:)/i.test(c.href) ? (
      <Button {...common} href={c.href}>
        {c.label}
      </Button>
    ) : (
      <Button {...common} to={c.href}>
        {c.label}
      </Button>
    );
  };

  return (
    <section
      className="relative isolate flex min-h-[80svh] flex-col overflow-hidden bg-marine-dark text-white lg:min-h-[88svh]"
      aria-roledescription={multiple ? 'carrousel' : undefined}
      aria-label="À la une"
      {...(multiple ? carousel.bind : {})}
    >
      {/* Fonds empilés : fondu enchaîné d'une seconde entre les slides. */}
      {sources.map((source, i) => (
        <HeroBackground
          key={i}
          source={source ?? null}
          focal={slides[i]?.focal ?? null}
          failed={failed.has(i)}
          onError={() => setFailed((prev) => new Set(prev).add(i))}
          active={i === carousel.index}
          priority={i === 0}
        />
      ))}
      {/* Lisibilité du texte : dégradé marine de gauche à droite + vignette basse. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-marine-dark/90 via-marine/60 to-transparent" aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-marine-dark/80 to-transparent" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 pb-32 pt-32 sm:px-6 lg:px-8 lg:pb-40 lg:pt-36">
        <div
          key={carousel.index}
          className="hero-text-in max-w-3xl space-y-6"
          role={multiple ? 'group' : undefined}
          aria-roledescription={multiple ? 'diapositive' : undefined}
          aria-label={multiple ? `${carousel.index + 1} sur ${slides.length}` : undefined}
          aria-live={multiple ? (carousel.running ? 'off' : 'polite') : undefined}
        >
          {slide.eyebrow && <Eyebrow tone="dark">{slide.eyebrow}</Eyebrow>}
          {/* Le titre de la page reste un h1 unique ; les slides suivantes en reprennent le rôle. */}
          <h1 className="font-poppins text-4xl font-bold leading-[1.08] tracking-tight [text-shadow:0_2px_24px_rgba(10,28,51,0.45)] sm:text-6xl lg:text-7xl">
            {slide.title}
            {slide.titleHighlight && (
              <>
                <br />
                <span className="text-gold">{slide.titleHighlight}</span>
              </>
            )}
          </h1>
          {slide.subtitle && <p className="max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg lg:text-xl">{slide.subtitle}</p>}
          {slide.showSignature && company.signatures.brand && (
            <p className="font-lora text-lg italic text-gold sm:text-xl">{company.signatures.brand}</p>
          )}
          {(slide.primaryCta || slide.secondaryCta) && (
            <div className="flex flex-col gap-3 pt-3 sm:flex-row">
              {slide.primaryCta && cta(slide.primaryCta, true)}
              {slide.secondaryCta && cta(slide.secondaryCta, false)}
            </div>
          )}
        </div>
      </div>

      {multiple && (
        <div className="absolute bottom-24 right-4 flex items-center gap-2 sm:right-6 lg:bottom-28 lg:right-8">
          {carousel.canAutoplay && (
            <button
              type="button"
              onClick={carousel.togglePause}
              className="rounded-full border border-white/30 p-2 text-white/90 transition-colors hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-gold"
              aria-label={carousel.autoplay ? 'Mettre en pause le défilement' : 'Reprendre le défilement'}
            >
              {carousel.autoplay ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            </button>
          )}
          <button
            type="button"
            onClick={carousel.prev}
            className="rounded-full border border-white/30 p-2 text-white/90 transition-colors hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-gold"
            aria-label="Diapositive précédente"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-1.5 px-1">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => carousel.go(i)}
                className={`h-2 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${
                  i === carousel.index ? 'w-7 bg-gold' : 'w-2 bg-white/50 hover:bg-white'
                }`}
                aria-label={`Afficher la diapositive ${i + 1}`}
                aria-current={i === carousel.index ? 'true' : undefined}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={carousel.next}
            className="rounded-full border border-white/30 p-2 text-white/90 transition-colors hover:border-gold hover:text-gold focus-visible:outline-2 focus-visible:outline-gold"
            aria-label="Diapositive suivante"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {activeSource?.notice && (
        <span className="pointer-events-none absolute bottom-[4.5rem] left-4 rounded bg-marine-dark/75 px-1.5 py-0.5 text-[10px] font-medium leading-4 text-white sm:left-6 lg:left-8">
          {activeSource.notice}
        </span>
      )}

      <a
        href="#chiffres-cles"
        className="absolute bottom-20 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/75 transition-colors hover:text-gold sm:flex"
      >
        Découvrir
        <ChevronDown className="h-5 w-5 motion-safe:animate-bounce" aria-hidden="true" />
      </a>
      <TricolorBand className="relative h-1" />
    </section>
  );
}
