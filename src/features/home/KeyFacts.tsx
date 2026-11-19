import type { ReactNode } from 'react';
import { CountUp } from '../../components/ui/CountUp';
import { Container } from '../../components/ui/Section';
import { formatHectares, totalAreaHa } from '../../content/landProjects';
import { useSiteContent } from '../../data/useSiteContent';

/** Chiffres clés, calculés uniquement depuis la base ; la carte chevauche le hero. */
export function KeyFacts() {
  const { company, domains, projects } = useSiteContent();
  const totalHa = totalAreaHa(projects);

  const facts: { label: string; value: ReactNode }[] = [
    // Départs décalés : les compteurs démarrent l'un après l'autre, après l'apparition de la carte.
    { label: "domaines d'activité", value: <CountUp value={domains.length} delayMs={300} /> },
    ...(projects.length > 0
      ? [
          { label: 'projets fonciers', value: <CountUp value={projects.length} delayMs={450} /> },
          { label: 'de superficie annoncée', value: <CountUp value={totalHa} format={formatHectares} delayMs={600} /> },
        ]
      : []),
    { label: 'siège et zone principale', value: company.headOffice },
  ];

  return (
    <section id="chiffres-cles" aria-label="Chiffres clés" className="relative z-10 -mt-14 scroll-mt-24 sm:-mt-16">
      <Container>
        <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_30px_60px_-30px_rgba(16,44,80,0.45)] lg:grid-cols-4">
          {facts.map((fact, i) => (
            <div
              key={fact.label}
              className={`flex flex-col-reverse justify-center gap-1 px-3 py-4 text-center sm:px-5 sm:py-5 ${
                i % 2 === 1 ? 'border-l border-slate-200' : ''
              } ${i >= 2 ? 'border-t border-slate-200 lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
            >
              <dt className="text-xs text-slate-text sm:text-sm">{fact.label}</dt>
              <dd className="font-poppins text-lg font-bold leading-tight text-marine sm:text-2xl">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
