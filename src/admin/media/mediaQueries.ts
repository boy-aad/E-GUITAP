import { supabase } from '../../lib/supabase';
import type { Enums } from '../../types/database';

export const MEDIA_KIND_LABELS: Record<Enums<'media_kind'>, string> = {
  photo_reelle: 'Photo réelle',
  illustration: "Illustration / photo d'illustration",
  plan: 'Plan',
  logo: 'Logo',
};

export type MediaUsage = { label: string; to: string };

/** Médiathèque, filtrée par recherche (texte alternatif, crédit) et par type. */
export async function listMedia({ q, kind }: { q?: string; kind?: string | null }) {
  let query = supabase
    .from('media')
    .select('id, path, kind, alt, credit, width, height, bytes, variants, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(500);
  const term = (q ?? '').replace(/[%,()*\\]/g, ' ').trim();
  if (term) query = query.or(`alt.ilike.%${term}%,credit.ilike.%${term}%`);
  if (kind && kind in MEDIA_KIND_LABELS) query = query.eq('kind', kind as Enums<'media_kind'>);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export type MediaRow = Awaited<ReturnType<typeof listMedia>>[number];

/** Où chaque média est utilisé : offres, catégories, slides d'accueil, textes, projets. */
export async function loadUsages(): Promise<Map<string, MediaUsage[]>> {
  const [offers, domains, slides, blocks, projects] = await Promise.all([
    supabase.from('activity_services').select('id, title, cover_media_id').not('cover_media_id', 'is', null),
    supabase.from('activity_domains').select('id, title, cover_media_id').not('cover_media_id', 'is', null),
    supabase.from('hero_slides').select('id, title, background_media_id').not('background_media_id', 'is', null),
    supabase.from('content_blocks').select('key, title, media_id').not('media_id', 'is', null),
    supabase.from('land_project_media').select('project_id, media_id, land_projects (name)'),
  ]);
  const map = new Map<string, MediaUsage[]>();
  const add = (id: string | null, usage: MediaUsage) => {
    if (!id) return;
    map.set(id, [...(map.get(id) ?? []), usage]);
  };
  for (const o of offers.data ?? []) add(o.cover_media_id, { label: `Offre : ${o.title}`, to: `/admin/offres/${o.id}` });
  for (const d of domains.data ?? []) add(d.cover_media_id, { label: `Catégorie : ${d.title}`, to: `/admin/categories/${d.id}` });
  for (const s of slides.data ?? []) add(s.background_media_id, { label: `Accueil (slide) : ${s.title}`, to: '/admin' });
  for (const b of blocks.data ?? []) add(b.media_id, { label: `Texte de page : ${b.title ?? b.key}`, to: '/admin' });
  for (const p of projects.data ?? []) add(p.media_id, { label: `Projet : ${p.land_projects?.name ?? 'projet foncier'}`, to: `/admin/projets/${p.project_id}` });
  return map;
}

/** Chemins de tous les fichiers d'un média (grande taille + autres tailles). */
export function mediaPaths(m: Pick<MediaRow, 'path' | 'variants'>): string[] {
  const variants = m.variants && typeof m.variants === 'object' ? Object.values(m.variants as Record<string, unknown>) : [];
  return [m.path, ...variants.filter((p): p is string => typeof p === 'string')];
}
