import { Link, NavLink, useLoaderData, useSearchParams } from 'react-router';
import { MailWarning } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Enums } from '../../types/database';
import { INQUIRY_STATUS_LABELS, INQUIRY_STATUS_TONE as STATUS_TONE, INQUIRY_TYPE_LABELS, formatDateTime } from '../format';
import { AdminPageHeader, Badge, Notice, cardClass } from '../ui';

const STATUSES = ['nouveau', 'en_cours', 'traite', 'archive'] as const satisfies readonly Enums<'inquiry_status'>[];

export async function loader({ request }: { request: Request }) {
  const statut = new URL(request.url).searchParams.get('statut');
  let query = supabase
    .from('inquiries')
    .select('id, created_at, type, full_name, organization, phone, subject, status, notified_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (statut && (STATUSES as readonly string[]).includes(statut)) {
    query = query.eq('status', statut as Enums<'inquiry_status'>);
  } else {
    // Par défaut : tout sauf les archives.
    query = query.neq('status', 'archive');
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export function Component() {
  const inquiries = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const [params] = useSearchParams();
  const current = params.get('statut');

  const tabs = [{ value: null, label: 'À traiter et traitées' }, ...STATUSES.map((s) => ({ value: s, label: INQUIRY_STATUS_LABELS[s] }))];

  return (
    <>
      <title>Demandes | Administration E-GUITAP</title>
      <AdminPageHeader title="Demandes de renseignements" description="Demandes envoyées depuis le formulaire du site." />

      {params.get('supprime') && <Notice tone="success">La demande a été supprimée.</Notice>}

      <nav aria-label="Filtrer par statut" className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <NavLink
            key={t.label}
            to={t.value ? `?statut=${t.value}` : '.'}
            className={() =>
              `rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
                current === t.value || (!current && !t.value)
                  ? 'bg-marine text-white ring-marine'
                  : 'bg-white text-marine ring-slate-300 hover:bg-ivory'
              }`
            }
            end
          >
            {t.label}
          </NavLink>
        ))}
      </nav>

      <div className={`${cardClass} overflow-x-auto`}>
        {inquiries.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-slate-text">Aucune demande dans cette catégorie.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-paper text-xs uppercase tracking-wider text-slate-text">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Date</th>
                <th scope="col" className="px-4 py-3 font-semibold">Contact</th>
                <th scope="col" className="px-4 py-3 font-semibold">Sujet</th>
                <th scope="col" className="px-4 py-3 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inquiries.map((i) => (
                <tr key={i.id} className="hover:bg-paper">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-text">{formatDateTime(i.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/demandes/${i.id}`} className="font-semibold text-marine hover:underline">
                      {i.full_name}
                    </Link>
                    <span className="block text-xs text-slate-text">
                      {i.phone}
                      {i.organization ? ` · ${i.organization}` : ''}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="block">{i.subject}</span>
                    <span className="text-xs text-slate-text">{INQUIRY_TYPE_LABELS[i.type]}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={STATUS_TONE[i.status]}>{INQUIRY_STATUS_LABELS[i.status]}</Badge>
                      {!i.notified_at && (
                        <span title="Notification e-mail non envoyée" className="text-amber-700">
                          <MailWarning className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Notification e-mail non envoyée</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
