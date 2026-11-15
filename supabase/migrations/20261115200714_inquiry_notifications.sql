-- E-GUITAP — demandes de renseignements : suivi de la notification e-mail
-- Les demandes sont créées par l'Edge Function submit-inquiry (clé service_role),
-- jamais directement par le rôle anon.

alter table public.inquiries
  add column notified_at        timestamptz,  -- e-mail de notification envoyé
  add column notification_error text;         -- dernier échec d'envoi (affiché dans l'administration)

-- Limite anti-abus : nombre de demandes récentes pour un même numéro.
create index inquiries_phone_recent_idx on public.inquiries (phone, created_at desc);
