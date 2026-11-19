// E-GUITAP — gestion de l'équipe (PRD § 6.8), réservée aux administrateurs actifs.
//
// Actions (POST JSON) :
//   { action: 'list' }                                  membres + e-mail + dernière connexion
//   { action: 'invite', email, fullName, role }         invitation par e-mail + profil d'équipe
//                                                       (entrée du journal attribuée à l'administrateur)
//
// Le rôle et l'activation se modifient directement en base (RLS « admin modifie ») ;
// le trigger private.ensure_active_admin empêche de retirer le dernier administrateur actif.
//
// verify_jwt: true — la passerelle refuse les appels sans session ; la fonction vérifie en plus
// que l'appelant est un administrateur ACTIF (lecture de staff_profiles avec la clé service_role).
//
// Secrets : ALLOWED_ORIGINS (origines autorisées, séparées par des virgules, en plus de localhost).
// SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournis automatiquement par Supabase.

import { createClient } from 'npm:@supabase/supabase-js@2';

const LOCAL_ORIGINS = ['http://localhost:3000', 'http://localhost:4173'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLES = new Set(['admin', 'editeur']);

const allowedOrigins = new Set([
  ...LOCAL_ORIGINS,
  ...(Deno.env.get('ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
]);

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin && allowedOrigins.has(origin) ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    Vary: 'Origin',
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405, origin);
  if (!origin || !allowedOrigins.has(origin)) return json({ error: 'Origine non autorisée.' }, 403, origin);

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return json({ error: 'Service indisponible.' }, 503, origin);
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  // Appelant : session valide ET administrateur actif.
  const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  const { data: caller, error: callerError } = await admin.auth.getUser(token);
  if (callerError || !caller.user) return json({ error: 'Session expirée : reconnectez-vous.' }, 401, origin);
  const { data: me } = await admin.from('staff_profiles').select('role, is_active').eq('user_id', caller.user.id).maybeSingle();
  if (!me?.is_active || me.role !== 'admin') return json({ error: 'Action réservée aux administrateurs.' }, 403, origin);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Requête invalide.' }, 400, origin);
  }

  if (body.action === 'list') {
    const [{ data: profiles, error: pErr }, { data: users, error: uErr }] = await Promise.all([
      admin.from('staff_profiles').select('user_id, full_name, role, is_active, created_at').order('created_at'),
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    ]);
    if (pErr || uErr) return json({ error: 'Lecture de l’équipe impossible.' }, 500, origin);
    const byId = new Map(users.users.map((u) => [u.id, u]));
    const members = profiles.map((p) => {
      const u = byId.get(p.user_id);
      return {
        ...p,
        email: u?.email ?? null,
        last_sign_in_at: u?.last_sign_in_at ?? null,
        // Invitation envoyée mais jamais acceptée (aucun mot de passe défini).
        pending: Boolean(u && !u.last_sign_in_at && !u.email_confirmed_at),
      };
    });
    return json({ members }, 200, origin);
  }

  if (body.action === 'invite') {
    const email = String(body.email ?? '').trim().toLowerCase();
    const fullName = String(body.fullName ?? '').trim();
    const role = String(body.role ?? '');
    const fieldErrors: Record<string, string> = {};
    if (!EMAIL_RE.test(email) || email.length > 200) fieldErrors.email = 'Adresse e-mail invalide.';
    if (fullName.length < 2 || fullName.length > 120) fieldErrors.full_name = 'Indiquez le nom complet (2 à 120 caractères).';
    if (!ROLES.has(role)) fieldErrors.role = 'Rôle inconnu.';
    if (Object.keys(fieldErrors).length) return json({ error: 'Certains champs sont à corriger.', fieldErrors }, 400, origin);

    const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: `${origin}/admin/reinitialisation`,
    });
    if (inviteError || !invited.user) {
      const exists = /already|registered|exists/i.test(inviteError?.message ?? '');
      return json(
        exists
          ? { error: 'Un compte existe déjà avec cette adresse.', fieldErrors: { email: 'Adresse déjà utilisée.' } }
          : { error: `Invitation impossible : ${inviteError?.message ?? 'erreur inconnue'}` },
        exists ? 409 : 502,
        origin,
      );
    }
    const { error: insertError } = await admin.from('staff_profiles').insert({ user_id: invited.user.id, full_name: fullName, role });
    if (insertError) {
      // Pas de compte orphelin sans profil d'équipe.
      await admin.auth.admin.deleteUser(invited.user.id);
      return json({ error: 'Le profil d’équipe n’a pas pu être créé ; invitation annulée.' }, 500, origin);
    }
    // Journal : l'insertion faite avec la clé service_role n'a pas d'auteur ; on l'attribue à l'administrateur
    // qui invite (sinon elle serait masquée dans le journal, qui n'affiche que les actions de l'équipe).
    const { error: auditError } = await admin
      .from('audit_log')
      .update({ actor_id: caller.user.id })
      .eq('table_name', 'staff_profiles')
      .eq('row_id', invited.user.id)
      .eq('action', 'INSERT')
      .is('actor_id', null);
    if (auditError) console.error('Attribution du journal impossible :', auditError.message);
    return json({ ok: true }, 200, origin);
  }

  return json({ error: 'Action inconnue.' }, 400, origin);
});
