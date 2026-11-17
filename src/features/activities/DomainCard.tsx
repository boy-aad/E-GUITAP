import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import type { ActivityDomain } from '../../content/types';
import { DEFAULT_DOMAIN_ICON, DOMAIN_ICONS } from './domainIcons';

/** Carte d'un domaine d'activité (accueil) : icône, lettre, titre, trois prestations. */
export function DomainCard({ domain }: { domain: ActivityDomain }) {
  const Icon = DOMAIN_ICONS[domain.slug] ?? DEFAULT_DOMAIN_ICON;
  return (
    <Card as="article" interactive className="flex h-full flex-col p-7">
      <div className="mb-6 flex items-center justify-between">
        <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-marine text-gold transition-colors group-hover:bg-gold group-hover:text-marine">
          <Icon className="h-7 w-7" strokeWidth={1.75} aria-hidden="true" />
        </span>
        <span className="font-poppins text-4xl font-bold text-slate-200" aria-hidden="true">
          {domain.letter}
        </span>
      </div>
      <h3 className="font-poppins text-xl font-bold text-marine">
        <Link to={`/activites#${domain.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
          {domain.title}
        </Link>
      </h3>
      <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-text">
        {domain.services.slice(0, 3).map((s) => (
          <li key={s.title} className="flex gap-2.5">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden="true" />
            {s.title}
          </li>
        ))}
      </ul>
      <span className="mt-6 inline-flex items-center gap-1.5 font-poppins text-xs font-bold uppercase tracking-wider text-marine transition-colors group-hover:text-gold-hover">
        Toutes les prestations
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Card>
  );
}
