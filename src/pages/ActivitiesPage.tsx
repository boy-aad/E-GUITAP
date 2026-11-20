import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
import { stockImage } from '../content/stockPhotos';
import { Section } from '../components/ui/Section';
import { Reveal } from '../components/ui/Reveal';
import { Badge, Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useSiteContent } from '../data/useSiteContent';
import { DEFAULT_DOMAIN_ICON, DOMAIN_ICONS } from '../features/activities/domainIcons';
import { useInquiry } from '../features/inquiry/InquiryContext';
import { domainCoverImage } from '../features/activities/domainCover';
import { SmartImage } from '../components/ui/SmartImage';
import { BrandPanel } from '../components/brand/Skyline';

export function ActivitiesPage() {
  const { domains } = useSiteContent();
  const { openInquiry } = useInquiry();

  return (
    <>
      <Seo
        title="Nos activités"
        description="BTP, immobilier et aménagement foncier, commerce général, import-export : les domaines d'activité et prestations d'E-GUITAP."
      />
      <PageHero
        eyebrow="Nos activités"
        title="Nos domaines d'activité"
        crumbs={[{ label: 'Nos activités' }]}
        image={stockImage('pageActivites')}
      >
        <p>
          E-GUITAP intervient dans le BTP, l'immobilier et l'aménagement foncier, le commerce général et
          l'import-export, depuis Dubréka et Conakry.
        </p>
      </PageHero>

      <Section tone="paper" compact>
        <div className="space-y-8">
          {domains.map((domain, index) => {
            const Icon = DOMAIN_ICONS[domain.slug] ?? DEFAULT_DOMAIN_ICON;
            return (
              <Reveal key={domain.slug} variant={index % 2 === 0 ? 'left' : 'right'}>
                <Card
                  as="section"
                  id={domain.slug}
                  aria-labelledby={`${domain.slug}-title`}
                  className="grid scroll-mt-28 lg:grid-cols-5"
                >
                  {/* Visuel du domaine, alterné à gauche puis à droite. */}
                  <div className={`relative lg:col-span-2 ${index % 2 ? 'lg:order-last' : ''}`}>
                    <SmartImage
                      image={domainCoverImage(domain)}
                      ratio="4/3"
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className="h-full lg:aspect-auto"
                      fallback={<BrandPanel className="h-full" />}
                    />
                    <span className="absolute left-6 top-6 flex h-14 w-14 items-center justify-center rounded-xl bg-marine text-gold shadow-lg">
                      <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                  </div>
                  <div className="space-y-6 p-6 sm:p-10 lg:col-span-3">
                  <div className="space-y-4">
                    <p className="font-poppins text-sm font-bold text-slate-text">Domaine {domain.letter}</p>
                    <h2 id={`${domain.slug}-title`} className="font-poppins text-2xl font-bold tracking-tight text-marine sm:text-3xl">
                      {domain.title}
                    </h2>
                    <p className="leading-relaxed text-slate-text">{domain.summary}</p>
                    {domain.availability === 'en_developpement' && <Badge tone="gold">Activité en développement</Badge>}
                  </div>
                  <div className="space-y-5">
                    <h3 className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-slate-text">Nos offres</h3>
                    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                      {domain.services.map((service) => (
                        <li key={service.slug}>
                          <Link
                            to={`/offres/${service.slug}`}
                            className="group flex h-full gap-3 rounded-lg bg-paper px-4 py-3.5 text-sm text-marine ring-1 ring-transparent transition hover:bg-white hover:ring-gold/50 focus-visible:outline-2 focus-visible:outline-gold"
                          >
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-gn-green" aria-hidden="true" />
                            <span className="flex-1">
                              {service.title}
                              {service.availability === 'en_developpement' && (
                                <span className="ml-2 text-xs text-slate-text">(en développement)</span>
                              )}
                            </span>
                            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 transition duration-500 ease-spring motion-safe:group-hover:translate-x-0.5 group-hover:text-gold-hover" aria-hidden="true" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        variant="dark"
                        to={`/offres?categorie=${domain.slug}`}
                        iconRight={<ArrowRight className="h-4 w-4 text-gold" aria-hidden="true" />}
                      >
                        Voir les offres {domain.shortTitle}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => openInquiry(`domain:${domain.slug}`)}
                        iconRight={<ArrowUpRight className="h-4 w-4" aria-hidden="true" />}
                      >
                        Demander des renseignements
                        <span className="sr-only"> — {domain.title}</span>
                      </Button>
                    </div>
                  </div>
                  </div>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </Section>
    </>
  );
}
