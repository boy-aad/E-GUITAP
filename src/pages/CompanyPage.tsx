import { Globe2, MapPin } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { Eyebrow } from '../components/ui/Eyebrow';
import { PageHero } from '../components/ui/PageHero';
import { useSiteContent } from '../data/useSiteContent';

export function CompanyPage() {
  const { company, domains } = useSiteContent();
  return (
    <>
      <Seo
        title="L'entreprise"
        description="E-GUITAP, Entreprise Guinéenne de Terrassement, d'Aménagement et de Prestations : présentation, mission, vision et valeurs."
      />
      <PageHero eyebrow="L'entreprise" title={company.brandName}>
        <p>{company.fullName}</p>
      </PageHero>

      {/* Présentation */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="space-y-5 lg:col-span-2">
            <Eyebrow>Présentation</Eyebrow>
            <h2 className="font-poppins text-2xl font-bold text-marine sm:text-3xl">
              Une entreprise guinéenne multisectorielle
            </h2>
            {company.presentation.map((p) => (
              <p key={p} className="leading-relaxed text-slate-text">
                {p}
              </p>
            ))}
          </div>
          <aside className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="font-poppins text-base font-bold text-marine">En bref</h2>
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="flex items-center gap-2 font-semibold text-marine">
                  <MapPin className="h-4 w-4 text-gold-hover" aria-hidden="true" />
                  Siège et zone d'intervention principale
                </dt>
                <dd className="mt-1 text-slate-text">
                  {company.headOffice}, {company.country}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 font-semibold text-marine">
                  <Globe2 className="h-4 w-4 text-gold-hover" aria-hidden="true" />
                  Ambition
                </dt>
                <dd className="mt-1 text-slate-text">{company.ambition}</dd>
              </div>
              <div>
                <dt className="font-semibold text-marine">Secteurs</dt>
                <dd className="mt-1 text-slate-text">{domains.map((d) => d.title).join(' · ')}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      {/* Mission et vision */}
      <section className="bg-marine py-16 text-white lg:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
          <div className="space-y-3 border-l-2 border-gold pl-6">
            <Eyebrow tone="dark">Notre mission</Eyebrow>
            <p className="text-lg leading-relaxed text-white/90">{company.mission}</p>
          </div>
          <div className="space-y-3 border-l-2 border-gold pl-6">
            <Eyebrow tone="dark">Notre vision</Eyebrow>
            <p className="text-lg leading-relaxed text-white/90">{company.vision}</p>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section className="py-16 lg:py-20">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <Eyebrow>Nos valeurs</Eyebrow>
            <h2 className="font-poppins text-2xl font-bold text-marine sm:text-3xl">Ce qui guide notre action</h2>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {company.values.map((value, i) => (
              <li key={value} className="rounded-lg border border-slate-200 bg-white p-5">
                <span className="font-poppins text-2xl font-bold text-gold">{String(i + 1).padStart(2, '0')}</span>
                <p className="mt-2 font-poppins font-semibold text-marine">{value}</p>
              </li>
            ))}
          </ol>
          <p className="pt-4 text-center font-lora text-xl italic text-marine">{company.signatures.brand}</p>
        </div>
      </section>
    </>
  );
}
