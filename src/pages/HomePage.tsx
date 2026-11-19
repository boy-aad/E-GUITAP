import { ArrowRight } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { Button } from '../components/ui/Button';
import { Section } from '../components/ui/Section';
import { Reveal } from '../components/ui/Reveal';
import { BrandPanel } from '../components/brand/Skyline';
import { SmartImage } from '../components/ui/SmartImage';
import { stockImage } from '../content/stockPhotos';
import { LAND_DISCLAIMER, formatHectares, totalAreaHa } from '../content/landProjects';
import { useSiteContent } from '../data/useSiteContent';
import { DomainCard } from '../features/activities/DomainCard';
import { ProjectCard } from '../features/projects/ProjectCard';
import { OfferCard } from '../features/offers/OfferCard';
import { HomeHero } from '../features/home/HomeHero';
import { KeyFacts } from '../features/home/KeyFacts';
import { CtaBand } from '../features/home/CtaBand';
import { QuickContact } from '../features/home/QuickContact';
import { organizationJsonLd } from '../lib/seo';

export function HomePage() {
  const { company, contacts, domains, projects, blocks, offers } = useSiteContent();
  const featured = offers.filter((o) => o.isFeatured);
  const featuredOffers = (featured.length ? featured : offers).slice(0, 6);
  const totalHa = totalAreaHa(projects);
  const presentation = blocks['home.presentation'];

  return (
    <>
      <Seo
        title="E-GUITAP"
        description="E-GUITAP, entreprise guinéenne multisectorielle basée à Dubréka et Conakry : BTP, immobilier et aménagement foncier, commerce général, import-export, et projets fonciers."
        jsonLd={organizationJsonLd({ company, contacts })}
      />

      <HomeHero />
      <KeyFacts />

      {/* Présentation */}
      <Section tone="paper">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="space-y-6">
            <p className="flex items-center gap-2.5 font-inter text-xs font-semibold uppercase tracking-[0.15em] text-slate-text">
              <span className="h-0.5 w-6 bg-gold" aria-hidden="true" />
              L'entreprise
            </p>
            <h2 className="font-poppins text-3xl font-bold leading-tight tracking-tight text-marine sm:text-4xl">
              {/* Jamais la dénomination développée (réservée aux mentions légales). */}
              {presentation?.title ?? company.brandName}
            </h2>
            {presentation?.body ? (
              <p className="whitespace-pre-line text-base leading-relaxed text-slate-text sm:text-lg">{presentation.body}</p>
            ) : (
              company.presentation.slice(0, 2).map((p) => (
                <p key={p} className="text-base leading-relaxed text-slate-text sm:text-lg">
                  {p}
                </p>
              ))
            )}
            <Button variant="ghost" to="/entreprise" className="link-underline" iconRight={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
              Découvrir l'entreprise
            </Button>
          </Reveal>
          <Reveal delay={120}>
            <SmartImage
              image={{ ...stockImage('pageEntreprise'), alt: '' }}
              ratio="4/3"
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="rounded-xl shadow-[0_30px_60px_-30px_rgba(16,44,80,0.5)]"
              fallback={<BrandPanel className="h-full" label={company.headOffice} />}
            />
          </Reveal>
        </div>
      </Section>

      {/* Domaines d'activité */}
      {domains.length > 0 && (
        <Section
          tone="white"
          id="domaines"
          eyebrow="Nos activités"
          title="Nos domaines d'activité"
          action={
            <Button variant="secondary" to="/activites" iconRight={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
              Toutes nos activités
            </Button>
          }
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {domains.map((domain, i) => (
              <Reveal key={domain.slug} delay={i * 80} className="h-full">
                <DomainCard domain={domain} />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* Offres phares : mises en avant, sinon les premières du catalogue. */}
      {featuredOffers.length > 0 && (
        <Section
          tone="paper"
          id="offres"
          eyebrow="Catalogue"
          title="Nos offres phares"
          action={
            <Button variant="secondary" to="/offres" iconRight={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
              Voir tout le catalogue
            </Button>
          }
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredOffers.map((offer, i) => (
              <Reveal key={offer.slug} delay={(i % 3) * 80} className="h-full">
                <OfferCard offer={offer} compact />
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* Projets fonciers */}
      {projects.length > 0 && (
        <Section
          tone="white"
          id="projets"
          eyebrow="Nos projets fonciers"
          title={`${projects.length} site${projects.length > 1 ? 's' : ''}, ${formatHectares(totalHa)} annoncés`}
          intro={blocks['projects.intro']?.body}
          action={
            <Button variant="secondary" to="/projets" iconRight={<ArrowRight className="h-4 w-4" aria-hidden="true" />}>
              Tous les projets
            </Button>
          }
        >
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {projects.map((project, i) => (
              <Reveal key={project.slug} delay={i * 80} className="h-full">
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
          <p className="mt-8 text-xs leading-relaxed text-slate-text">{LAND_DISCLAIMER}</p>
        </Section>
      )}

      {/* Mission, vision, valeurs */}
      {(company.mission || company.vision || company.values.length > 0) && (
        <Section tone="marine" eyebrow="Ce qui nous guide" title="Mission, vision et valeurs">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              {company.mission && (
                <Reveal className="space-y-3 border-l-2 border-gold pl-6">
                  <h3 className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-gold">Mission</h3>
                  <p className="text-lg leading-relaxed text-white/90">{company.mission}</p>
                </Reveal>
              )}
              {company.vision && (
                <Reveal delay={100} className="space-y-3 border-l-2 border-gold pl-6">
                  <h3 className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-gold">Vision</h3>
                  <p className="text-lg leading-relaxed text-white/90">{company.vision}</p>
                </Reveal>
              )}
            </div>
            {company.values.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-gold">Nos valeurs</h3>
                <ol className="grid gap-3 sm:grid-cols-2">
                  {company.values.map((value, i) => (
                    <Reveal
                      as="li"
                      key={value}
                      delay={i * 60}
                      className="flex items-center gap-4 rounded-xl border border-white/10 bg-marine-light/40 px-5 py-4 transition-colors hover:border-gold/50"
                    >
                      <span className="font-poppins text-sm font-bold text-gold">{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-semibold">{value}</span>
                    </Reveal>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </Section>
      )}

      <CtaBand />
      <QuickContact />
    </>
  );
}
