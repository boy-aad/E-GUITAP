import { supabase } from '../../../lib/supabase';
import type { Enums } from '../../../types/database';
import { requireStaff } from '../../auth';

// Données du tableau de bord (PRD § 6.3), toutes lues avec les droits de l'utilisateur :
// un éditeur ne voit ni le journal ni le délai de prise en charge (RLS « audit : lecture admin »).

export const WEEKS = 12;
const DAY = 86_400_000;

type InquiryType = Enums<'inquiry_type'>;

/** Lundi 00:00 (heure locale) de la semaine contenant `d`. */
function startOfWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}

export type WeekBucket = { start: Date; counts: Record<InquiryType, number> };
export type DraftItem = { kind: string; label: string; to: string };
export type ActivityItem = { id: number; at: string; who: string; what: string; item: string | null };

const emptyCounts = (): Record<InquiryType, number> => ({ contact: 0, renseignement_activite: 0, renseignement_projet: 0, demande_devis: 0 });

const TABLE_LABELS: Record<string, string> = {
  inquiries: 'une demande',
  activity_services: 'une offre',
  activity_domains: 'une catégorie',
  land_projects: 'un projet foncier',
  land_project_objectives: "l'objectif d'un projet",
  land_project_documents: "un document foncier",
  land_project_media: "un média de projet",
  company_profile: "le profil de l'entreprise",
  company_values: 'une valeur',
  company_contacts: 'une coordonnée',
  hero_slides: "une slide d'accueil",
  content_blocks: 'un texte de page',
  media: 'un média',
  staff_profiles: "un membre de l'équipe",
};
const ACTION_LABELS: Record<string, string> = { INSERT: 'a créé', UPDATE: 'a modifié', DELETE: 'a supprimé' };

/** Libellé lisible d'une ligne du journal (titre, nom…), sans jamais afficher de données privées. */
function itemLabel(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  for (const k of ['title', 'name', 'full_name', 'label', 'key']) if (typeof d[k] === 'string') return d[k] as string;
  return null;
}

export async function loader({ request }: { request: Request }) {
  const session = await requireStaff(request);
  const isAdmin = session.staff.role === 'admin';
  const now = new Date();
  const firstWeek = new Date(startOfWeek(now).getTime() - (WEEKS - 1) * 7 * DAY);
  const since30 = new Date(now.getTime() - 30 * DAY).toISOString();
  const since90 = new Date(now.getTime() - 90 * DAY).toISOString();
  const count = { count: 'exact' as const, head: true };

  // Journal (admin uniquement : RLS « audit : lecture admin »), lu en parallèle.
  const adminQueries = isAdmin
    ? Promise.all([
        supabase
          .from('audit_log')
          .select('created_at, new_data')
          .eq('table_name', 'inquiries')
          .eq('action', 'UPDATE')
          .eq('old_data->>status', 'nouveau')
          .neq('new_data->>status', 'nouveau')
          .gte('created_at', since90)
          .limit(1000),
        supabase.from('audit_log').select('id, created_at, actor_id, table_name, action, old_data, new_data').order('created_at', { ascending: false }).limit(10),
        supabase.from('staff_profiles').select('user_id, full_name'),
      ])
    : Promise.resolve([null, null, null] as const);

  const [newCount, quoteCount, treated30, unnotified, recent, window, offers, projects, mediaCount, domains, values, profile, contacts] =
    await Promise.all([
      supabase.from('inquiries').select('id', count).eq('status', 'nouveau'),
      supabase.from('inquiries').select('id', count).eq('type', 'demande_devis').in('status', ['nouveau', 'en_cours']),
      // Approximation : demandes au statut « traitée » modifiées depuis 30 jours.
      supabase.from('inquiries').select('id', count).eq('status', 'traite').gte('updated_at', since30),
      supabase.from('inquiries').select('id', count).is('notified_at', null).neq('status', 'archive'),
      supabase.from('inquiries').select('id, created_at, full_name, subject, status').order('created_at', { ascending: false }).limit(5),
      supabase.from('inquiries').select('created_at, type, activity_domains (short_title)').gte('created_at', firstWeek.toISOString()).limit(5000),
      supabase.from('activity_services').select('id, title, publication, cover_media_id').order('sort_order'),
      supabase.from('land_projects').select('id, name, publication'),
      supabase.from('media').select('id', count),
      supabase.from('activity_domains').select('id, title, publication'),
      supabase.from('company_values').select('id, title, publication'),
      supabase.from('company_profile').select('legal_form, rccm, nif, publication_manager, host_name').maybeSingle(),
      supabase.from('company_contacts').select('kind, is_public'),
    ]);
  for (const r of [newCount, quoteCount, treated30, unnotified, recent, window, offers, projects, mediaCount, domains, values, profile, contacts]) {
    if (r.error) throw new Error(r.error.message);
  }
  const [handling, log, staffNames] = await adminQueries;


  // Demandes par semaine et par type, sur 12 semaines.
  const weeks: WeekBucket[] = Array.from({ length: WEEKS }, (_, i) => ({
    start: new Date(firstWeek.getTime() + i * 7 * DAY),
    counts: emptyCounts(),
  }));
  const byCategory = new Map<string, number>();
  for (const row of window.data ?? []) {
    const idx = Math.floor((startOfWeek(new Date(row.created_at)).getTime() - firstWeek.getTime()) / (7 * DAY));
    const bucket = weeks[Math.round(idx)];
    if (bucket) bucket.counts[row.type] += 1;
    const cat = row.activity_domains?.short_title ?? 'Sans catégorie';
    byCategory.set(cat, (byCategory.get(cat) ?? 0) + 1);
  }

  // Délai moyen de première prise en charge (passage de « nouvelle » à un autre statut).
  let avgHandlingHours: number | null = null;
  if (handling?.data?.length) {
    const delays = handling.data
      .map((r) => {
        const created = (r.new_data as { created_at?: string } | null)?.created_at;
        return created ? (new Date(r.created_at).getTime() - new Date(created).getTime()) / 3_600_000 : null;
      })
      .filter((h): h is number => h !== null && h >= 0);
    if (delays.length) avgHandlingHours = delays.reduce((a, b) => a + b, 0) / delays.length;
  }

  // Activité récente avec le nom des auteurs.
  const names = new Map((staffNames?.data ?? []).map((s) => [s.user_id, s.full_name]));
  const activity: ActivityItem[] = (log?.data ?? []).map((l) => ({
    id: l.id,
    at: l.created_at,
    // Sans utilisateur connecté : formulaire public (nouvelle demande) ou opération technique (migration, script).
    who: l.actor_id
      ? (names.get(l.actor_id) ?? 'Un membre de l’équipe')
      : l.table_name === 'inquiries' && l.action === 'INSERT'
        ? 'Le formulaire du site'
        : 'Système (migration ou script)',
    what: `${ACTION_LABELS[l.action] ?? l.action} ${TABLE_LABELS[l.table_name] ?? l.table_name}`,
    item: itemLabel(l.new_data ?? l.old_data),
  }));

  const offerRows = offers.data ?? [];
  const drafts: DraftItem[] = [
    ...offerRows.filter((o) => o.publication === 'brouillon').map((o) => ({ kind: 'Offre', label: o.title, to: `/admin/offres/${o.id}` })),
    ...(projects.data ?? []).filter((p) => p.publication === 'brouillon').map((p) => ({ kind: 'Projet', label: p.name, to: `/admin/projets/${p.id}` })),
    ...(domains.data ?? []).filter((d) => d.publication === 'brouillon').map((d) => ({ kind: 'Catégorie', label: d.title, to: '/admin/offres' })),
    ...(values.data ?? []).filter((v) => v.publication === 'brouillon').map((v) => ({ kind: 'Valeur', label: v.title, to: '/admin' })),
  ];

  const legal = profile.data;
  const missingLegal = legal
    ? (
        [
          ['legal_form', 'forme juridique'],
          ['rccm', 'RCCM'],
          ['nif', 'NIF'],
          ['publication_manager', 'responsable de la publication'],
          ['host_name', 'hébergeur'],
        ] as const
      )
        .filter(([k]) => !legal[k])
        .map(([, label]) => label)
    : [];
  const publicKinds = new Set((contacts.data ?? []).filter((c) => c.is_public).map((c) => c.kind));
  const missingContacts = (
    [
      ['phone', 'téléphone'],
      ['email', 'e-mail'],
      ['address', 'adresse'],
    ] as const
  )
    .filter(([k]) => !publicKinds.has(k))
    .map(([, label]) => label);

  const published = (rows: { publication: string }[]) => rows.filter((r) => r.publication === 'publie').length;
  return {
    isAdmin,
    kpi: {
      newInquiries: newCount.count ?? 0,
      pendingQuotes: quoteCount.count ?? 0,
      treated30: treated30.count ?? 0,
      avgHandlingHours,
      offers: { published: published(offerRows), total: offerRows.length },
      projects: { published: published(projects.data ?? []), total: projects.data?.length ?? 0 },
      media: mediaCount.count ?? 0,
    },
    unnotified: unnotified.count ?? 0,
    recent: recent.data ?? [],
    weeks,
    byCategory: [...byCategory].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
    drafts,
    offersWithoutImage: offerRows.filter((o) => o.publication === 'publie' && !o.cover_media_id).map((o) => ({ id: o.id, title: o.title })),
    missingLegal,
    missingContacts,
    activity,
  };
}

export type DashboardData = Awaited<ReturnType<typeof loader>>;
