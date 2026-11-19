import { supabase } from '../../../lib/supabase';
import type { Enums, TablesUpdate } from '../../../types/database';
import { friendlyDbError } from '../../format';
import { moveRow, text, textOrNull, toParagraphs, type ActionResult } from './shared';

// Fiche entreprise (company_profile, ligne unique) et valeurs (company_values).
// Le nom de marque reste « E-GUITAP » : il n'est pas modifiable ici.

const PROFILE_COLUMNS =
  'brand_name, full_name, country, head_office, ambition, presentation, mission, vision, signature_brand, signature_institutional, signature_sectoral, legal_form, rccm, nif, publication_manager, host_name, updated_at';

export async function loader() {
  const [profile, values] = await Promise.all([
    supabase.from('company_profile').select(PROFILE_COLUMNS).single(),
    supabase.from('company_values').select('id, title, description, publication, sort_order').order('sort_order'),
  ]);
  if (profile.error) throw new Error(profile.error.message);
  if (values.error) throw new Error(values.error.message);
  return { profile: profile.data, values: values.data };
}

export type CompanyData = Awaited<ReturnType<typeof loader>>;
export type ValueRow = CompanyData['values'][number];

/** Champs obligatoires de la fiche, avec l'onglet où ils se trouvent. */
export const REQUIRED_FIELDS = { full_name: 'legal', country: 'identity', head_office: 'identity' } as const;

async function saveProfile(form: FormData): Promise<ActionResult> {
  const fieldErrors: Record<string, string> = {};
  for (const key of Object.keys(REQUIRED_FIELDS)) if (!text(form.get(key))) fieldErrors[key] = 'Ce champ est obligatoire.';
  if (Object.keys(fieldErrors).length) return { ok: false, message: 'Certains champs sont à corriger.', fieldErrors };

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const values: TablesUpdate<'company_profile'> = {
    full_name: text(form.get('full_name')),
    country: text(form.get('country')),
    head_office: text(form.get('head_office')),
    ambition: textOrNull(form.get('ambition')),
    presentation: toParagraphs(text(form.get('presentation'))),
    mission: textOrNull(form.get('mission')),
    vision: textOrNull(form.get('vision')),
    signature_brand: textOrNull(form.get('signature_brand')),
    signature_institutional: textOrNull(form.get('signature_institutional')),
    signature_sectoral: textOrNull(form.get('signature_sectoral')),
    legal_form: textOrNull(form.get('legal_form')),
    rccm: textOrNull(form.get('rccm')),
    nif: textOrNull(form.get('nif')),
    publication_manager: textOrNull(form.get('publication_manager')),
    host_name: textOrNull(form.get('host_name')),
    updated_by: session?.user.id ?? null,
  };
  // Ligne unique : la clé primaire vaut toujours « true ».
  const { error } = await supabase.from('company_profile').update(values).eq('id', true);
  return error ? { ok: false, message: friendlyDbError(error) } : { ok: true, message: 'Fiche entreprise enregistrée.' };
}

async function saveValue(form: FormData): Promise<ActionResult> {
  const id = text(form.get('id'));
  const title = text(form.get('title'));
  if (!title) return { ok: false, message: 'Le nom de la valeur est obligatoire.', fieldErrors: { title: 'Obligatoire.' } };
  const values = {
    title,
    description: textOrNull(form.get('description')),
    publication: (text(form.get('publication')) || 'publie') as Enums<'publication_status'>,
  };
  if (id) {
    const { error } = await supabase.from('company_values').update(values).eq('id', id);
    return error ? { ok: false, message: friendlyDbError(error) } : { ok: true, message: 'Valeur enregistrée.' };
  }
  const { data: last } = await supabase.from('company_values').select('sort_order').order('sort_order', { ascending: false }).limit(1).maybeSingle();
  const { error } = await supabase.from('company_values').insert({ ...values, sort_order: (last?.sort_order ?? 0) + 10 });
  return error ? { ok: false, message: friendlyDbError(error) } : { ok: true, message: 'Valeur ajoutée.' };
}

export async function action({ request }: { request: Request }): Promise<ActionResult> {
  const form = await request.formData();
  switch (text(form.get('intent'))) {
    case 'profile':
      return saveProfile(form);
    case 'value-save':
      return saveValue(form);
    case 'value-move':
      return moveRow('company_values', text(form.get('id')), text(form.get('direction')) === 'up' ? 'up' : 'down');
    case 'value-delete': {
      const { error } = await supabase.from('company_values').delete().eq('id', text(form.get('id')));
      return error ? { ok: false, message: friendlyDbError(error) } : { ok: true, message: 'Valeur supprimée.' };
    }
    default:
      return { ok: false, message: 'Action invalide.' };
  }
}
