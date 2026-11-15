import { redirect } from 'react-router';
import { supabase } from '../lib/supabase';
import type { Tables } from '../types/database';

export type StaffProfile = Pick<Tables<'staff_profiles'>, 'full_name' | 'role' | 'is_active'>;

export type AdminSession = {
  userId: string;
  email: string | null;
  staff: StaffProfile;
};

export const LOGIN_PATH = '/admin/connexion';

/**
 * Garde des pages d'administration : session Supabase valide ET profil d'équipe actif.
 * Un compte authentifié sans profil (ou désactivé) est déconnecté. Les règles RLS
 * restent la vraie protection des données ; cette garde évite d'afficher une interface vide.
 */
export async function requireStaff(request: Request): Promise<AdminSession> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const next = new URL(request.url).pathname;
  if (!session) throw redirect(`${LOGIN_PATH}?suite=${encodeURIComponent(next)}`);

  const { data: staff, error } = await supabase
    .from('staff_profiles')
    .select('full_name, role, is_active')
    .eq('user_id', session.user.id)
    .maybeSingle();
  if (error) throw new Error(`Vérification du compte impossible : ${error.message}`);
  if (!staff?.is_active) {
    await supabase.auth.signOut();
    throw redirect(`${LOGIN_PATH}?erreur=acces`);
  }
  return { userId: session.user.id, email: session.user.email ?? null, staff };
}

/** Lien de retour sûr après connexion : uniquement une page de l'administration. */
export function safeNext(value: string | null): string {
  return value && value.startsWith('/admin') && !value.startsWith('//') ? value : '/admin';
}
