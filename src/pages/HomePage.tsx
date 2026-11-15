import { Link } from 'react-router';
import { ArrowRight, ArrowUpRight, MessageSquare } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { SmartLink } from '../components/ui/SmartLink';
import { Eyebrow } from '../components/ui/Eyebrow';
import { BrandPanel, Skyline, TricolorBand } from '../components/brand/Skyline';
import { LAND_DISCLAIMER, formatHectares, totalAreaHa } from '../content/landProjects';
import { useSiteContent } from '../data/useSiteContent';
import { DOMAIN_ICONS, DEFAULT_DOMAIN_ICON } from '../features/activities/domainIcons';
import { ProjectCard } from '../features/projects/ProjectCard';
import { useInquiry } from '../features/inquiry/InquiryContext';
import { DEFAULT_WHATSAPP_MESSAGE, whatsappUrl } from '../lib/contact';

export function HomePage() {
  const { company, contacts, domains, projects, hero, blocks } = useSiteContent();
  const { openInquiry } = useInquiry();
  const totalHa = totalAreaHa(projects);

  const keyFacts = [
    { value: String(domains.length), label: "domaines d'activité" },
    { value: String(projects.length), label: 'projets fonciers' },
    { value: formatHectares(totalHa), label: 'de superficie annoncée' },
    { value: company.headOffice, label: 'siège et zone principale' },
  ];

  return (
    <>
      <Seo
        title="E-GUITAP"
        description="E-GUITAP, entreprise guinéenne multisectorielle basée à Dubréka et Conakry : BTP, immobilier et aménagement foncier, commerce général, import-export, et projets fonciers."
      />

      {/* Hero : contenu géré dans l'administration (table hero_slides). */}
      <section className="relative overflow-hidden bg-marine text-white">
        <Skyline className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-marine-light/70 sm:h-36" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-24">
          <div className="max-w-3xl space-y-6">
            {hero?.eyebrow && <Eyebrow tone="dark">{hero.eyebrow}</Eyebrow>}
            <h1 className="font-poppins text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
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
            {(hero?.subtitle ?? company.signatures.institutional) && (
              <p className="max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
                {hero?.subtitle ?? company.signatures.institutional}
              </p>
            )}
            {(hero?.showSignature ?? true) && company.signatures.brand && (
              <p className="font-lora text-lg italic text-gold sm:text-xl">{company.signatures.brand}</p>
            )}
            {(hero?.primaryCta || hero?.secondaryCta) && (
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                {hero.primaryCta && (
                  <SmartLink
                    href={hero.primaryCta.href}
                    className="inline-flex items-center justify-center gap-2 rounded bg-gold px-6 py-3.5 font-poppins text-xs font-bold uppercase tracking-wider text-marine transition-colors hover:bg-gold-light"
                  >
                    {hero.primaryCta.label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </SmartLink>
                )}
                {hero.secondaryCta && (
                  <SmartLink
                    href={hero.secondaryCta.href}
                    className="inline-flex items-center justify-center gap-2 rounded border border-white/40 px-6 py-3.5 font-poppins text-xs font-bold uppercase tracking-wider text-white transition-colors hover:border-gold hover:text-gold"
                  >
                    {hero.secondaryCta.label}
                  </SmartLink>
                )}
              </div>
            )}
          </div>
        </div>
        <TricolorBand className="relative h-1" />
      </section>

      {/* Repères */}
      <section aria-label="Repères" className="border-b border-slate-200 bg-white">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-slate-200 lg:grid-cols-4">
          {keyFacts.map((fact) => (
            <div key={fact.label} className="flex flex-col-reverse gap-1 bg-white px-4 py-6 text-center sm:px-6">
              <dt className="text-xs text-slate-text">{fact.label}</dt>
              <dd className="font-poppins text-lg font-bold text-marine sm:text-2xl">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Présentation */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <div className="space-y-5">
            <Eyebrow>L'entreprise</Eyebrow>
            <h2 className="font-poppins text-2xl font-bold leading-snug text-marine sm:text-3xl">
              {blocks['home.presentation']?.title ?? company.fullName}
            </h2>
            {blocks['home.presentation']?.body ? (
              <p className="whitespace-pre-line leading-relaxed text-slate-text">{blocks['home.presentation'].body}</p>
            ) : (
              company.presentation.slice(0, 2).map((p) => (
                <p key={p} className="leading-relaxed text-slate-text">
                  {p}
                </p>
              ))
            )}
            <Link
              to="/entreprise"
              className="inline-flex items-center gap-2 font-poppins text-xs font-bold uppercase tracking-wider text-marine hover:text-gold-hover"
            >
              Découvrir l'entreprise
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <BrandPanel className="h-64 rounded-lg sm:h-80" label={company.headOffice} />
        </div>
      </section>

      {/* Domaines d'activité */}
      {domains.length > 0 && (
        <section className="border-y border-slate-200 bg-white py-16 lg:py-24">
          <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl space-y-3">
              <Eyebrow>Nos activités</Eyebrow>
              <h2 className="font-poppins text-2xl font-bold text-marine sm:text-3xl">Nos domaines d'activité</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {domains.map((domain) => {
                const Icon = DOMAIN_ICONS[domain.slug] ?? DEFAULT_DOMAIN_ICON;
                return (
                  <article key={domain.slug} className="flex flex-col rounded-lg border border-slate-200 bg-paper p-6">
                    <div className="mb-4 flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded bg-marine text-gold">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <span className="font-poppins text-2xl font-bold text-slate-300" aria-hidden="true">
                        {domain.letter}
                      </span>
                    </div>
                    <h3 className="font-poppins text-lg font-bold text-marine">{domain.title}</h3>
                    <ul className="mt-3 flex-1 space-y-1.5 text-sm text-slate-text">
                      {domain.services.slice(0, 3).map((s) => (
                        <li key={s.title} className="flex gap-2">
                          <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                          {s.title}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/activites#${domain.slug}`}
                      className="mt-5 inline-flex items-center gap-1.5 font-poppins text-xs font-bold uppercase tracking-wider text-marine hover:text-gold-hover"
                    >
                      Toutes les prestations
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="sr-only"> — {domain.title}</span>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Projets fonciers */}
      {projects.length > 0 && (
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div className="max-w-2xl space-y-3">
                <Eyebrow>Nos projets fonciers</Eyebrow>
                <h2 className="font-poppins text-2xl font-bold text-marine sm:text-3xl">
                  {projects.length} site{projects.length > 1 ? 's' : ''}, {formatHectares(totalHa)} annoncés
                </h2>
                {blocks['projects.intro']?.body && (
                  <p className="leading-relaxed text-slate-text">{blocks['projects.intro'].body}</p>
                )}
              </div>
              <Link
                to="/projets"
                className="inline-flex shrink-0 items-center gap-2 font-poppins text-xs font-bold uppercase tracking-wider text-marine hover:text-gold-hover"
              >
                Tous les projets
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {projects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
            <p className="text-xs leading-relaxed text-slate-text">{LAND_DISCLAIMER}</p>
          </div>
        </section>
      )}

      {/* Mission, vision, valeurs */}
      {(company.mission || company.vision || company.values.length > 0) && (
        <section className="bg-marine py-16 text-white lg:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="space-y-8">
              {company.mission && (
                <div className="space-y-3">
                  <Eyebrow tone="dark">Mission</Eyebrow>
                  <p className="text-lg leading-relaxed text-white/90">{company.mission}</p>
                </div>
              )}
              {company.vision && (
                <div className="space-y-3">
                  <Eyebrow tone="dark">Vision</Eyebrow>
                  <p className="text-lg leading-relaxed text-white/90">{company.vision}</p>
                </div>
              )}
            </div>
            {company.values.length > 0 && (
              <div className="space-y-4">
                <Eyebrow tone="dark">Nos valeurs</Eyebrow>
                <ol className="grid gap-2 sm:grid-cols-2">
                  {company.values.map((value, i) => (
                    <li key={value} className="flex items-center gap-3 rounded border border-marine-light bg-marine-light/40 px-4 py-3">
                      <span className="font-poppins text-sm font-bold text-gold">{String(i + 1).padStart(2, '0')}</span>
                      <span className="text-sm font-semibold">{value}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Appel à l'action */}
      <section className="bg-ivory py-16 lg:py-20">
        <div className="mx-auto max-w-3xl space-y-6 px-4 text-center sm:px-6">
          <h2 className="font-poppins text-2xl font-bold text-marine sm:text-3xl">
            {blocks['home.cta']?.title ?? 'Un projet, une question ?'}
          </h2>
          {blocks['home.cta']?.body && <p className="leading-relaxed text-slate-text">{blocks['home.cta'].body}</p>}
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => openInquiry()}
              className="inline-flex items-center justify-center gap-2 rounded bg-marine px-6 py-3.5 font-poppins text-xs font-bold uppercase tracking-wider text-white hover:bg-marine-dark"
            >
              Demande de renseignements
              <ArrowUpRight className="h-4 w-4 text-gold" aria-hidden="true" />
            </button>
            {contacts.whatsapp && (
              <a
                href={whatsappUrl(contacts.whatsapp.raw, DEFAULT_WHATSAPP_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded bg-gn-green px-6 py-3.5 font-poppins text-xs font-bold uppercase tracking-wider text-white hover:bg-gn-green-hover"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
