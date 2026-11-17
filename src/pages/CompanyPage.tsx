import { Eye, Globe2, Layers, MapPin, Target, type LucideIcon } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
import { stockImage } from '../content/stockPhotos';
import { Section } from '../components/ui/Section';
import { Reveal } from '../components/ui/Reveal';
import { Card } from '../components/ui/Card';
import { useSiteContent } from '../data/useSiteContent';
import { valueIcon } from '../features/company/valueIcons';

type Statement = { key: string; icon: LucideIcon; label: string; text: string };

export function CompanyPage() {
  const { company, domains } = useSiteContent();
  const { signatures } = company;
  const statements: Statement[] = [];
  if (company.mission) statements.push({ key: 'mission', icon: Target, label: 'Notre mission', text: company.mission });
  if (company.vision) statements.push({ key: 'vision', icon: Eye, label: 'Notre vision', text: company.vision });

  return (
    <>
      <Seo
        title="L'entreprise"
        description="E-GUITAP, Entreprise Guinéenne de Terrassement, d'Aménagement et de Prestations : présentation, mission, vision et valeurs."
      />
      <PageHero
        eyebrow="L'entreprise"
        title={company.brandName}
        crumbs={[{ label: "L'entreprise" }]}
        image={stockImage('pageEntreprise')}
      >
        <p>{company.fullName}</p>
      </PageHero>

      {/* Présentation éditoriale : chapeau, colonne de lecture et repères. */}
      <Section tone="paper" eyebrow="Présentation" title="Une entreprise guinéenne multisectorielle">
        <div className="grid gap-12 lg:grid-cols-3">
          <Reveal className="space-y-5 lg:col-span-2">
            {company.presentation.map((p, i) => (
              <p
                key={p}
                className={
                  i === 0
                    ? 'font-poppins text-xl font-medium leading-relaxed text-marine sm:text-2xl'
                    : 'max-w-[65ch] text-base leading-relaxed text-slate-text sm:text-lg'
                }
              >
                {p}
              </p>
            ))}
          </Reveal>
          <Reveal delay={120}>
            <Card as="aside" className="space-y-5 p-7">
              <h2 className="font-poppins text-base font-bold text-marine">En bref</h2>
              <dl className="space-y-5 text-sm">
                <div>
                  <dt className="flex items-center gap-2 font-semibold text-marine">
                    <MapPin className="h-4 w-4 text-gold-hover" aria-hidden="true" />
                    Siège et zone d'intervention principale
                  </dt>
                  <dd className="mt-1 text-slate-text">
                    {company.headOffice}, {company.country}
                  </dd>
                </div>
                {domains.length > 0 && (
                  <div>
                    <dt className="flex items-center gap-2 font-semibold text-marine">
                      <Layers className="h-4 w-4 text-gold-hover" aria-hidden="true" />
                      Secteurs
                    </dt>
                    <dd className="mt-1 text-slate-text">{domains.map((d) => d.title).join(' · ')}</dd>
                  </div>
                )}
              </dl>
            </Card>
          </Reveal>
        </div>
      </Section>

      {/* Mission et vision, en deux colonnes illustrées. */}
      {statements.length > 0 && (
        <Section tone="marine" compact>
          <div className={`grid gap-6 ${statements.length > 1 ? 'md:grid-cols-2' : ''}`}>
            {statements.map((s, i) => (
              <Reveal key={s.key} delay={i * 120} className="h-full">
                <div className="h-full space-y-5 rounded-xl border border-white/10 bg-marine-light/40 p-8 lg:p-10">
                  <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-gold text-marine">
                    <s.icon className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  <h2 className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-gold">{s.label}</h2>
                  <p className="text-lg leading-relaxed text-white/90 lg:text-xl">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Section>
      )}

      {/* Valeurs en grille iconographiée. */}
      {company.values.length > 0 && (
        <Section tone="white" eyebrow="Nos valeurs" title="Ce qui guide notre action">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {company.values.map((value, i) => {
              const Icon = valueIcon(value);
              return (
                <Reveal as="li" key={value} delay={(i % 4) * 60}>
                  <Card interactive className="flex h-full flex-col gap-4 p-6">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ivory text-marine transition-colors group-hover:bg-gold">
                      <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
                    </span>
                    <p className="font-poppins text-lg font-semibold text-marine">{value}</p>
                  </Card>
                </Reveal>
              );
            })}
          </ul>
        </Section>
      )}

      {/* Ambition et signatures. */}
      {(company.ambition || signatures.brand || signatures.institutional || signatures.sectoral) && (
        <Section tone="ivory" compact>
          <Reveal className="mx-auto max-w-3xl space-y-8 text-center">
            {company.ambition && (
              <div className="space-y-4">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-marine text-gold">
                  <Globe2 className="h-6 w-6" aria-hidden="true" />
                </span>
                <h2 className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-slate-text">Notre ambition</h2>
                <p className="font-poppins text-2xl font-semibold leading-snug text-marine sm:text-3xl">{company.ambition}</p>
              </div>
            )}
            {(signatures.institutional || signatures.sectoral) && (
              <div className="space-y-2 border-t border-gold/40 pt-8 text-slate-text">
                {signatures.institutional && <p>{signatures.institutional}</p>}
                {signatures.sectoral && <p className="text-sm uppercase tracking-[0.12em]">{signatures.sectoral}</p>}
              </div>
            )}
            {signatures.brand && <p className="font-lora text-2xl italic text-marine sm:text-3xl">{signatures.brand}</p>}
          </Reveal>
        </Section>
      )}
    </>
  );
}
