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
    { label: "domaines d'activité", value: <CountUp value={domains.length} /> },
    ...(projects.length > 0
      ? [
          { label: 'projets fonciers', value: <CountUp value={projects.length} /> },
          { label: 'de superficie annoncée', value: <CountUp value={totalHa} format={formatHectares} /> },
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
              className={`flex flex-col-reverse gap-1.5 px-4 py-6 text-center sm:px-6 sm:py-8 ${
                i % 2 === 1 ? 'border-l border-slate-200' : ''
              } ${i >= 2 ? 'border-t border-slate-200 lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
            >
              <dt className="text-xs text-slate-text sm:text-sm">{fact.label}</dt>
              <dd className="font-poppins text-xl font-bold text-marine sm:text-3xl">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
