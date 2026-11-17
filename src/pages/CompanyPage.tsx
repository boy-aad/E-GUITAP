import { Globe2, Layers, MapPin } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
import { Section } from '../components/ui/Section';
import { Reveal } from '../components/ui/Reveal';
import { Card } from '../components/ui/Card';
import { useSiteContent } from '../data/useSiteContent';

export function CompanyPage() {
  const { company, domains } = useSiteContent();
  return (
    <>
      <Seo
        title="L'entreprise"
        description="E-GUITAP, Entreprise Guinéenne de Terrassement, d'Aménagement et de Prestations : présentation, mission, vision et valeurs."
      />
      <PageHero eyebrow="L'entreprise" title={company.brandName} crumbs={[{ label: "L'entreprise" }]}>
        <p>{company.fullName}</p>
      </PageHero>

      {/* Présentation */}
      <Section tone="paper" eyebrow="Présentation" title="Une entreprise guinéenne multisectorielle">
        <div className="grid gap-12 lg:grid-cols-3">
          <Reveal className="space-y-5 lg:col-span-2">
            {company.presentation.map((p) => (
              <p key={p} className="text-base leading-relaxed text-slate-text sm:text-lg">
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
                {company.ambition && (
                  <div>
                    <dt className="flex items-center gap-2 font-semibold text-marine">
                      <Globe2 className="h-4 w-4 text-gold-hover" aria-hidden="true" />
                      Ambition
                    </dt>
                    <dd className="mt-1 text-slate-text">{company.ambition}</dd>
                  </div>
                )}
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

      {/* Mission et vision */}
      {(company.mission || company.vision) && (
        <Section tone="marine" compact>
          <div className="grid gap-12 md:grid-cols-2">
            {company.mission && (
              <Reveal className="space-y-4 border-l-2 border-gold pl-6">
                <h2 className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-gold">Notre mission</h2>
                <p className="text-lg leading-relaxed text-white/90 lg:text-xl">{company.mission}</p>
              </Reveal>
            )}
            {company.vision && (
              <Reveal delay={120} className="space-y-4 border-l-2 border-gold pl-6">
                <h2 className="font-inter text-xs font-semibold uppercase tracking-[0.15em] text-gold">Notre vision</h2>
                <p className="text-lg leading-relaxed text-white/90 lg:text-xl">{company.vision}</p>
              </Reveal>
            )}
          </div>
        </Section>
      )}

      {/* Valeurs */}
      {company.values.length > 0 && (
        <Section tone="white" eyebrow="Nos valeurs" title="Ce qui guide notre action">
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {company.values.map((value, i) => (
              <Reveal as="li" key={value} delay={i * 60}>
                <Card interactive className="h-full p-6">
                  <span className="font-poppins text-3xl font-bold text-gold">{String(i + 1).padStart(2, '0')}</span>
                  <p className="mt-3 font-poppins text-lg font-semibold text-marine">{value}</p>
                </Card>
              </Reveal>
            ))}
          </ol>
          {company.signatures.brand && (
            <p className="pt-14 text-center font-lora text-xl italic text-marine sm:text-2xl">{company.signatures.brand}</p>
          )}
        </Section>
      )}
    </>
  );
}
