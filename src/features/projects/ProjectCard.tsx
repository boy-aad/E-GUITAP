import { Link } from 'react-router';
import { ArrowRight, MapPin } from 'lucide-react';
import { BrandPanel } from '../../components/brand/Skyline';
import { DEVELOPMENT_STATUS_LABELS, formatHectares } from '../../content/landProjects';
import type { LandProject } from '../../content/types';

export function ProjectCard({ project }: { project: LandProject }) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <div className="relative">
        {/* Aucune photo réelle pour l'instant : visuel neutre aux couleurs de la charte. */}
        <BrandPanel className="h-40" />
        <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
          <span className="ml-auto rounded bg-white/95 px-2.5 py-1 font-poppins text-sm font-bold text-marine">
            {formatHectares(project.areaHa)}
            <span className="sr-only"> annoncés</span>
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          <h3 className="font-poppins text-lg font-bold text-marine">
            <Link to={`/projets/${project.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
              {project.name}
            </Link>
          </h3>
          {project.prefecture && (
            <p className="flex items-center gap-1.5 text-xs text-slate-text">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {project.prefecture}
            </p>
          )}
        </div>
        <p className="text-sm leading-relaxed text-slate-text">{project.summary}</p>
        {project.developmentStatus && (
          <p className="w-fit rounded border border-gold/40 bg-ivory px-2 py-0.5 text-[11px] font-semibold text-marine">
            {DEVELOPMENT_STATUS_LABELS[project.developmentStatus]}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 font-poppins text-xs font-bold uppercase tracking-wider text-marine group-hover:text-gold-hover">
          Voir le projet
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
      </div>
    </article>
  );
}
