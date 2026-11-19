import { redirect } from 'react-router';
import { supabase } from '../../../lib/supabase';
import { MEDIA_SELECT, toMediaAsset } from '../../../lib/media';
import type { TablesInsert } from '../../../types/database';
import { friendlyDbError } from '../../format';
import { moveRow, text, textOrNull, type ActionResult } from './shared';

// Slides du hero de l'accueil (hero_slides). Une slide inactive n'est pas visible du public ;
// la suppression est réservée aux admins (RLS).

const BACKGROUND = `background:media!hero_slides_background_media_id_fkey (${MEDIA_SELECT})`;
const COLUMNS = `id, eyebrow, title, title_highlight, subtitle, show_signature, primary_cta_label, primary_cta_href, secondary_cta_label, secondary_cta_href, is_active, sort_order, focal_x, focal_y, background_media_id, updated_at, ${BACKGROUND}`;

/** Adresse de bouton acceptée : page du site, « #devis », https, e-mail ou téléphone. */
const HREF_RE = /^(\/[^\s]*|#devis|https:\/\/[^\s]+|mailto:[^\s]+|tel:\+?[0-9 ]+)$/i;

async function loadSlides() {
  const { data, error } = await supabase.from('hero_slides').select(COLUMNS).order('sort_order');
  if (error) throw new Error(error.message);
  return data.map((s) => ({ ...s, background: toMediaAsset(s.background) }));
}

export type SlideRow = Awaited<ReturnType<typeof loadSlides>>[number];

export const listLoader = () => loadSlides();

/** Liste : activer / désactiver, monter / descendre. */
export async function listAction({ request }: { request: Request }): Promise<ActionResult> {
  const form = await request.formData();
  const id = text(form.get('id'));
  const intent = text(form.get('intent'));
  if (intent === 'move') return moveRow('hero_slides', id, text(form.get('direction')) === 'up' ? 'up' : 'down');
  if (intent === 'toggle') {
    const active = form.get('active') === 'true';
    const { error } = await supabase.from('hero_slides').update({ is_active: active }).eq('id', id);
    if (error) return { ok: false, message: friendlyDbError(error) };
    return { ok: true, message: active ? 'Slide affichée sur l’accueil.' : 'Slide retirée de l’accueil.' };
  }
  return { ok: false, message: 'Action invalide.' };
}

export async function editLoader({ params }: { params: { id?: string } }) {
  const [slides, profile] = await Promise.all([loadSlides(), supabase.from('company_profile').select('signature_brand').single()]);
  const signature = profile.data?.signature_brand ?? null;
  const active = slides.filter((s) => s.is_active);
  if (!params.id) return { slide: null, signature, activeIndex: active.length, nextOrder: (slides.at(-1)?.sort_order ?? 0) + 10 };
  const slide = slides.find((s) => s.id === params.id);
  if (!slide) throw new Response('Slide introuvable', { status: 404 });
  // Place parmi les slides affichées : détermine la photo par défaut (comme sur le site).
  const index = active.findIndex((s) => s.id === slide.id);
  return { slide, signature, activeIndex: index >= 0 ? index : active.length, nextOrder: slide.sort_order };
}

export type EditData = Awaited<ReturnType<typeof editLoader>>;

const focal = (v: FormDataEntryValue | null) => {
  const n = Number(text(v));
  return Number.isFinite(n) ? Math.min(1, Math.max(0, Math.round(n * 1000) / 1000)) : 0.5;
};

export async function editAction({ request, params }: { request: Request; params: { id?: string } }): Promise<ActionResult> {
  const form = await request.formData();

  if (form.get('intent') === 'delete' && params.id) {
    const { error } = await supabase.from('hero_slides').delete().eq('id', params.id);
    if (error) return { ok: false, message: friendlyDbError(error) };
    throw redirect('/admin/accueil?supprime=1');
  }

  const title = text(form.get('title'));
  const sortOrder = Number(text(form.get('sort_order')) || '0');
  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = 'Le titre est obligatoire.';
  if (!Number.isInteger(sortOrder)) fieldErrors.sort_order = 'Indiquez un nombre entier.';
  const cta = (prefix: 'primary' | 'secondary') => {
    const label = textOrNull(form.get(`${prefix}_cta_label`));
    const href = textOrNull(form.get(`${prefix}_cta_href`));
    if (Boolean(label) !== Boolean(href)) fieldErrors[`${prefix}_cta_${label ? 'href' : 'label'}`] = 'Renseignez le libellé et l’adresse, ou aucun des deux.';
    else if (href && !HREF_RE.test(href)) fieldErrors[`${prefix}_cta_href`] = 'Adresse invalide : /page, #devis, https://…, mailto: ou tel:.';
    return { label, href };
  };
  const primary = cta('primary');
  const secondary = cta('secondary');
  if (Object.keys(fieldErrors).length) return { ok: false, message: 'Certains champs sont à corriger.', fieldErrors };

  const values: TablesInsert<'hero_slides'> = {
    eyebrow: textOrNull(form.get('eyebrow')),
    title,
    title_highlight: textOrNull(form.get('title_highlight')),
    subtitle: textOrNull(form.get('subtitle')),
    show_signature: form.get('show_signature') === 'on',
    primary_cta_label: primary.label,
    primary_cta_href: primary.href,
    secondary_cta_label: secondary.label,
    secondary_cta_href: secondary.href,
    is_active: form.get('is_active') === 'on',
    sort_order: sortOrder,
    background_media_id: textOrNull(form.get('background_media_id')),
    focal_x: focal(form.get('focal_x')),
    focal_y: focal(form.get('focal_y')),
  };

  if (params.id) {
    const { error } = await supabase.from('hero_slides').update(values).eq('id', params.id);
    if (error) return { ok: false, message: friendlyDbError(error) };
    throw redirect('/admin/accueil?enregistre=1');
  }
  const { data, error } = await supabase.from('hero_slides').insert(values).select('id').single();
  if (error) return { ok: false, message: friendlyDbError(error) };
  throw redirect(`/admin/accueil/${data.id}?cree=1`);
}
