import { supabase } from '../../../lib/supabase';
import type { Enums } from '../../../types/database';

// Requête des demandes partagée par la liste (paginée) et l'export CSV (complet) :
// les mêmes filtres d'URL donnent exactement les mêmes lignes.

export const STATUSES = ['nouveau', 'en_cours', 'traite', 'archive'] as const satisfies readonly Enums<'inquiry_status'>[];
export const TYPES = ['demande_devis', 'renseignement_activite', 'renseignement_projet', 'contact'] as const satisfies readonly Enums<'inquiry_type'>[];
export const PERIODS = { '7': '7 derniers jours', '30': '30 derniers jours', '90': '3 derniers mois', '365': '12 derniers mois' } as const;
export const SORTABLE = { date: 'created_at', contact: 'full_name', statut: 'status' } as const;

const SELECT =
  'id, created_at, type, full_name, organization, phone, email, subject, message, status, notified_at, assigned_to, internal_notes, request_details, activity_services (title), land_projects (name), activity_domains (short_title)';

export type InquiryFilters = {
  statut: string | null;
  type: string | null;
  categorie: string | null;
  periode: string | null;
  q: string;
};

export function readFilters(params: URLSearchParams): InquiryFilters {
  return {
    statut: params.get('statut'),
    type: params.get('type'),
    categorie: params.get('categorie'),
    periode: params.get('periode'),
    // Caractères réservés de la syntaxe des filtres PostgREST retirés de la recherche.
    q: (params.get('q') ?? '').replace(/[%,()*\\]/g, ' ').trim(),
  };
}

/** Demandes filtrées, triées ; `range` pour paginer, sinon jusqu'à 5 000 lignes (export). */
export function inquiryQuery(f: InquiryFilters, sort: { column: string; ascending: boolean }, range?: { from: number; to: number }) {
  let query = supabase.from('inquiries').select(SELECT, { count: 'exact' }).order(sort.column, { ascending: sort.ascending });
  query = range ? query.range(range.from, range.to) : query.limit(5000);

  if (f.statut && (STATUSES as readonly string[]).includes(f.statut)) query = query.eq('status', f.statut as Enums<'inquiry_status'>);
  else query = query.neq('status', 'archive'); // Par défaut : tout sauf les archives.
  if (f.type && (TYPES as readonly string[]).includes(f.type)) query = query.eq('type', f.type as Enums<'inquiry_type'>);
  if (f.categorie) query = query.eq('domain_id', f.categorie);
  if (f.periode && f.periode in PERIODS) {
    query = query.gte('created_at', new Date(Date.now() - Number(f.periode) * 86_400_000).toISOString());
  }
  if (f.q) query = query.or(`full_name.ilike.%${f.q}%,phone.ilike.%${f.q}%,email.ilike.%${f.q}%`);
  return query;
}

export type InquiryRow = NonNullable<Awaited<ReturnType<typeof inquiryQuery>>['data']>[number];

/** Annuaire de l'équipe (nom par identifiant) : selon les droits, au moins son propre profil. */
export async function loadStaffNames(): Promise<Map<string, string>> {
  const { data } = await supabase.from('staff_profiles').select('user_id, full_name, is_active').order('full_name');
  return new Map((data ?? []).map((s) => [s.user_id, s.is_active ? s.full_name : `${s.full_name} (désactivé)`]));
}

/** Objet de la demande : offre, projet ou domaine. */
export const inquiryTopic = (i: Pick<InquiryRow, 'activity_services' | 'land_projects' | 'activity_domains' | 'subject'>) =>
  i.activity_services?.title ?? i.land_projects?.name ?? i.activity_domains?.short_title ?? i.subject ?? '—';
