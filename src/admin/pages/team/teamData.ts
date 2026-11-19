import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import type { Enums } from '../../../types/database';
import { requireAdmin } from '../../auth';
import { friendlyDbError } from '../../format';

// Équipe (PRD § 6.8), administrateurs uniquement. Liste et invitation passent par l'Edge Function
// admin-users (e-mails, dernière connexion, invitation : clé service_role côté serveur) ;
// rôle et activation sont modifiés en base (RLS « admin modifie », garde-fou du dernier administrateur).

export type ActionResult = { ok: boolean; message: string; fieldErrors?: Record<string, string> };
export type Member = {
  user_id: string;
  full_name: string;
  role: Enums<'staff_role'>;
  is_active: boolean;
  created_at: string;
  email: string | null;
  last_sign_in_at: string | null;
  pending: boolean;
};

export const ROLE_LABELS: Record<Enums<'staff_role'>, string> = { admin: 'Administrateur', editeur: 'Éditeur' };
export const ROLE_HINTS: Record<Enums<'staff_role'>, string> = {
  admin: 'Tout gérer, y compris les suppressions, les documents fonciers et l’équipe.',
  editeur: 'Créer et modifier les contenus et traiter les demandes, sans rien supprimer.',
};

type FunctionBody = { error?: string; fieldErrors?: Record<string, string> };

/** Message (et champs en erreur) renvoyés par l'Edge Function. */
async function functionError(error: unknown): Promise<FunctionBody> {
  if (error instanceof FunctionsHttpError) {
    try {
      return (await error.context.json()) as FunctionBody;
    } catch {
      /* réponse non JSON */
    }
  }
  return { error: 'Service de gestion de l’équipe indisponible. Vérifiez votre connexion et réessayez.' };
}

export async function loader() {
  const me = await requireAdmin();
  const { data, error } = await supabase.functions.invoke<{ members: Member[] }>('admin-users', { body: { action: 'list' } });
  if (error || !data) throw new Error((await functionError(error)).error);
  return { members: data.members, meId: me.userId };
}

export type TeamData = Awaited<ReturnType<typeof loader>>;

export async function action({ request }: { request: Request }): Promise<ActionResult> {
  const form = await request.formData();
  const intent = String(form.get('intent') ?? '');

  if (intent === 'invite') {
    const { error } = await supabase.functions.invoke('admin-users', {
      body: { action: 'invite', email: form.get('email'), fullName: form.get('full_name'), role: form.get('role') },
    });
    if (error) {
      const body = await functionError(error);
      return { ok: false, message: body.error ?? 'Invitation impossible.', fieldErrors: body.fieldErrors };
    }
    return { ok: true, message: `Invitation envoyée à ${String(form.get('email')).trim()}.` };
  }

  const userId = String(form.get('user_id') ?? '');
  if (intent === 'role') {
    const role = String(form.get('role')) as Enums<'staff_role'>;
    if (!(role in ROLE_LABELS)) return { ok: false, message: 'Rôle inconnu.' };
    const { error } = await supabase.from('staff_profiles').update({ role }).eq('user_id', userId);
    return error ? { ok: false, message: friendlyDbError(error) } : { ok: true, message: `Rôle modifié : ${ROLE_LABELS[role]}.` };
  }
  if (intent === 'active') {
    const active = form.get('active') === 'true';
    const { error } = await supabase.from('staff_profiles').update({ is_active: active }).eq('user_id', userId);
    return error ? { ok: false, message: friendlyDbError(error) } : { ok: true, message: active ? 'Accès réactivé.' : 'Accès désactivé.' };
  }
  return { ok: false, message: 'Opération inconnue.' };
}
