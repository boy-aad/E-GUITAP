import { supabase } from '../../../lib/supabase';
import type { ContentBlockKey } from '../../../content/types';
import type { Enums } from '../../../types/database';
import { friendlyDbError } from '../../format';
import { text, textOrNull, type ActionResult } from './shared';

// Textes des pages (content_blocks). Seuls les blocs réellement lus par le site sont proposés ;
// un bloc absent ou non publié laisse le site afficher son texte par défaut.

export const TEXT_BLOCKS: { key: ContentBlockKey; label: string; where: string; fallback: string; titleUsed: boolean }[] = [
  {
    key: 'home.presentation',
    label: "Présentation de l'accueil",
    where: 'Accueil, section « L’entreprise ».',
    fallback: 'Sans texte publié : les deux premiers paragraphes de la présentation de l’entreprise.',
    titleUsed: true,
  },
  {
    key: 'home.cta',
    label: "Bandeau d'appel de l'accueil",
    where: 'Accueil, bandeau marine avant le pied de page.',
    fallback: 'Sans texte publié : « Un projet, une question ? » sans phrase d’accompagnement.',
    titleUsed: true,
  },
  {
    key: 'projects.intro',
    label: 'Introduction des projets fonciers',
    where: 'Accueil (section projets), page Projets fonciers et fiches projet. Seul le texte est utilisé.',
    fallback: 'Sans texte publié : aucune introduction.',
    titleUsed: false,
  },
  {
    key: 'contact.intro',
    label: 'Introduction de la page Contact',
    where: 'Page Contact, sous le titre.',
    fallback: 'Sans texte publié : titre « Contacter E-GUITAP », sans introduction.',
    titleUsed: true,
  },
];

export async function loader() {
  const { data, error } = await supabase
    .from('content_blocks')
    .select('key, title, body, publication, updated_at')
    .in(
      'key',
      TEXT_BLOCKS.map((b) => b.key),
    );
  if (error) throw new Error(error.message);
  return { blocks: data };
}

export type TextsData = Awaited<ReturnType<typeof loader>>;
export type BlockRow = TextsData['blocks'][number];

export async function action({ request }: { request: Request }): Promise<ActionResult> {
  const form = await request.formData();
  const key = text(form.get('key'));
  const block = TEXT_BLOCKS.find((b) => b.key === key);
  if (!block) return { ok: false, message: 'Texte inconnu.' };
  const body = textOrNull(form.get('body'));
  const publication = text(form.get('publication')) as Enums<'publication_status'>;
  if (publication === 'publie' && !body) return { ok: false, message: 'Un texte publié ne peut pas être vide.', fieldErrors: { [`${key}.body`]: 'Saisissez le texte, ou laissez-le en brouillon.' } };

  // Création au premier enregistrement, mise à jour ensuite (clé unique).
  const { error } = await supabase.from('content_blocks').upsert({ key, title: block.titleUsed ? textOrNull(form.get('title')) : null, body, publication }, { onConflict: 'key' });
  return error ? { ok: false, message: friendlyDbError(error) } : { ok: true, message: `« ${block.label} » enregistré.` };
}
