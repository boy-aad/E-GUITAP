import { Info } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
import {
  LAND_COMMITMENT,
  LAND_DISCLAIMER,
  LAND_PROJECTS,
  TOTAL_AREA_HA,
  formatHectares,
} from '../content/landProjects';
import { ProjectCard } from '../features/projects/ProjectCard';

export function ProjectsPage() {
  return (
    <>
      <Seo
        title="Nos projets"
        description="Les projets fonciers d'E-GUITAP en Guinée : Amaria – Ouassou, Tanènè – Kenendé, Bady et le site de Forécariah."
      />
      <PageHero eyebrow="Nos projets" title="Projets fonciers">
        <p>
          {LAND_PROJECTS.length} sites pour une superficie annoncée de {formatHectares(TOTAL_AREA_HA)}.{' '}
          {LAND_COMMITMENT}
        </p>
      </PageHero>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LAND_PROJECTS.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
        <p className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 text-xs leading-relaxed text-slate-text">
          <Info className="h-4 w-4 shrink-0 text-marine" aria-hidden="true" />
          {LAND_DISCLAIMER}
        </p>
      </div>
    </>
  );
}
