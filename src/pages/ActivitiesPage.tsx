import { ArrowUpRight, Check } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
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
      <PageHero eyebrow="Nos activités" title="Nos domaines d'activité">
        <p>
          E-GUITAP intervient dans le BTP, l'immobilier et l'aménagement foncier, le commerce général et
          l'import-export, depuis Dubréka et Conakry.
        </p>
      </PageHero>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        {domains.map((domain) => {
          const Icon = DOMAIN_ICONS[domain.slug] ?? DEFAULT_DOMAIN_ICON;
          return (
            <section
              key={domain.slug}
              id={domain.slug}
              aria-labelledby={`${domain.slug}-title`}
              className="scroll-mt-28 grid gap-8 rounded-lg border border-slate-200 bg-white p-6 sm:p-8 lg:grid-cols-3"
            >
              <div className="space-y-4">
                <span className="flex h-14 w-14 items-center justify-center rounded bg-marine text-gold">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <p className="font-poppins text-sm font-bold text-slate-text">Domaine {domain.letter}</p>
                <h2 id={`${domain.slug}-title`} className="font-poppins text-2xl font-bold text-marine">
                  {domain.title}
                </h2>
                <p className="leading-relaxed text-slate-text">{domain.summary}</p>
                {domain.availability === 'en_developpement' && (
                  <p className="w-fit rounded border border-gold/40 bg-ivory px-2 py-0.5 text-xs font-semibold text-marine">
                    Activité en développement
                  </p>
                )}
              </div>
              <div className="space-y-5 lg:col-span-2">
                <h3 className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-slate-text">
                  Prestations
                </h3>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {domain.services.map((service) => (
                    <li key={service.title} className="flex gap-3 rounded bg-paper px-4 py-3 text-sm text-marine">
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
                <button
                  type="button"
                  onClick={() => openInquiry(`domain:${domain.slug}`)}
                  className="inline-flex items-center gap-2 rounded bg-marine px-5 py-3 font-poppins text-xs font-bold uppercase tracking-wider text-white hover:bg-marine-dark"
                >
                  Demander des renseignements
                  <ArrowUpRight className="h-4 w-4 text-gold" aria-hidden="true" />
                  <span className="sr-only"> — {domain.title}</span>
                </button>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
