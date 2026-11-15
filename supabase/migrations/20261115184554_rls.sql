-- E-GUITAP — droits d'accès et règles RLS
-- Public (anon) : lecture du contenu publié uniquement.
-- Équipe (authenticated + staff_profiles actif) : lecture/écriture du contenu.
-- Admin : gestion de l'équipe, documents fonciers, suppressions sensibles.
-- Les demandes (inquiries) seront créées par une Edge Function (étape D), pas par anon.

-- ============================================================================
-- RLS activée partout
-- ============================================================================
alter table public.staff_profiles          enable row level security;
alter table public.audit_log               enable row level security;
alter table public.company_profile         enable row level security;
alter table public.company_values          enable row level security;
alter table public.company_contacts        enable row level security;
alter table public.media                   enable row level security;
alter table public.activity_domains        enable row level security;
alter table public.activity_services       enable row level security;
alter table public.hero_slides             enable row level security;
alter table public.content_blocks          enable row level security;
alter table public.land_projects           enable row level security;
alter table public.land_project_objectives enable row level security;
alter table public.land_project_milestones enable row level security;
alter table public.land_project_media      enable row level security;
alter table public.land_project_documents  enable row level security;
alter table public.inquiries               enable row level security;

-- ============================================================================
-- Privilèges : on retire les droits par défaut, puis on accorde le strict nécessaire
-- ============================================================================
revoke all on all tables in schema public from anon, authenticated;

grant select on
  public.company_profile, public.company_values, public.company_contacts, public.media,
  public.activity_domains, public.activity_services, public.hero_slides, public.content_blocks,
  public.land_project_objectives, public.land_project_milestones, public.land_project_media
to anon;

-- Projets fonciers : colonnes publiques seulement (ni coordonnées GPS, ni statut documentaire).
grant select (
  id, slug, name, prefecture, sous_prefecture, locality, area_ha, area_is_declared, summary,
  description, development_status, commercial_status, publication, is_featured, sort_order,
  created_at, updated_at
) on public.land_projects to anon;

-- L'équipe est authentifiée : droits complets, filtrés par les règles RLS ci-dessous.
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke insert, update, delete on public.audit_log from authenticated;

-- ============================================================================
-- Équipe et journal
-- ============================================================================
create policy "staff: lire son profil ou admin" on public.staff_profiles
  for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));

create policy "staff: admin ajoute" on public.staff_profiles
  for insert to authenticated with check ((select public.is_admin()));
create policy "staff: admin modifie" on public.staff_profiles
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "staff: admin retire" on public.staff_profiles
  for delete to authenticated using ((select public.is_admin()));

create policy "audit: lecture admin" on public.audit_log
  for select to authenticated
  using ((select public.is_admin()));

-- ============================================================================
-- Contenu public (lecture anon + équipe ; écriture équipe)
-- ============================================================================
create policy "company_profile: lecture publique" on public.company_profile
  for select to anon, authenticated using (true);
create policy "company_profile: équipe modifie" on public.company_profile
  for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));

create policy "company_values: lecture publiée" on public.company_values
  for select to anon, authenticated
  using (publication = 'publie' or (select public.is_staff()));

create policy "company_contacts: lecture publique" on public.company_contacts
  for select to anon, authenticated
  using (is_public or (select public.is_staff()));

create policy "media: lecture publique" on public.media
  for select to anon, authenticated using (true);

create policy "activity_domains: lecture publiée" on public.activity_domains
  for select to anon, authenticated
  using (
    (publication = 'publie' and availability <> 'non_confirmee')
    or (select public.is_staff())
  );

create policy "activity_services: lecture publiée" on public.activity_services
  for select to anon, authenticated
  using (
    (
      publication = 'publie' and availability <> 'non_confirmee'
      and exists (
        select 1 from public.activity_domains d
        where d.id = domain_id and d.publication = 'publie' and d.availability <> 'non_confirmee'
      )
    )
    or (select public.is_staff())
  );

create policy "hero_slides: lecture active" on public.hero_slides
  for select to anon, authenticated
  using (is_active or (select public.is_staff()));

create policy "content_blocks: lecture publiée" on public.content_blocks
  for select to anon, authenticated
  using (publication = 'publie' or (select public.is_staff()));

-- ============================================================================
-- Projets fonciers
-- ============================================================================
create policy "land_projects: lecture publiée" on public.land_projects
  for select to anon, authenticated
  using (publication = 'publie' or (select public.is_staff()));
create policy "land_projects: équipe écrit" on public.land_projects
  for insert to authenticated with check ((select public.is_staff()));
create policy "land_projects: équipe modifie" on public.land_projects
  for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "land_projects: admin supprime" on public.land_projects
  for delete to authenticated using ((select public.is_admin()));

create policy "land_project_objectives: lecture publiée" on public.land_project_objectives
  for select to anon, authenticated
  using (
    exists (select 1 from public.land_projects p where p.id = project_id and p.publication = 'publie')
    or (select public.is_staff())
  );

create policy "land_project_milestones: lecture publique" on public.land_project_milestones
  for select to anon, authenticated
  using (
    (is_public and exists (
      select 1 from public.land_projects p where p.id = project_id and p.publication = 'publie'
    ))
    or (select public.is_staff())
  );

create policy "land_project_media: lecture publiée" on public.land_project_media
  for select to anon, authenticated
  using (
    exists (select 1 from public.land_projects p where p.id = project_id and p.publication = 'publie')
    or (select public.is_staff())
  );

-- Documents fonciers : aucune règle pour anon (aucun accès).
create policy "land_project_documents: équipe lit" on public.land_project_documents
  for select to authenticated using ((select public.is_staff()));
create policy "land_project_documents: admin écrit" on public.land_project_documents
  for insert to authenticated with check ((select public.is_admin()));
create policy "land_project_documents: admin modifie" on public.land_project_documents
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "land_project_documents: admin supprime" on public.land_project_documents
  for delete to authenticated using ((select public.is_admin()));

-- ============================================================================
-- Demandes : équipe uniquement (création publique via Edge Function à l'étape D)
-- ============================================================================
create policy "inquiries: équipe lit" on public.inquiries
  for select to authenticated using ((select public.is_staff()));
create policy "inquiries: équipe modifie" on public.inquiries
  for update to authenticated
  using ((select public.is_staff())) with check ((select public.is_staff()));
create policy "inquiries: admin supprime" on public.inquiries
  for delete to authenticated using ((select public.is_admin()));

-- ============================================================================
-- Écriture par l'équipe : une règle par opération (évite le cumul avec les règles de lecture)
-- ============================================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'company_values', 'company_contacts', 'media', 'activity_domains', 'activity_services',
    'hero_slides', 'content_blocks', 'land_project_objectives', 'land_project_milestones', 'land_project_media'
  ] loop
    execute format('create policy %I on public.%I for insert to authenticated with check ((select public.is_staff()))', t || ': équipe ajoute', t);
    execute format('create policy %I on public.%I for update to authenticated using ((select public.is_staff())) with check ((select public.is_staff()))', t || ': équipe modifie', t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select public.is_staff()))', t || ': équipe supprime', t);
  end loop;
end;
$$;

-- ============================================================================
-- Tables créées plus tard : pas de droits par défaut pour anon
-- ============================================================================
alter default privileges in schema public revoke all on tables from anon;
