import { Reveal } from '../../components/ui/Reveal';
import type { LandProject } from '../../content/types';

const dateFormat = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** Étapes publiques du projet (frise verticale) ; rien n'est affiché sans jalon public. */
export function ProjectMilestones({ milestones }: { milestones: LandProject['milestones'] }) {
  if (milestones.length === 0) return null;
  return (
    <section className="space-y-4">
      <h2 className="font-poppins text-xl font-bold text-marine">Étapes du projet</h2>
      <ol className="relative space-y-6 border-l-2 border-gold/40 pl-6">
        {milestones.map((m, i) => (
          <Reveal as="li" variant="left" delay={i * 90} key={`${m.title}-${i}`} className="relative">
            <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-gold ring-1 ring-gold/60" aria-hidden="true" />
            {m.date && (
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-text">
                <time dateTime={m.date}>{dateFormat.format(new Date(`${m.date}T00:00:00Z`))}</time>
              </p>
            )}
            <h3 className="font-semibold text-marine">{m.title}</h3>
            {m.description && <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-text">{m.description}</p>}
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
