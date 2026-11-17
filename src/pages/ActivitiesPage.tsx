import { ArrowUpRight, Check } from 'lucide-react';
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
          {domains.map((domain) => {
            const Icon = DOMAIN_ICONS[domain.slug] ?? DEFAULT_DOMAIN_ICON;
            return (
              <Reveal key={domain.slug}>
                <Card
                  as="section"
                  id={domain.slug}
                  aria-labelledby={`${domain.slug}-title`}
                  className="grid scroll-mt-28 gap-8 p-6 sm:p-10 lg:grid-cols-3"
                >
                  <div className="space-y-4">
                    <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-marine text-gold">
                      <Icon className="h-8 w-8" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <p className="font-poppins text-sm font-bold text-slate-text">Domaine {domain.letter}</p>
                    <h2 id={`${domain.slug}-title`} className="font-poppins text-2xl font-bold tracking-tight text-marine sm:text-3xl">
                      {domain.title}
                    </h2>
                    <p className="leading-relaxed text-slate-text">{domain.summary}</p>
                    {domain.availability === 'en_developpement' && <Badge tone="gold">Activité en développement</Badge>}
                  </div>
                  <div className="space-y-5 lg:col-span-2">
                    <h3 className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-slate-text">Prestations</h3>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {domain.services.map((service) => (
                        <li key={service.title} className="flex gap-3 rounded-lg bg-paper px-4 py-3.5 text-sm text-marine">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-gn-green" aria-hidden="true" />
                          <span>
                            {service.title}
                            {service.availability === 'en_developpement' && (
                              <span className="ml-2 text-xs text-slate-text">(en développement)</span>
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant="dark"
                      onClick={() => openInquiry(`domain:${domain.slug}`)}
                      iconRight={<ArrowUpRight className="h-4 w-4 text-gold" aria-hidden="true" />}
                    >
                      Demander des renseignements
                      <span className="sr-only"> — {domain.title}</span>
                    </Button>
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
