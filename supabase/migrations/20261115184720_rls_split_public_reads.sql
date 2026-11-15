-- E-GUITAP — correctif RLS
-- Les règles de lecture « to anon, authenticated » appelaient is_staff(), que le rôle anon
-- ne peut pas exécuter (permission refusée sur toute lecture publique).
-- Chaque lecture est séparée en deux règles : anon (sans fonction) et authenticated (équipe).
-- Une seule règle SELECT par rôle : pas de cumul de règles permissives.

-- ---------------------------------------------------------------------------
-- company_values
-- ---------------------------------------------------------------------------
drop policy "company_values: lecture publiée" on public.company_values;
create policy "company_values: lecture publique" on public.company_values
  for select to anon using (publication = 'publie');
create policy "company_values: lecture équipe" on public.company_values
  for select to authenticated using (publication = 'publie' or (select public.is_staff()));

-- ---------------------------------------------------------------------------
-- company_contacts
-- ---------------------------------------------------------------------------
drop policy "company_contacts: lecture publique" on public.company_contacts;
create policy "company_contacts: lecture publique" on public.company_contacts
  for select to anon using (is_public);
create policy "company_contacts: lecture équipe" on public.company_contacts
  for select to authenticated using (is_public or (select public.is_staff()));

-- ---------------------------------------------------------------------------
-- activity_domains / activity_services
-- ---------------------------------------------------------------------------
drop policy "activity_domains: lecture publiée" on public.activity_domains;
create policy "activity_domains: lecture publique" on public.activity_domains
  for select to anon using (publication = 'publie' and availability <> 'non_confirmee');
create policy "activity_domains: lecture équipe" on public.activity_domains
  for select to authenticated
  using ((publication = 'publie' and availability <> 'non_confirmee') or (select public.is_staff()));

drop policy "activity_services: lecture publiée" on public.activity_services;
create policy "activity_services: lecture publique" on public.activity_services
  for select to anon
  using (
    publication = 'publie' and availability <> 'non_confirmee'
    and exists (
      select 1 from public.activity_domains d
      where d.id = domain_id and d.publication = 'publie' and d.availability <> 'non_confirmee'
    )
  );
create policy "activity_services: lecture équipe" on public.activity_services
  for select to authenticated
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

-- ---------------------------------------------------------------------------
-- hero_slides / content_blocks
-- ---------------------------------------------------------------------------
drop policy "hero_slides: lecture active" on public.hero_slides;
create policy "hero_slides: lecture publique" on public.hero_slides
  for select to anon using (is_active);
create policy "hero_slides: lecture équipe" on public.hero_slides
  for select to authenticated using (is_active or (select public.is_staff()));

drop policy "content_blocks: lecture publiée" on public.content_blocks;
create policy "content_blocks: lecture publique" on public.content_blocks
  for select to anon using (publication = 'publie');
create policy "content_blocks: lecture équipe" on public.content_blocks
  for select to authenticated using (publication = 'publie' or (select public.is_staff()));

-- ---------------------------------------------------------------------------
-- Projets fonciers et tables liées
-- ---------------------------------------------------------------------------
drop policy "land_projects: lecture publiée" on public.land_projects;
create policy "land_projects: lecture publique" on public.land_projects
  for select to anon using (publication = 'publie');
create policy "land_projects: lecture équipe" on public.land_projects
  for select to authenticated using (publication = 'publie' or (select public.is_staff()));

drop policy "land_project_objectives: lecture publiée" on public.land_project_objectives;
create policy "land_project_objectives: lecture publique" on public.land_project_objectives
  for select to anon
  using (exists (select 1 from public.land_projects p where p.id = project_id and p.publication = 'publie'));
create policy "land_project_objectives: lecture équipe" on public.land_project_objectives
  for select to authenticated
  using (
    exists (select 1 from public.land_projects p where p.id = project_id and p.publication = 'publie')
    or (select public.is_staff())
  );

drop policy "land_project_milestones: lecture publique" on public.land_project_milestones;
create policy "land_project_milestones: lecture publique" on public.land_project_milestones
  for select to anon
  using (
    is_public
    and exists (select 1 from public.land_projects p where p.id = project_id and p.publication = 'publie')
  );
create policy "land_project_milestones: lecture équipe" on public.land_project_milestones
  for select to authenticated
  using (
    (is_public and exists (
      select 1 from public.land_projects p where p.id = project_id and p.publication = 'publie'
    ))
    or (select public.is_staff())
  );

drop policy "land_project_media: lecture publiée" on public.land_project_media;
create policy "land_project_media: lecture publique" on public.land_project_media
  for select to anon
  using (exists (select 1 from public.land_projects p where p.id = project_id and p.publication = 'publie'));
create policy "land_project_media: lecture équipe" on public.land_project_media
  for select to authenticated
  using (
    exists (select 1 from public.land_projects p where p.id = project_id and p.publication = 'publie')
    or (select public.is_staff())
  );
