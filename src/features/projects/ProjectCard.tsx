import { Link } from 'react-router';
import { ArrowRight, MapPin } from 'lucide-react';
import { BrandPanel } from '../../components/brand/Skyline';
import { Badge, Card } from '../../components/ui/Card';
import { SmartImage } from '../../components/ui/SmartImage';
import { DEVELOPMENT_STATUS_LABELS, formatHectares } from '../../content/landProjects';
import type { LandProject } from '../../content/types';
import { projectCover } from '../../content/projectImages';

export function ProjectCard({ project }: { project: LandProject }) {
  return (
    <Card as="article" interactive className="flex h-full flex-col">
      <div className="relative">
        {/* Photo réelle du site, sinon illustration du projet, sinon visuel neutre de la charte. */}
        <SmartImage
          image={projectCover(project)}
          ratio="16/9"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          noticePosition="top-left"
          imgClassName="transition-transform duration-700 ease-spring motion-safe:group-hover:scale-105"
          fallback={<BrandPanel className="h-full" />}
        />
        <Badge tone="light" className="absolute right-4 top-4 font-poppins text-sm">
          {formatHectares(project.areaHa)}
          <span className="sr-only"> annoncés</span>
        </Badge>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
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
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-text">{project.summary}</p>
        {project.developmentStatus && <Badge tone="gold">{DEVELOPMENT_STATUS_LABELS[project.developmentStatus]}</Badge>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-2 font-poppins text-xs font-bold uppercase tracking-wider text-marine transition-colors group-hover:text-gold-hover">
          Voir le projet
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 ease-spring motion-safe:group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}
