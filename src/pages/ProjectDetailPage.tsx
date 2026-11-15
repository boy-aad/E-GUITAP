import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowUpRight, Info, MapPin, Ruler } from 'lucide-react';
import { Seo } from '../components/ui/Seo';
import { PageHero } from '../components/ui/PageHero';
import { BrandPanel } from '../components/brand/Skyline';
import {
  COMMERCIAL_STATUS_LABELS,
  DEVELOPMENT_STATUS_LABELS,
  LAND_COMMITMENT,
  LAND_DISCLAIMER,
  LAND_PROJECTS,
  findLandProject,
  formatHectares,
} from '../content/landProjects';
import { ProjectCard } from '../features/projects/ProjectCard';
import { useInquiry } from '../features/inquiry/InquiryContext';
import { NotFoundPage } from './NotFoundPage';

export function ProjectDetailPage() {
  const { slug } = useParams();
  const { openInquiry } = useInquiry();
  const project = findLandProject(slug);

  if (!project) return <NotFoundPage />;

  const others = LAND_PROJECTS.filter((p) => p.slug !== project.slug);

  return (
    <>
      <Seo
        title={project.name}
        description={`${project.name} — projet foncier E-GUITAP, superficie annoncée de ${formatHectares(project.areaHa)}. ${project.summary}`}
      />
      <PageHero eyebrow="Projet foncier" title={project.name}>
        <p>{project.summary}</p>
      </PageHero>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <Link
          to="/projets"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-marine hover:text-gold-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Tous les projets
        </Link>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <BrandPanel className="h-56 rounded-lg sm:h-72" />
            <section className="space-y-3">
              <h2 className="font-poppins text-xl font-bold text-marine">Présentation</h2>
              <p className="leading-relaxed text-slate-text">{project.description}</p>
              <p className="leading-relaxed text-slate-text">{LAND_COMMITMENT}</p>
            </section>
            <section className="space-y-3">
              <h2 className="font-poppins text-xl font-bold text-marine">Potentiel de développement</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {project.objectives.map((o) => (
                  <li key={o} className="flex gap-3 rounded bg-white px-4 py-3 text-sm text-marine ring-1 ring-slate-200">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                    {o}
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="space-y-4 self-start lg:sticky lg:top-28">
            <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
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
              <button
                type="button"
                onClick={() => openInquiry(`project:${project.slug}`)}
                className="flex w-full items-center justify-center gap-2 rounded bg-marine px-5 py-3 font-poppins text-xs font-bold uppercase tracking-wider text-white hover:bg-marine-dark"
              >
                Demander des renseignements
                <ArrowUpRight className="h-4 w-4 text-gold" aria-hidden="true" />
              </button>
            </div>
            <p className="flex gap-3 rounded-lg bg-ivory p-4 text-xs leading-relaxed text-slate-text">
              <Info className="h-4 w-4 shrink-0 text-marine" aria-hidden="true" />
              {LAND_DISCLAIMER}
            </p>
          </aside>
        </div>

        <section className="mt-16 space-y-6 border-t border-slate-200 pt-12">
          <h2 className="font-poppins text-xl font-bold text-marine">Autres projets</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <ProjectCard key={p.slug} project={p} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
