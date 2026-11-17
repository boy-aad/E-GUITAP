import { Info } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
import { stockImage } from '../content/stockPhotos';
import { LAND_DISCLAIMER, formatHectares, totalAreaHa } from '../content/landProjects';
import { useSiteContent } from '../data/useSiteContent';
import { ProjectCard } from '../features/projects/ProjectCard';
import { Section } from '../components/ui/Section';
import { Reveal } from '../components/ui/Reveal';
import { EmptyState } from '../components/ui/Navigation';
import { Button } from '../components/ui/Button';
import { useProjectFilters } from '../features/projects/ProjectFilters';

export function ProjectsPage() {
  const { projects, blocks } = useSiteContent();
  const { filtered, filters, reset } = useProjectFilters(projects);
  return (
    <>
      <Seo
        title="Nos projets"
        description="Les projets fonciers d'E-GUITAP en Guinée : localisation, superficie annoncée et potentiel de développement de chaque site."
      />
      <PageHero
        eyebrow="Nos projets"
        title="Projets fonciers"
        crumbs={[{ label: 'Nos projets' }]}
        image={stockImage('pageProjets')}
      >
        <p>
          {projects.length} site{projects.length > 1 ? 's' : ''} pour une superficie annoncée de {formatHectares(totalAreaHa(projects))}.{' '}
          {blocks['projects.intro']?.body}
        </p>
      </PageHero>

      <Section tone="paper" compact>
        {filters && <div className="mb-8 space-y-3">{filters}</div>}
        {filtered.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((project, i) => (
              <Reveal key={project.slug} delay={i * 80} className="h-full">
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Info className="h-5 w-5" aria-hidden="true" />}
            title={projects.length ? 'Aucun projet ne correspond à ces filtres' : 'Aucun projet publié pour le moment'}
            action={
              projects.length > 0 ? (
                <Button variant="secondary" onClick={reset}>
                  Réinitialiser les filtres
                </Button>
              ) : undefined
            }
          />
        )}
        <p className="mt-8 flex gap-3 rounded-xl border border-slate-200 bg-white p-5 text-xs leading-relaxed text-slate-text">
          <Info className="h-4 w-4 shrink-0 text-marine" aria-hidden="true" />
          {LAND_DISCLAIMER}
        </p>
      </Section>
    </>
  );
}
