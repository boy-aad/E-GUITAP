import { supabase } from '../../../lib/supabase';
import { PUBLIC_MEDIA_BUCKET } from '../../../lib/media';
import type { Enums } from '../../../types/database';
import { friendlyDbError } from '../../format';
import { MEDIA_KIND_LABELS, listMedia, loadUsages, mediaPaths } from '../../media/mediaQueries';

export type ActionResult = { ok: boolean; message: string };

const text = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const [media, usages] = await Promise.all([listMedia({ q: url.searchParams.get('q') ?? '', kind: url.searchParams.get('type') }), loadUsages()]);
  return { media, usages: Object.fromEntries(usages) };
}

export type MediaPageData = Awaited<ReturnType<typeof loader>>;

/** Modification des informations d'un média, ou suppression (admin, si inutilisé). */
export async function action({ request }: { request: Request }): Promise<ActionResult> {
  const form = await request.formData();
  const id = text(form.get('id'));
  if (!id) return { ok: false, message: 'Média introuvable.' };

  if (form.get('intent') === 'delete') {
    const usages = (await loadUsages()).get(id) ?? [];
    if (usages.length) return { ok: false, message: `Suppression impossible : ce média est utilisé (${usages.map((u) => u.label).join(' ; ')}).` };
    const { data: row, error: readError } = await supabase.from('media').select('path, variants').eq('id', id).single();
    if (readError) return { ok: false, message: friendlyDbError(readError) };
    const { error } = await supabase.from('media').delete().eq('id', id);
    if (error) return { ok: false, message: friendlyDbError(error) };
    // La fiche est supprimée ; les fichiers suivent (règle « public-media : admin supprime »).
    await supabase.storage.from(PUBLIC_MEDIA_BUCKET).remove(mediaPaths(row));
    return { ok: true, message: 'Média supprimé.' };
  }

  const alt = text(form.get('alt'));
  const kind = text(form.get('kind'));
  if (!alt) return { ok: false, message: 'Le texte alternatif est obligatoire.' };
  if (!(kind in MEDIA_KIND_LABELS)) return { ok: false, message: 'Type invalide.' };
  const { error } = await supabase
    .from('media')
    .update({ alt, kind: kind as Enums<'media_kind'>, credit: text(form.get('credit')) || null })
    .eq('id', id);
  return error ? { ok: false, message: friendlyDbError(error) } : { ok: true, message: 'Informations du média enregistrées.' };
}
