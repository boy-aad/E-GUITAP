import { redirect } from 'react-router';
import { supabase } from '../../../lib/supabase';
import type { Enums } from '../../../types/database';
import { INQUIRY_STATUS_LABELS, friendlyDbError } from '../../format';
import { STATUSES, loadStaffNames } from './inquiryQuery';

// Fiche d'une demande : lecture, mise à jour (statut, assignation, notes), suppression (admin)
// et historique tiré de inquiry_events (statuts et assignations, sans données personnelles).

type Params = { params: { id?: string } };
export type ActionResult = { ok: boolean; message: string };
export type HistoryEntry = { at: string; who: string; text: string };

type EventRow = { created_at: string; actor_id: string | null; kind: string; from_value: string | null; to_value: string | null };

/** Événements lisibles : réception (date de la demande), puis changements de statut et d'assignation. */
function buildHistory(createdAt: string, events: EventRow[], staff: Map<string, string>): HistoryEntry[] {
  const name = (id: string | null) => (id ? (staff.get(id) ?? 'Un membre de l’équipe') : 'Système');
  const status = (s: string | null) => INQUIRY_STATUS_LABELS[s as Enums<'inquiry_status'>] ?? s ?? '—';
  return [
    { at: createdAt, who: 'Formulaire du site', text: 'Demande reçue' },
    ...events.map((e) => ({
      at: e.created_at,
      who: name(e.actor_id),
      text:
        e.kind === 'statut'
          ? `Statut : ${status(e.from_value)} → ${status(e.to_value)}`
          : e.to_value
            ? `Assignée à ${staff.get(e.to_value) ?? 'un membre de l’équipe'}`
            : 'Assignation retirée',
    })),
  ];
}

export async function loader({ params }: Params) {
  const id = params.id ?? '';
  const [result, staff, log] = await Promise.all([
    supabase
      .from('inquiries')
      .select('*, activity_domains (title), land_projects (name, slug), activity_services (title, slug)')
      .eq('id', id)
      .maybeSingle(),
    loadStaffNames(),
    supabase.from('inquiry_events').select('created_at, actor_id, kind, from_value, to_value').eq('inquiry_id', id).order('created_at').limit(200),
  ]);
  if (result.error) throw new Error(result.error.message);
  if (!result.data) throw new Response('Demande introuvable', { status: 404 });
  if (log.error) throw new Error(log.error.message);
  const history = buildHistory(result.data.created_at, log.data ?? [], staff);
  return { inquiry: result.data, staff: [...staff].map(([value, label]) => ({ value, label })), history };
}

export type DetailData = Awaited<ReturnType<typeof loader>>;

export async function action({ request, params }: Params & { request: Request }): Promise<ActionResult> {
  const form = await request.formData();
  const id = params.id ?? '';
  const intent = form.get('intent');

  if (intent === 'delete') {
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (error) return { ok: false, message: friendlyDbError(error) };
    throw redirect('/admin/demandes?supprime=1');
  }

  const status = String(form.get('status') ?? '');
  if (!(STATUSES as readonly string[]).includes(status)) return { ok: false, message: 'Statut invalide.' };

  // Changement rapide de statut : seul le statut est modifié.
  if (intent === 'status') {
    const { error } = await supabase.from('inquiries').update({ status: status as Enums<'inquiry_status'> }).eq('id', id);
    if (error) return { ok: false, message: friendlyDbError(error) };
    return { ok: true, message: `Demande marquée « ${INQUIRY_STATUS_LABELS[status as Enums<'inquiry_status'>]} ».` };
  }

  const assigned = String(form.get('assigned_to') ?? '');
  const { error } = await supabase
    .from('inquiries')
    .update({
      status: status as Enums<'inquiry_status'>,
      assigned_to: assigned || null,
      internal_notes: String(form.get('internal_notes') ?? '').trim() || null,
    })
    .eq('id', id);
  return error ? { ok: false, message: friendlyDbError(error) } : { ok: true, message: 'Modifications enregistrées.' };
}
