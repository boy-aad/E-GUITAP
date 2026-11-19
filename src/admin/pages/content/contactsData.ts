import { supabase } from '../../../lib/supabase';
import { SOCIAL_NETWORK_NAMES, socialNetworkOf } from '../../../lib/social';
import type { Enums, TablesInsert } from '../../../types/database';
import { friendlyDbError } from '../../format';
import { text, type ActionResult } from './shared';

// Coordonnées (company_contacts) et position du siège (company_profile.office_lat / office_lng).
// Le site public affiche la première coordonnée publique de chaque type et tous les réseaux
// publics en https. La forme « brute » (lien tel:, wa.me, mailto:) est calculée ici.

export type ContactKind = Exclude<Enums<'contact_kind'>, 'social'>;
export const CONTACT_KINDS: { kind: ContactKind; label: string; hint: string; placeholder: string }[] = [
  { kind: 'phone', label: 'Téléphone', hint: 'Format international, ex. +224 621 00 00 00.', placeholder: '+224 …' },
  { kind: 'whatsapp', label: 'WhatsApp', hint: 'Numéro WhatsApp au format international (indicatif compris).', placeholder: '+224 …' },
  { kind: 'email', label: 'E-mail', hint: 'Adresse affichée et utilisée pour les liens « écrire ».', placeholder: 'contact@…' },
  { kind: 'address', label: 'Adresse', hint: 'Adresse du siège, telle qu’affichée.', placeholder: 'Dubréka, République de Guinée' },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function loader() {
  const [contacts, profile] = await Promise.all([
    supabase.from('company_contacts').select('id, kind, label, value, raw_value, is_public, sort_order').order('sort_order'),
    supabase.from('company_profile').select('office_lat, office_lng').single(),
  ]);
  if (contacts.error) throw new Error(contacts.error.message);
  if (profile.error) throw new Error(profile.error.message);
  return { contacts: contacts.data, office: profile.data };
}

export type ContactsData = Awaited<ReturnType<typeof loader>>;
export type ContactRow = ContactsData['contacts'][number];

/** Forme brute d'une coordonnée, ou un message d'erreur. */
function rawValue(kind: ContactKind, value: string): { raw: string } | { error: string } {
  const digits = value.replace(/\D/g, '');
  switch (kind) {
    case 'phone':
      if (digits.length < 8) return { error: 'Numéro incomplet.' };
      return { raw: /^\s*(\+|00)/.test(value) ? `+${digits.replace(/^00/, '')}` : digits };
    case 'whatsapp':
      if (digits.length < 10) return { error: 'Indiquez le numéro complet avec l’indicatif (ex. +224…).' };
      return { raw: digits.replace(/^00/, '') };
    case 'email':
      return EMAIL_RE.test(value) ? { raw: value.toLowerCase() } : { error: 'Adresse e-mail invalide.' };
    case 'address':
      return { raw: value };
  }
}

/** Coordonnée décimale facultative, dans une plage donnée. */
function coordinate(value: string, max: number): number | null | 'invalide' {
  if (!value) return null;
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) && Math.abs(n) <= max ? Math.round(n * 1e6) / 1e6 : 'invalide';
}

export async function action({ request }: { request: Request }): Promise<ActionResult> {
  const form = await request.formData();
  // Rôle lu en base (la RLS refuserait de toute façon une suppression par un éditeur).
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const { data: me } = await supabase.from('staff_profiles').select('role').eq('user_id', session?.user.id ?? '').maybeSingle();
  const isAdmin = me?.role === 'admin';
  const { data: existing, error: readError } = await supabase.from('company_contacts').select('id, kind, sort_order');
  if (readError) return { ok: false, message: friendlyDbError(readError) };
  const known = new Map(existing.map((c) => [c.id, c]));
  const fieldErrors: Record<string, string> = {};
  const updates: { id: string; values: Partial<TablesInsert<'company_contacts'>> }[] = [];
  const inserts: TablesInsert<'company_contacts'>[] = [];
  const deletes: string[] = [];
  let nextOrder = Math.max(0, ...existing.map((c) => c.sort_order)) + 10;

  // Coordonnées simples : une par type.
  for (const { kind, label } of CONTACT_KINDS) {
    const id = text(form.get(`${kind}_id`));
    const value = text(form.get(`${kind}_value`));
    const isPublic = form.get(`${kind}_public`) === 'on';
    if (!value) {
      if (id && isAdmin) deletes.push(id);
      else if (id) fieldErrors[`${kind}_value`] = 'Pour retirer cette coordonnée du site, décochez « Afficher sur le site ».';
      continue;
    }
    const raw = rawValue(kind, value);
    if ('error' in raw) {
      fieldErrors[`${kind}_value`] = raw.error;
      continue;
    }
    const values = { kind, label, value, raw_value: raw.raw, is_public: isPublic };
    if (id && known.has(id)) updates.push({ id, values });
    else inserts.push({ ...values, sort_order: (nextOrder += 10) });
  }

  // Réseaux sociaux : liste libre, adresse https obligatoire.
  const socialIds = form.getAll('social_id').map(String);
  const socialUrls = form.getAll('social_url').map((v) => String(v).trim());
  const socialPublic = new Set(form.getAll('social_public').map(String));
  const kept = new Set<string>();
  socialUrls.forEach((url, i) => {
    const id = socialIds[i] ?? '';
    if (!url) return;
    if (!/^https:\/\/[^\s]+\.[^\s]+$/i.test(url)) {
      fieldErrors[`social_${i}`] = 'Adresse complète en https://… (ex. https://www.facebook.com/…).';
      return;
    }
    const values = { kind: 'social' as const, label: SOCIAL_NETWORK_NAMES[socialNetworkOf(url)], value: url, raw_value: url, is_public: socialPublic.has(String(i)) };
    if (id && known.has(id)) {
      kept.add(id);
      updates.push({ id, values });
    } else inserts.push({ ...values, sort_order: (nextOrder += 10) });
  });
  for (const c of existing) {
    if (c.kind !== 'social' || kept.has(c.id)) continue;
    if (isAdmin) deletes.push(c.id);
    else fieldErrors.social = 'Seul un administrateur peut supprimer un réseau : décochez « Afficher » pour le masquer.';
  }

  // Position du siège : les deux valeurs ensemble, ou aucune.
  const lat = coordinate(text(form.get('office_lat')), 90);
  const lng = coordinate(text(form.get('office_lng')), 180);
  if (lat === 'invalide') fieldErrors.office_lat = 'Latitude entre -90 et 90 (ex. 9.8706).';
  if (lng === 'invalide') fieldErrors.office_lng = 'Longitude entre -180 et 180 (ex. -13.5236).';
  if (lat !== 'invalide' && lng !== 'invalide' && (lat === null) !== (lng === null)) fieldErrors.office_lat = 'Renseignez la latitude et la longitude, ou aucune des deux.';

  if (Object.keys(fieldErrors).length) return { ok: false, message: 'Certains champs sont à corriger.', fieldErrors };

  const results = await Promise.all([
    ...updates.map((u) => supabase.from('company_contacts').update(u.values).eq('id', u.id)),
    ...(inserts.length ? [supabase.from('company_contacts').insert(inserts)] : []),
    ...(deletes.length ? [supabase.from('company_contacts').delete().in('id', deletes)] : []),
    supabase
      .from('company_profile')
      .update({ office_lat: lat as number | null, office_lng: lng as number | null })
      .eq('id', true),
  ]);
  const failed = results.find((r) => r.error);
  return failed?.error ? { ok: false, message: friendlyDbError(failed.error) } : { ok: true, message: 'Coordonnées enregistrées.' };
}
