-- Précisions facultatives d'une demande de devis (PRD v2 § 5.4) :
-- lieu, délai souhaité, quantité ou surface. Validées par l'Edge Function submit-inquiry
-- (clés autorisées uniquement, 300 caractères maximum chacune) ; garde-fou SQL ci-dessous.
-- Note : inquiries.assigned_to existe déjà (migration schema) et n'est pas recréé.
alter table public.inquiries
  add column request_details jsonb
    check (
      request_details is null
      or (jsonb_typeof(request_details) = 'object' and octet_length(request_details::text) <= 2048)
    );

comment on column public.inquiries.request_details is
  'Précisions d''une demande de devis : {lieu, delai, quantite} ; aucun prix ni budget.';
