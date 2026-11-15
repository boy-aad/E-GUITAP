-- E-GUITAP — fonctions d'autorisation hors de l'API
-- is_staff() / is_admin() / write_audit_log() sont SECURITY DEFINER : dans le schéma public,
-- elles étaient appelables via /rest/v1/rpc (alerte Supabase 0029). Le schéma « private »
-- n'est pas exposé par l'API. Les règles RLS référencent les fonctions par identifiant :
-- elles suivent le déplacement sans modification.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

alter function public.is_staff() set schema private;
alter function public.is_admin() set schema private;
alter function public.write_audit_log() set schema private;
alter function public.set_updated_at() set schema private;
