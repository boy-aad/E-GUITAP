// E-GUITAP — réception des demandes de renseignements et de devis
//
// 1. Vérifie le captcha Cloudflare Turnstile.
// 2. Valide les champs et applique une limite anti-abus.
// 3. Enregistre la demande dans public.inquiries (clé service_role : anon n'a aucun droit d'écriture).
// 4. Envoie la notification e-mail via Resend. Un échec d'envoi n'annule pas la demande :
//    il est consigné dans inquiries.notification_error et visible dans l'administration.
//
// Secrets (Supabase > Edge Functions > Secrets) :
//   TURNSTILE_SECRET_KEY  clé secrète du widget Turnstile            (obligatoire)
//   RESEND_API_KEY        clé Resend « Sending access »              (obligatoire)
//   RESEND_FROM           expéditeur, défaut « E-GUITAP <onboarding@resend.dev> »
//   INQUIRY_NOTIFY_TO     destinataire ; défaut : e-mail publié dans company_contacts
//   ALLOWED_ORIGINS       origines autorisées, séparées par des virgules (en plus de localhost)
// SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont fournis automatiquement par Supabase.

import { createClient } from 'npm:@supabase/supabase-js@2';

const LOCAL_ORIGINS = ['http://localhost:3000', 'http://localhost:4173'];
const MAX_PER_PHONE_PER_HOUR = 3;

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
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

type Payload = {
  fullName: string;
  organization: string;
  phone: string;
  email: string;
  topic: string;
  message: string;
  consent: boolean;
  turnstileToken: string;
  sourcePage: string;
  website: string; // pot de miel : doit rester vide
  requestDetails: RequestDetails | null;
};

/** Précisions d'une demande de devis : clés autorisées uniquement, 300 caractères chacune. Aucun prix. */
type RequestDetails = { lieu?: string; delai?: string; quantite?: string };
const DETAIL_KEYS = ['lieu', 'delai', 'quantite'] as const;
const DELAY_VALUES = new Set(['urgent', 'moins_1_mois', '1_3_mois', 'plus_3_mois', 'a_definir']);
const DETAIL_LABELS: Record<(typeof DETAIL_KEYS)[number], string> = {
  lieu: 'Lieu du chantier ou de livraison',
  delai: 'Délai souhaité',
  quantite: 'Quantité ou surface estimée',
};
const DELAY_LABELS: Record<string, string> = {
  urgent: 'Urgent',
  moins_1_mois: 'Moins d’un mois',
  '1_3_mois': '1 à 3 mois',
  plus_3_mois: 'Plus de 3 mois',
  a_definir: 'À définir',
};

function parseDetails(raw: unknown): RequestDetails | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const r = raw as Record<string, unknown>;
  const out: RequestDetails = {};
  for (const key of DETAIL_KEYS) {
    const v = str(r[key], 300);
    if (!v) continue;
    if (key === 'delai' && !DELAY_VALUES.has(v)) continue;
    out[key] = v;
  }
  return Object.keys(out).length ? out : null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function parsePayload(raw: unknown): { data?: Payload; error?: string } {
  if (!raw || typeof raw !== 'object') return { error: 'Requête invalide.' };
  const r = raw as Record<string, unknown>;
  const data: Payload = {
    fullName: str(r.fullName, 200),
    organization: str(r.organization, 200),
    phone: str(r.phone, 50),
    email: str(r.email, 320),
    topic: str(r.topic, 200),
    message: str(r.message, 5000),
    consent: r.consent === true,
    turnstileToken: str(r.turnstileToken, 4096),
    sourcePage: str(r.sourcePage, 300),
    website: str(r.website, 200),
    requestDetails: parseDetails(r.requestDetails),
  };
  if (!data.fullName) return { error: 'Veuillez indiquer votre nom.' };
  if (!data.phone) return { error: 'Veuillez indiquer un numéro de téléphone.' };
  if (data.email && !EMAIL_RE.test(data.email)) return { error: "L'adresse e-mail ne semble pas valide." };
  if (!data.message) return { error: 'Veuillez décrire votre demande.' };
  if (!data.consent) return { error: 'Votre accord est nécessaire pour traiter la demande.' };
  if (!data.turnstileToken) return { error: 'Vérification anti-robot manquante.' };
  return { data };
}

async function verifyTurnstile(secret: string, token: string, ip: string | null) {
  const form = new FormData();
  form.append('secret', secret);
  form.append('response', token);
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  const out = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
  return out;
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buildEmail(p: {
  id: string;
  subjectLabel: string;
  fullName: string;
  organization: string;
  phone: string;
  email: string;
  message: string;
  sourcePage: string;
  isQuote: boolean;
  requestDetails: RequestDetails | null;
}) {
  const title = p.isQuote ? 'Nouvelle demande de devis' : 'Nouvelle demande de renseignements';
  const details: [string, string][] = DETAIL_KEYS.flatMap((k) => {
    const v = p.requestDetails?.[k];
    return v ? [[DETAIL_LABELS[k], k === 'delai' ? (DELAY_LABELS[v] ?? v) : v] as [string, string]] : [];
  });
  const rows: [string, string][] = [
    [p.isQuote ? 'Offre' : 'Sujet', p.subjectLabel],
    ...details,
    ['Nom', p.fullName],
    ['Organisation', p.organization || '—'],
    ['Téléphone', p.phone],
    ['E-mail', p.email || '—'],
    ['Page', p.sourcePage || '—'],
  ];
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#F5F1E8;font-family:Arial,sans-serif;color:#102C50">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:6px;overflow:hidden">
<tr><td style="background:#102C50;color:#ffffff;padding:20px 24px;font-size:18px;font-weight:bold">E-GUITAP — ${title}</td></tr>
<tr><td style="padding:20px 24px"><table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="font-size:14px">
${rows.map(([k, v]) => `<tr><td style="color:#44505F;width:130px;vertical-align:top">${k}</td><td style="font-weight:bold">${escapeHtml(v)}</td></tr>`).join('')}
</table>
<p style="margin:20px 0 6px;color:#44505F;font-size:13px">Message</p>
<div style="white-space:pre-wrap;font-size:14px;line-height:1.5;border-left:3px solid #C6A15B;padding-left:12px">${escapeHtml(p.message)}</div>
<p style="margin-top:24px;color:#44505F;font-size:12px">Référence : ${p.id}. La demande est également consultable dans l'administration du site.</p>
</td></tr></table></td></tr></table></body></html>`;
  const text = [
    `E-GUITAP — ${title}`,
    '',
    ...rows.map(([k, v]) => `${k} : ${v}`),
    '',
    p.message,
    '',
    `Référence : ${p.id}`,
  ].join('\n');
  return { html, text };
}

Deno.serve(async (req) => {
  const origin = req.headers.get('Origin');
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) });
  if (req.method !== 'POST') return json({ error: 'Méthode non autorisée.' }, 405, origin);
  if (origin && !allowedOrigins.has(origin)) return json({ error: 'Origine non autorisée.' }, 403, origin);

  const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY');
  const resendKey = Deno.env.get('RESEND_API_KEY');
  if (!turnstileSecret || !resendKey) {
    console.error('Configuration incomplète : TURNSTILE_SECRET_KEY ou RESEND_API_KEY manquant.');
    return json({ error: 'Le service est momentanément indisponible.' }, 503, origin);
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: 'Requête invalide.' }, 400, origin);
  }
  const { data: p, error } = parsePayload(raw);
  if (!p) return json({ error }, 400, origin);

  // Pot de miel rempli : on répond « succès » sans rien enregistrer.
  if (p.website) return json({ ok: true }, 200, origin);

  const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const captcha = await verifyTurnstile(turnstileSecret, p.turnstileToken, ip);
  if (!captcha.success) {
    console.warn('Turnstile refusé', captcha['error-codes']);
    return json({ error: 'La vérification anti-robot a échoué. Merci de réessayer.' }, 400, origin);
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
    auth: { persistSession: false },
  });

  // Limite anti-abus par numéro de téléphone.
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await admin
    .from('inquiries')
    .select('id', { count: 'exact', head: true })
    .eq('phone', p.phone)
    .gte('created_at', since);
  if ((count ?? 0) >= MAX_PER_PHONE_PER_HOUR) {
    return json({ error: 'Plusieurs demandes ont déjà été envoyées. Merci de réessayer plus tard.' }, 429, origin);
  }

  // Sujet : offre, domaine ou projet publié, sinon demande générale.
  let type: 'contact' | 'renseignement_activite' | 'renseignement_projet' | 'demande_devis' = 'contact';
  let domainId: string | null = null;
  let serviceId: string | null = null;
  let projectId: string | null = null;
  let subjectLabel = 'Demande générale';
  const [kind, slug] = p.topic.split(':');
  if (kind === 'offer' && slug) {
    const { data } = await admin
      .from('activity_services')
      .select('id, title, domain_id, activity_domains!inner (publication)')
      .eq('slug', slug)
      .eq('publication', 'publie')
      .eq('activity_domains.publication', 'publie')
      .maybeSingle();
    if (data) {
      type = 'demande_devis';
      serviceId = data.id;
      domainId = data.domain_id;
      subjectLabel = data.title;
    }
  } else if (kind === 'domain' && slug) {
    const { data } = await admin
      .from('activity_domains')
      .select('id, title')
      .eq('slug', slug)
      .eq('publication', 'publie')
      .maybeSingle();
    if (data) {
      type = 'renseignement_activite';
      domainId = data.id;
      subjectLabel = data.title;
    }
  } else if (kind === 'project' && slug) {
    const { data } = await admin
      .from('land_projects')
      .select('id, name')
      .eq('slug', slug)
      .eq('publication', 'publie')
      .maybeSingle();
    if (data) {
      type = 'renseignement_projet';
      projectId = data.id;
      subjectLabel = `Projet foncier — ${data.name}`;
    }
  }

  const { data: inserted, error: insertError } = await admin
    .from('inquiries')
    .insert({
      type,
      full_name: p.fullName,
      organization: p.organization || null,
      phone: p.phone,
      email: p.email || null,
      domain_id: domainId,
      service_id: serviceId,
      land_project_id: projectId,
      request_details: type === 'demande_devis' ? p.requestDetails : null,
      subject: subjectLabel,
      message: p.message,
      consent: true,
      source_page: p.sourcePage || null,
    })
    .select('id')
    .single();
  if (insertError || !inserted) {
    console.error('Insertion impossible', insertError);
    return json({ error: "La demande n'a pas pu être enregistrée. Merci de réessayer." }, 500, origin);
  }

  // Notification e-mail (ne bloque pas la réponse en cas d'échec).
  let notifyTo = Deno.env.get('INQUIRY_NOTIFY_TO') ?? '';
  if (!notifyTo) {
    const { data } = await admin
      .from('company_contacts')
      .select('raw_value')
      .eq('kind', 'email')
      .order('sort_order')
      .limit(1)
      .maybeSingle();
    notifyTo = data?.raw_value ?? '';
  }

  let notificationError: string | null = notifyTo ? null : 'Aucune adresse de notification configurée.';
  if (notifyTo) {
    const isQuote = type === 'demande_devis';
    const { html, text } = buildEmail({ id: inserted.id, subjectLabel, ...p, isQuote });
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `inquiry-${inserted.id}`,
        },
        body: JSON.stringify({
          from: Deno.env.get('RESEND_FROM') ?? 'E-GUITAP <onboarding@resend.dev>',
          to: [notifyTo],
          subject: isQuote ? `Demande de devis — ${subjectLabel}` : `Nouvelle demande — ${subjectLabel} — ${p.fullName}`,
          html,
          text,
          ...(p.email ? { reply_to: p.email } : {}),
        }),
      });
      if (!res.ok) notificationError = `Resend ${res.status} : ${(await res.text()).slice(0, 300)}`;
    } catch (e) {
      notificationError = `Resend injoignable : ${String(e).slice(0, 300)}`;
    }
  }

  await admin
    .from('inquiries')
    .update(
      notificationError
        ? { notification_error: notificationError }
        : { notified_at: new Date().toISOString(), notification_error: null },
    )
    .eq('id', inserted.id);
  if (notificationError) console.error('Notification non envoyée', notificationError);

  return json({ ok: true, id: inserted.id }, 200, origin);
});
