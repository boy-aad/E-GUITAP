import { useParams } from 'react-router';
import { ArrowUpRight, Info, MapPin, Ruler } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Container } from '../components/ui/Section';
import { Reveal } from '../components/ui/Reveal';
import {
  COMMERCIAL_STATUS_LABELS,
  DEVELOPMENT_STATUS_LABELS,
  LAND_DISCLAIMER,
  formatHectares,
} from '../content/landProjects';
import { ProjectCard } from '../features/projects/ProjectCard';
import { ProjectGallery } from '../features/projects/ProjectGallery';
import { ProjectMilestones } from '../features/projects/ProjectMilestones';
import { projectPhotos } from '../content/projectImages';
import { useInquiry } from '../features/inquiry/InquiryContext';
import { NotFoundPage } from './NotFoundPage';
import { useSiteContent } from '../data/useSiteContent';

export function ProjectDetailPage() {
  const { slug } = useParams();
  const { openInquiry } = useInquiry();
  const { projects, blocks } = useSiteContent();
  const project = projects.find((p) => p.slug === slug);

  if (!project) return <NotFoundPage />;

  const others = projects.filter((p) => p.slug !== project.slug);

  return (
    <>
      <Seo
        title={project.name}
        description={`${project.name} — projet foncier E-GUITAP, superficie annoncée de ${formatHectares(project.areaHa)}. ${project.summary}`}
        image={projectPhotos(project)[0]?.src}
      />
      <PageHero
        eyebrow="Projet foncier"
        title={project.name}
        crumbs={[{ label: 'Nos projets', to: '/projets' }, { label: project.name }]}
      >
        <p>{project.summary}</p>
      </PageHero>

      <Container className="py-14 lg:py-20">

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <ProjectGallery project={project} />
            <section className="space-y-3">
              <h2 className="font-poppins text-xl font-bold text-marine">Présentation</h2>
              <p className="leading-relaxed text-slate-text">{project.description}</p>
              {blocks['projects.intro']?.body && (
                <p className="leading-relaxed text-slate-text">{blocks['projects.intro'].body}</p>
              )}
            </section>
            <section className="space-y-3">
              <h2 className="font-poppins text-xl font-bold text-marine">Potentiel de développement</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {project.objectives.map((o) => (
                  <li key={o} className="flex gap-3 rounded-lg bg-white px-4 py-3.5 text-sm text-marine ring-1 ring-slate-200">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                    {o}
                  </li>
                ))}
              </ul>
            </section>
            <ProjectMilestones milestones={project.milestones} />
          </div>

          <aside className="space-y-4 self-start lg:sticky lg:top-28">
            <Card className="space-y-5 p-7">
              <h2 className="font-poppins text-base font-bold text-marine">Informations</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-gold-hover" aria-hidden="true" />
                  <div>
                    <dt className="font-semibold text-marine">Superficie annoncée</dt>
                    <dd className="text-slate-text">Environ {formatHectares(project.areaHa)}</dd>
                  </div>
                </div>
                {project.prefecture && (
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-hover" aria-hidden="true" />
                    <div>
                      <dt className="font-semibold text-marine">Localisation</dt>
                      <dd className="text-slate-text">{project.prefecture}</dd>
                    </div>
                  </div>
                )}
                {project.developmentStatus && (
                  <div>
                    <dt className="font-semibold text-marine">État d'avancement</dt>
                    <dd className="text-slate-text">{DEVELOPMENT_STATUS_LABELS[project.developmentStatus]}</dd>
                  </div>
                )}
                {project.commercialStatus && (
                  <div>
                    <dt className="font-semibold text-marine">Commercialisation</dt>
                    <dd className="text-slate-text">{COMMERCIAL_STATUS_LABELS[project.commercialStatus]}</dd>
                  </div>
                )}
              </dl>
              <Button
                variant="dark"
                fullWidth
                onClick={() => openInquiry(`project:${project.slug}`)}
                iconRight={<ArrowUpRight className="h-4 w-4 text-gold" aria-hidden="true" />}
              >
                Demander des renseignements
              </Button>
            </Card>
            <p className="flex gap-3 rounded-xl bg-ivory p-4 text-xs leading-relaxed text-slate-text">
              <Info className="h-4 w-4 shrink-0 text-marine" aria-hidden="true" />
              {LAND_DISCLAIMER}
            </p>
          </aside>
        </div>

        {others.length > 0 && (
          <section className="mt-20 space-y-8 border-t border-slate-200 pt-14">
            <h2 className="font-poppins text-2xl font-bold tracking-tight text-marine sm:text-3xl">Autres projets</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {others.map((p, i) => (
                <Reveal key={p.slug} delay={i * 80} className="h-full">
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
