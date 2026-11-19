import { supabase } from '../../../lib/supabase';
import { friendlyDbError } from '../../format';

// Outils communs aux pages « Contenus » (accueil, entreprise, coordonnées, textes).

export type ActionResult = { ok: boolean; message: string; fieldErrors?: Record<string, string> };

export const text = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');
export const textOrNull = (v: FormDataEntryValue | null) => text(v) || null;

/** Tables dont les lignes se réordonnent par boutons monter / descendre. */
type OrderedTable = 'hero_slides' | 'company_values';

/** Monte ou descend une ligne, puis renumérote la table de 10 en 10. */
export async function moveRow(table: OrderedTable, id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  const { data, error } = await supabase.from(table).select('id, sort_order').order('sort_order');
  if (error) return { ok: false, message: friendlyDbError(error) };
  const ids = data.map((r) => r.id);
  const i = ids.indexOf(id);
  const j = direction === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return { ok: true, message: 'Ordre inchangé.' };
  [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  const results = await Promise.all(ids.map((rid, k) => supabase.from(table).update({ sort_order: (k + 1) * 10 }).eq('id', rid)));
  const failed = results.find((r) => r.error);
  return failed?.error ? { ok: false, message: friendlyDbError(failed.error) } : { ok: true, message: 'Ordre mis à jour.' };
}

/** Paragraphes saisis dans une zone de texte, séparés par une ligne vide. */
export const toParagraphs = (value: string) =>
  value
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, ' ').trim())
    .filter(Boolean);
