import { ArrowRight, ChevronDown } from 'lucide-react';
import { Skyline, TricolorBand } from '../../components/brand/Skyline';
import { Button } from '../../components/ui/Button';
import { Eyebrow } from '../../components/ui/Eyebrow';
import { useSiteContent } from '../../data/useSiteContent';
import { useInquiry } from '../inquiry/InquiryContext';

/** Un CTA dont l'adresse vaut « #devis » ouvre la demande au lieu de naviguer. */
const INQUIRY_HREF = '#devis';

/**
 * Hero de l'accueil (contenu : table hero_slides). L'en-tête transparent se superpose
 * à ce bandeau ; le carrousel et les images de fond arrivent en phase 2.
 */
export function HomeHero() {
  const { company, hero } = useSiteContent();
  const { openInquiry } = useInquiry();
  const subtitle = hero?.subtitle ?? company.signatures.institutional;

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
    <section className="relative isolate flex min-h-[80svh] flex-col overflow-hidden bg-marine-dark text-white lg:min-h-[88svh]">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-marine-dark via-marine to-marine-light" aria-hidden="true" />
      <div className="absolute -right-32 top-10 -z-10 h-[28rem] w-[28rem] rounded-full bg-gold/10 blur-3xl" aria-hidden="true" />
      <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 w-full text-marine-light/70 sm:h-44" />

      <div className="mx-auto flex w-full max-w-7xl flex-1 items-center px-4 pb-28 pt-32 sm:px-6 lg:px-8 lg:pb-36 lg:pt-36">
        <div className="max-w-3xl space-y-6">
          {hero?.eyebrow && <Eyebrow tone="dark">{hero.eyebrow}</Eyebrow>}
          <h1 className="font-poppins text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
            {hero ? (
              <>
                {hero.title}
                {hero.titleHighlight && (
                  <>
                    <br />
                    <span className="text-gold">{hero.titleHighlight}</span>
                  </>
                )}
              </>
            ) : (
              company.brandName
            )}
          </h1>
          {subtitle && <p className="max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg lg:text-xl">{subtitle}</p>}
          {(hero?.showSignature ?? true) && company.signatures.brand && (
            <p className="font-lora text-lg italic text-gold sm:text-xl">{company.signatures.brand}</p>
          )}
          {(hero?.primaryCta || hero?.secondaryCta) && (
            <div className="flex flex-col gap-3 pt-3 sm:flex-row">
              {hero.primaryCta && cta(hero.primaryCta, true)}
              {hero.secondaryCta && cta(hero.secondaryCta, false)}
            </div>
          )}
        </div>
      </div>

      <a
        href="#chiffres-cles"
        className="absolute bottom-20 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:text-gold sm:flex"
      >
        Découvrir
        <ChevronDown className="h-5 w-5 motion-safe:animate-bounce" aria-hidden="true" />
      </a>
      <TricolorBand className="relative h-1" />
    </section>
  );
}
