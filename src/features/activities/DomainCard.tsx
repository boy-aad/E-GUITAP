import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { BrandPanel } from '../../components/brand/Skyline';
import { Card } from '../../components/ui/Card';
import { SmartImage } from '../../components/ui/SmartImage';
import type { ActivityDomain } from '../../content/types';
import { domainCoverImage } from './domainCover';
import { DEFAULT_DOMAIN_ICON, DOMAIN_ICONS } from './domainIcons';

/** Carte d'un domaine d'activité (accueil) : couverture, icône, titre, trois prestations. */
export function DomainCard({ domain }: { domain: ActivityDomain }) {
  const Icon = DOMAIN_ICONS[domain.slug] ?? DEFAULT_DOMAIN_ICON;
  return (
    <Card as="article" interactive className="flex h-full flex-col">
      <div className="relative">
        <SmartImage
          image={domainCoverImage(domain)}
          ratio="4/3"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          fallback={<BrandPanel className="h-full" />}
          imgClassName="transition-transform duration-700 ease-spring motion-safe:group-hover:scale-105"
        />
        <span className="absolute -bottom-6 left-6 flex h-12 w-12 items-center justify-center rounded-xl bg-marine text-gold shadow-lg ring-4 ring-white transition-colors group-hover:bg-gold group-hover:text-marine">
          <Icon className="h-6 w-6" strokeWidth={1.75} aria-hidden="true" />
        </span>
      </div>
      <div className="flex flex-1 flex-col px-6 pb-6 pt-10">
        <p className="flex items-center justify-between gap-2 font-poppins text-xs font-bold text-slate-text">
          <span aria-hidden="true">Domaine {domain.letter}</span>
          {domain.services.length > 0 && (
            <span className="rounded-full bg-ivory px-2 py-0.5 font-inter font-semibold text-marine">
              {domain.services.length} offre{domain.services.length > 1 ? 's' : ''}
            </span>
          )}
        </p>
        <h3 className="mt-1 font-poppins text-lg font-bold text-marine">
          <Link to={`/activites#${domain.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {domain.title}
          </Link>
        </h3>
        <ul className="mt-3 flex-1 space-y-1.5 text-sm text-slate-text">
          {domain.services.slice(0, 3).map((s) => (
            <li key={s.title} className="flex gap-2.5">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden="true" />
              {s.title}
            </li>
          ))}
        </ul>
        <span className="mt-5 inline-flex items-center gap-1.5 font-poppins text-xs font-bold uppercase tracking-wider text-marine transition-colors group-hover:text-gold-hover">
          Découvrir le domaine
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 ease-spring motion-safe:group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Card>
  );
}
