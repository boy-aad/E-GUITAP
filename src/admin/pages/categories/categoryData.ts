import { redirect } from 'react-router';
import { supabase } from '../../../lib/supabase';
import { MEDIA_SELECT, toMediaAsset } from '../../../lib/media';
import type { Enums, TablesInsert } from '../../../types/database';
import { friendlyDbError, slugify } from '../../format';

// Catégories du catalogue (activity_domains). Une catégorie contenant des offres ne peut pas
// être supprimée : contrôle ici ET déclencheur en base (la clé étrangère est en cascade).

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const text = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');

export type ActionResult = { ok: boolean; message: string; fieldErrors?: Record<string, string> };

export async function listLoader() {
  const { data, error } = await supabase
    .from('activity_domains')
    .select('id, slug, letter, title, short_title, availability, publication, sort_order, activity_services (id, publication)')
    .order('sort_order');
  if (error) throw new Error(error.message);
  return data.map(({ activity_services, ...d }) => ({
    ...d,
    offers: activity_services.length,
    publishedOffers: activity_services.filter((s) => s.publication === 'publie').length,
  }));
}

type Params = { params: { id?: string } };

export async function editLoader({ params }: Params) {
  if (!params.id) return { category: null, offers: 0 };
  const { data, error } = await supabase
    .from('activity_domains')
    .select(`id, slug, letter, title, short_title, summary, description, availability, publication, sort_order, cover_media_id, updated_at, cover:media!activity_domains_cover_media_id_fkey (${MEDIA_SELECT}), activity_services (id)`)
    .eq('id', params.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Response('Catégorie introuvable', { status: 404 });
  const { activity_services, cover, ...category } = data;
  return { category: { ...category, cover: toMediaAsset(cover) }, offers: activity_services.length };
}

export type EditData = Awaited<ReturnType<typeof editLoader>>;

export async function editAction({ request, params }: Params & { request: Request }): Promise<ActionResult> {
  const form = await request.formData();

  if (form.get('intent') === 'delete' && params.id) {
    const { count } = await supabase.from('activity_services').select('id', { count: 'exact', head: true }).eq('domain_id', params.id);
    if (count) {
      return { ok: false, message: `Suppression impossible : ${count} offre${count > 1 ? 's sont rattachées' : ' est rattachée'} à cette catégorie. Déplacez ou supprimez d'abord ses offres.` };
    }
    const { error } = await supabase.from('activity_domains').delete().eq('id', params.id);
    if (error) return { ok: false, message: friendlyDbError(error) };
    throw redirect('/admin/categories?supprime=1');
  }

  const title = text(form.get('title'));
  const shortTitle = text(form.get('short_title'));
  const letter = text(form.get('letter')).toUpperCase();
  const slug = text(form.get('slug')) || slugify(shortTitle || title);
  const summary = text(form.get('summary'));
  const sortOrder = Number(text(form.get('sort_order')) || '0');

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = 'Le titre est obligatoire.';
  if (!shortTitle) fieldErrors.short_title = 'Le titre court est obligatoire (filtres, cartes).';
  if (letter.length !== 1) fieldErrors.letter = 'Une seule lettre (ex. A).';
  if (!SLUG_RE.test(slug)) fieldErrors.slug = 'Lettres minuscules, chiffres et tirets uniquement (ex. btp).';
  if (!summary) fieldErrors.summary = 'Le résumé est obligatoire.';
  if (!Number.isInteger(sortOrder)) fieldErrors.sort_order = 'Indiquez un nombre entier.';
  if (Object.keys(fieldErrors).length) return { ok: false, message: 'Certains champs sont à corriger.', fieldErrors };

  const values: TablesInsert<'activity_domains'> = {
    title,
    short_title: shortTitle,
    letter,
    slug,
    summary,
    description: text(form.get('description')) || null,
    availability: text(form.get('availability')) as Enums<'availability_status'>,
    publication: text(form.get('publication')) as Enums<'publication_status'>,
    sort_order: sortOrder,
    cover_media_id: text(form.get('cover_media_id')) || null,
  };

  if (params.id) {
    const { error } = await supabase.from('activity_domains').update(values).eq('id', params.id);
    if (error) return { ok: false, message: friendlyDbError(error) };
    throw redirect('/admin/categories?enregistre=1');
  }
  const { data, error } = await supabase.from('activity_domains').insert(values).select('id').single();
  if (error) return { ok: false, message: friendlyDbError(error) };
  throw redirect(`/admin/categories/${data.id}?cree=1`);
}
