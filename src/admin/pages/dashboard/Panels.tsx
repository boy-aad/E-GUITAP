import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { formatDateTime } from '../../format';
import { Badge, EmptyState, InquiryStatusBadge, cardClass } from '../../ui';
import type { DashboardData } from './dashboardData';

/** Carte de tableau de bord : titre, lien « tout voir » facultatif, contenu. */
export function Panel({ title, link, children }: { title: string; link?: { to: string; label: string }; children: ReactNode }) {
  const id = `panel-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <section className={`${cardClass} flex flex-col`} aria-labelledby={id}>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <h2 id={id} className="font-poppins text-base font-bold text-marine">
          {title}
        </h2>
        {link && (
          <Link to={link.to} className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-marine hover:underline">
            {link.label} <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}

const rowLink = 'flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-3 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-gold';

export function RecentInquiries({ items }: { items: DashboardData['recent'] }) {
  if (items.length === 0) return <EmptyState title="Aucune demande pour le moment" />;
  return (
    <ul className="divide-y divide-slate-100">
      {items.map((i) => (
        <li key={i.id}>
          <Link to={`/admin/demandes/${i.id}`} className={rowLink}>
            <span className="font-semibold text-marine">{i.full_name}</span>
            <span className="min-w-0 flex-1 truncate text-sm text-slate-600">{i.subject}</span>
            <InquiryStatusBadge value={i.status} />
            <span className="text-xs text-slate-500">{formatDateTime(i.created_at)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function DraftList({ items }: { items: DashboardData['drafts'] }) {
  if (items.length === 0) return <p className="px-5 py-6 text-sm text-slate-600">Aucun contenu en brouillon : tout est publié ou archivé.</p>;
  return (
    <ul className="divide-y divide-slate-100">
      {items.slice(0, 8).map((d) => (
        <li key={`${d.kind}-${d.label}`}>
          <Link to={d.to} className={rowLink}>
            <Badge tone="warning">{d.kind}</Badge>
            <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{d.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function OffersWithoutImage({ items }: { items: DashboardData['offersWithoutImage'] }) {
  if (items.length === 0) return <p className="px-5 py-6 text-sm text-slate-600">Toutes les offres publiées ont une image réelle.</p>;
  return (
    <div>
      <p className="px-5 pt-4 text-sm text-slate-600">
        {items.length} offre{items.length > 1 ? 's' : ''} publiée{items.length > 1 ? 's' : ''} affiche{items.length > 1 ? 'nt' : ''} encore
        l'illustration par défaut. Une vraie photo rend le catalogue plus crédible.
      </p>
      <ul className="divide-y divide-slate-100">
        {items.slice(0, 5).map((o) => (
          <li key={o.id}>
            <Link to={`/admin/offres/${o.id}`} className={rowLink}>
              <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{o.title}</span>
              <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RecentActivity({ items }: { items: DashboardData['activity'] }) {
  if (items.length === 0) return <EmptyState title="Aucune activité enregistrée" />;
  return (
    <ol className="divide-y divide-slate-100">
      {items.map((a) => (
        <li key={a.id} className="px-5 py-3 text-sm">
          <Link to={`/admin/journal/${a.id}`} className="block text-slate-800 hover:underline focus-visible:outline-2 focus-visible:outline-gold">
            <span className="font-semibold">{a.who}</span> {a.what}
            {a.item && <span className="text-slate-600"> : « {a.item} »</span>}
          </Link>
          <p className="text-xs text-slate-500">{formatDateTime(a.at)}</p>
        </li>
      ))}
    </ol>
  );
}
