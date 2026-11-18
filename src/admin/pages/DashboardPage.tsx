import { Link, useLoaderData } from 'react-router';
import { ArrowRight, Briefcase, FileText, Inbox, LandPlot } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatDateTime } from '../format';
import { AdminPageHeader, EmptyState, InquiryStatusBadge, Notice, StatCard, cardClass } from '../ui';

export async function loader() {
  const [newCount, quoteCount, unnotifiedCount, recent, projects, offers] = await Promise.all([
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'nouveau'),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('type', 'demande_devis').in('status', ['nouveau', 'en_cours']),
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).is('notified_at', null).neq('status', 'archive'),
    supabase.from('inquiries').select('id, created_at, full_name, subject, status').order('created_at', { ascending: false }).limit(5),
    supabase.from('land_projects').select('publication'),
    supabase.from('activity_services').select('publication'),
  ]);
  for (const r of [newCount, quoteCount, unnotifiedCount, recent, projects, offers]) {
    if (r.error) throw new Error(r.error.message);
  }
  const published = (rows: { publication: string }[] | null) => (rows ?? []).filter((p) => p.publication === 'publie').length;
  return {
    newInquiries: newCount.count ?? 0,
    pendingQuotes: quoteCount.count ?? 0,
    unnotified: unnotifiedCount.count ?? 0,
    recent: recent.data ?? [],
    projects: { published: published(projects.data), total: projects.data?.length ?? 0 },
    offers: { published: published(offers.data), total: offers.data?.length ?? 0 },
  };
}

export function Component() {
  const data = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const plural = (n: number, one: string, many: string) => (n > 1 ? many : one);

  return (
    <>
      <title>Tableau de bord | Administration E-GUITAP</title>
      <AdminPageHeader title="Tableau de bord" description="Vue d'ensemble du site et des demandes reçues." />

      {data.unnotified > 0 && (
        <Notice tone="warning">
          {data.unnotified} {plural(data.unnotified, 'demande n’a', 'demandes n’ont')} pas fait l'objet d'une notification par e-mail
          (aucun domaine d'envoi vérifié chez Resend). Consultez-les ici régulièrement.
        </Notice>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Inbox className="h-5 w-5" aria-hidden="true" />}
          value={data.newInquiries}
          label={plural(data.newInquiries, 'nouvelle demande', 'nouvelles demandes')}
          to="/admin/demandes?statut=nouveau"
        />
        <StatCard
          icon={<FileText className="h-5 w-5" aria-hidden="true" />}
          value={data.pendingQuotes}
          label={plural(data.pendingQuotes, 'devis en attente', 'devis en attente')}
          hint="Nouveaux ou en cours"
          to="/admin/demandes?type=demande_devis"
        />
        <StatCard
          icon={<Briefcase className="h-5 w-5" aria-hidden="true" />}
          value={`${data.offers.published} / ${data.offers.total}`}
          label="offres publiées"
          to="/admin/offres"
        />
        <StatCard
          icon={<LandPlot className="h-5 w-5" aria-hidden="true" />}
          value={`${data.projects.published} / ${data.projects.total}`}
          label="projets fonciers publiés"
          to="/admin/projets"
        />
      </div>

      <section className={`${cardClass} mt-8`} aria-labelledby="dernieres-demandes">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 id="dernieres-demandes" className="font-poppins text-base font-bold text-marine">
            Dernières demandes
          </h2>
          <Link to="/admin/demandes" className="inline-flex items-center gap-1 text-sm font-semibold text-marine hover:underline">
            Tout voir <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
        {data.recent.length === 0 ? (
          <EmptyState title="Aucune demande pour le moment" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.recent.map((i) => (
              <li key={i.id}>
                <Link to={`/admin/demandes/${i.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-gold">
                  <span className="font-semibold text-marine">{i.full_name}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-600">{i.subject}</span>
                  <InquiryStatusBadge value={i.status} />
                  <span className="text-xs text-slate-500">{formatDateTime(i.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
