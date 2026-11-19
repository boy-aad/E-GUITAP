import { supabase } from '../../../lib/supabase';
import { requireAdmin } from '../../auth';
import { tableParams } from '../../ui';
import { actorLabel, itemLabel } from './auditLabels';

// Journal d'activité (PRD § 6.9) : lecture de audit_log, réservée aux administrateurs (RLS
// « audit : lecture admin »). Filtres dans l'adresse : rubrique, auteur, période.

export const PAGE_SIZE = 25;
/** Valeur du filtre « auteur » pour les opérations sans utilisateur connecté. */
export const SYSTEM_ACTOR = 'systeme';
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Lendemain d'une date AAAA-MM-JJ (borne exclusive de « jusqu'au »). */
function nextDay(date: string): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}

async function staffNames() {
  const { data, error } = await supabase.from('staff_profiles').select('user_id, full_name').order('full_name');
  if (error) throw new Error(error.message);
  return data;
}

export async function listLoader({ request }: { request: Request }) {
  await requireAdmin();
  const url = new URL(request.url);
  const { ascending, from, to } = tableParams(url, { sort: '-date', pageSize: PAGE_SIZE });
  const filters = {
    table: url.searchParams.get('rubrique') ?? '',
    actor: url.searchParams.get('auteur') ?? '',
    since: DATE_RE.test(url.searchParams.get('du') ?? '') ? (url.searchParams.get('du') as string) : '',
    until: DATE_RE.test(url.searchParams.get('au') ?? '') ? (url.searchParams.get('au') as string) : '',
  };

  let query = supabase.from('audit_log').select('id, created_at, actor_id, table_name, action, old_data, new_data', { count: 'exact' });
  if (filters.table) query = query.eq('table_name', filters.table);
  if (filters.actor === SYSTEM_ACTOR) query = query.is('actor_id', null);
  else if (UUID_RE.test(filters.actor)) query = query.eq('actor_id', filters.actor);
  if (filters.since) query = query.gte('created_at', new Date(`${filters.since}T00:00:00`).toISOString());
  if (filters.until) query = query.lt('created_at', nextDay(filters.until));

  const [log, staff] = await Promise.all([query.order('created_at', { ascending }).order('id', { ascending }).range(from, to), staffNames()]);
  if (log.error) throw new Error(log.error.message);
  const names = new Map(staff.map((s) => [s.user_id, s.full_name]));
  const rows = log.data.map((l) => ({
    id: String(l.id),
    at: l.created_at,
    who: actorLabel(l, names),
    table: l.table_name,
    action: l.action,
    item: itemLabel(l.new_data ?? l.old_data),
  }));
  return { rows, total: log.count ?? 0, filters, staff };
}

export type JournalData = Awaited<ReturnType<typeof listLoader>>;
export type JournalRow = JournalData['rows'][number];

export async function entryLoader({ params }: { params: { id?: string } }) {
  await requireAdmin();
  const id = Number(params.id);
  if (!Number.isInteger(id)) throw new Response('Entrée introuvable', { status: 404 });
  const [entry, staff] = await Promise.all([supabase.from('audit_log').select('*').eq('id', id).maybeSingle(), staffNames()]);
  if (entry.error) throw new Error(entry.error.message);
  if (!entry.data) throw new Response('Entrée introuvable', { status: 404 });
  const names = new Map(staff.map((s) => [s.user_id, s.full_name]));
  return { entry: entry.data, who: actorLabel(entry.data, names), item: itemLabel(entry.data.new_data ?? entry.data.old_data) };
}

export type EntryData = Awaited<ReturnType<typeof entryLoader>>;
