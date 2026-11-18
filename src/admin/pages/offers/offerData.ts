import { redirect } from 'react-router';
import { supabase } from '../../../lib/supabase';
import type { Enums, TablesInsert } from '../../../types/database';
import { friendlyDbError, slugify } from '../../format';

// Catalogue d'offres (activity_services) : liste, réordonnancement, duplication, création,
// modification et suppression (admin, garantie par la RLS).

export const SUMMARY_MAX = 200;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const COVER = 'cover:media!activity_services_cover_media_id_fkey (path, kind, alt, credit, width, height)';

export type ActionResult = { ok: boolean; message: string; fieldErrors?: Record<string, string> };

const text = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');

/** Offres triées par catégorie (ordre des domaines), puis par ordre dans la catégorie. */
export async function loadOffers() {
  const { data, error } = await supabase
    .from('activity_services')
    .select(`id, slug, title, summary, availability, publication, is_featured, sort_order, domain_id, ${COVER}, activity_domains (slug, short_title, sort_order)`)
    .order('sort_order');
  if (error) throw new Error(error.message);
  return [...data].sort(
    (a, b) => (a.activity_domains?.sort_order ?? 0) - (b.activity_domains?.sort_order ?? 0) || a.sort_order - b.sort_order || a.title.localeCompare(b.title),
  );
}

/** Identifiant d'URL libre : « base », sinon « base-2 », « base-3 »… */
async function uniqueSlug(base: string, exceptId?: string): Promise<string> {
  const { data } = await supabase.from('activity_services').select('id, slug').like('slug', `${base}%`);
  const taken = new Set((data ?? []).filter((r) => r.id !== exceptId).map((r) => r.slug));
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

/** Monte ou descend une offre dans sa catégorie (renumérote la catégorie de 10 en 10). */
async function move(id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  const { data: current } = await supabase.from('activity_services').select('domain_id').eq('id', id).single();
  if (!current) return { ok: false, message: 'Offre introuvable.' };
  const { data: siblings, error } = await supabase
    .from('activity_services')
    .select('id, sort_order, title')
    .eq('domain_id', current.domain_id)
    .order('sort_order')
    .order('title');
  if (error) return { ok: false, message: friendlyDbError(error) };
  const ids = siblings.map((s) => s.id);
  const i = ids.indexOf(id);
  const j = direction === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return { ok: true, message: 'Ordre inchangé.' };
  [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  const results = await Promise.all(ids.map((sid, k) => supabase.from('activity_services').update({ sort_order: (k + 1) * 10 }).eq('id', sid)));
  const failed = results.find((r) => r.error);
  return failed?.error ? { ok: false, message: friendlyDbError(failed.error) } : { ok: true, message: 'Ordre mis à jour.' };
}

/** Copie d'une offre, en brouillon et non mise en avant ; ouvre ensuite sa fiche. */
async function duplicate(id: string): Promise<ActionResult> {
  const { data: o, error } = await supabase
    .from('activity_services')
    .select('domain_id, title, slug, summary, description, availability, quote_enabled, sort_order')
    .eq('id', id)
    .single();
  if (error || !o) return { ok: false, message: error ? friendlyDbError(error) : 'Offre introuvable.' };
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const copy: TablesInsert<'activity_services'> = {
    ...o,
    title: `${o.title} (copie)`,
    slug: await uniqueSlug(`${o.slug}-copie`),
    publication: 'brouillon',
    is_featured: false,
    sort_order: o.sort_order + 1,
    updated_by: session?.user.id ?? null,
  };
  const { data, error: insertError } = await supabase.from('activity_services').insert(copy).select('id').single();
  if (insertError) return { ok: false, message: friendlyDbError(insertError) };
  throw redirect(`/admin/offres/${data.id}?copie=1`);
}

/** Actions de la liste : publication groupée, déplacement, duplication. */
export async function listAction({ request }: { request: Request }): Promise<ActionResult> {
  const form = await request.formData();
  const intent = text(form.get('intent'));
  if (intent === 'move') return move(text(form.get('id')), text(form.get('direction')) === 'up' ? 'up' : 'down');
  if (intent === 'duplicate') return duplicate(text(form.get('id')));

  const ids = form.getAll('id').map(String);
  const publication = text(form.get('publication')) as Enums<'publication_status'>;
  if (!ids.length || !['publie', 'archive', 'brouillon'].includes(publication)) return { ok: false, message: 'Action invalide.' };
  const { error } = await supabase.from('activity_services').update({ publication }).in('id', ids);
  if (error) return { ok: false, message: friendlyDbError(error) };
  return { ok: true, message: `${ids.length} offre${ids.length > 1 ? 's' : ''} mise${ids.length > 1 ? 's' : ''} à jour.` };
}

type Params = { params: { id?: string } };

export async function editLoader({ params }: Params) {
  const [offer, domains] = await Promise.all([
    params.id
      ? supabase
          .from('activity_services')
          .select(`id, slug, title, summary, description, availability, publication, is_featured, quote_enabled, sort_order, domain_id, updated_at, ${COVER}`)
          .eq('id', params.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    supabase.from('activity_domains').select('id, slug, title, short_title').order('sort_order'),
  ]);
  if (offer.error) throw new Error(offer.error.message);
  if (params.id && !offer.data) throw new Response('Offre introuvable', { status: 404 });
  if (domains.error) throw new Error(domains.error.message);
  return { offer: offer.data, domains: domains.data };
}

export type EditData = Awaited<ReturnType<typeof editLoader>>;

export async function editAction({ request, params }: Params & { request: Request }): Promise<ActionResult> {
  const form = await request.formData();

  if (form.get('intent') === 'delete' && params.id) {
    const { error } = await supabase.from('activity_services').delete().eq('id', params.id);
    if (error) return { ok: false, message: friendlyDbError(error) };
    throw redirect('/admin/offres?supprime=1');
  }

  const title = text(form.get('title'));
  const slug = text(form.get('slug')) || slugify(title);
  const summary = text(form.get('summary'));
  const domainId = text(form.get('domain_id'));
  const sortOrder = Number(text(form.get('sort_order')) || '0');

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = 'Le titre est obligatoire.';
  if (!SLUG_RE.test(slug)) fieldErrors.slug = 'Lettres minuscules, chiffres et tirets uniquement (ex. travaux-de-voirie).';
  if (!domainId) fieldErrors.domain_id = 'Choisissez une catégorie.';
  if (summary.length > SUMMARY_MAX) fieldErrors.summary = `${SUMMARY_MAX} caractères au maximum.`;
  if (!Number.isInteger(sortOrder)) fieldErrors.sort_order = 'Indiquez un nombre entier.';
  if (Object.keys(fieldErrors).length) return { ok: false, message: 'Certains champs sont à corriger.', fieldErrors };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const values: TablesInsert<'activity_services'> = {
    title,
    slug,
    domain_id: domainId,
    summary: summary || null,
    description: text(form.get('description')) || null,
    availability: text(form.get('availability')) as Enums<'availability_status'>,
    publication: text(form.get('publication')) as Enums<'publication_status'>,
    is_featured: form.get('is_featured') === 'on',
    quote_enabled: form.get('quote_enabled') === 'on',
    sort_order: sortOrder,
    updated_by: session?.user.id ?? null,
  };

  if (params.id) {
    const { error } = await supabase.from('activity_services').update(values).eq('id', params.id);
    if (error) return { ok: false, message: friendlyDbError(error) };
    throw redirect('/admin/offres?enregistre=1');
  }
  const { data, error } = await supabase.from('activity_services').insert(values).select('id').single();
  if (error) return { ok: false, message: friendlyDbError(error) };
  throw redirect(`/admin/offres/${data.id}?cree=1`);
}
