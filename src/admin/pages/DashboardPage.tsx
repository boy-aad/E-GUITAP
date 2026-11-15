import { Link, useLoaderData } from 'react-router';
import { AlertTriangle, ArrowRight, Inbox, LandPlot } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { INQUIRY_STATUS_LABELS, formatDateTime } from '../format';
import { AdminPageHeader, Badge, cardClass } from '../ui';

export async function loader() {
  const [newCount, unnotifiedCount, recent, projects] = await Promise.all([
    supabase.from('inquiries').select('id', { count: 'exact', head: true }).eq('status', 'nouveau'),
    supabase
      .from('inquiries')
      .select('id', { count: 'exact', head: true })
      .is('notified_at', null)
      .neq('status', 'archive'),
    supabase
      .from('inquiries')
      .select('id, created_at, full_name, subject, status, notified_at')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('land_projects').select('publication'),
  ]);
  for (const r of [newCount, unnotifiedCount, recent, projects]) {
    if (r.error) throw new Error(r.error.message);
  }
  const published = (projects.data ?? []).filter((p) => p.publication === 'publie').length;
  return {
    newInquiries: newCount.count ?? 0,
    unnotified: unnotifiedCount.count ?? 0,
    recent: recent.data ?? [],
    projectsPublished: published,
    projectsTotal: projects.data?.length ?? 0,
  };
}

export function Component() {
  const data = useLoaderData() as Awaited<ReturnType<typeof loader>>;

  return (
    <>
      <title>Tableau de bord | Administration E-GUITAP</title>
      <AdminPageHeader title="Tableau de bord" description="Vue d'ensemble du site E-GUITAP." />

      {data.unnotified > 0 && (
        <div role="status" className="mb-6 flex items-start gap-3 rounded border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>
            {data.unnotified} demande{data.unnotified > 1 ? 's n’ont' : ' n’a'} pas fait l'objet d'une notification
            par e-mail (aucun domaine vérifié chez Resend). Consultez-les ici régulièrement.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/admin/demandes?statut=nouveau" className={`${cardClass} flex items-center gap-4 p-5 hover:border-gold`}>
          <span className="flex h-12 w-12 items-center justify-center rounded bg-marine text-gold">
            <Inbox className="h-6 w-6" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-poppins text-3xl font-bold">{data.newInquiries}</span>
            <span className="text-sm text-slate-text">nouvelle{data.newInquiries > 1 ? 's' : ''} demande{data.newInquiries > 1 ? 's' : ''}</span>
          </span>
        </Link>
        <Link to="/admin/projets" className={`${cardClass} flex items-center gap-4 p-5 hover:border-gold`}>
          <span className="flex h-12 w-12 items-center justify-center rounded bg-marine text-gold">
            <LandPlot className="h-6 w-6" aria-hidden="true" />
          </span>
          <span>
            <span className="block font-poppins text-3xl font-bold">
              {data.projectsPublished}
              <span className="text-lg text-slate-text"> / {data.projectsTotal}</span>
            </span>
            <span className="text-sm text-slate-text">projets fonciers publiés</span>
          </span>
        </Link>
      </div>

      <section className={`${cardClass} mt-8`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-poppins text-base font-bold">Dernières demandes</h2>
          <Link to="/admin/demandes" className="inline-flex items-center gap-1 text-xs font-semibold hover:text-gold-hover">
            Tout voir <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
        {data.recent.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-text">Aucune demande pour le moment.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.recent.map((i) => (
              <li key={i.id}>
                <Link to={`/admin/demandes/${i.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 hover:bg-paper">
                  <span className="font-semibold">{i.full_name}</span>
                  <span className="flex-1 truncate text-sm text-slate-text">{i.subject}</span>
                  <Badge tone={i.status === 'nouveau' ? 'info' : 'neutral'}>{INQUIRY_STATUS_LABELS[i.status]}</Badge>
                  <span className="text-xs text-slate-text">{formatDateTime(i.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
