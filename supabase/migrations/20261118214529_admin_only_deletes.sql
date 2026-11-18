-- Suppressions réservées aux administrateurs (PRD § 6.5 et critère d'acceptation de la phase 6 :
-- « un éditeur ne peut rien supprimer, vérifié par RLS »).
--
-- Jusqu'ici, tout membre de l'équipe pouvait supprimer offres, catégories, valeurs, coordonnées,
-- slides, textes et médias. Les éditeurs gardent la création et la modification ; ils peuvent
-- retirer un contenu du site en le passant en « brouillon » ou « archivé ».
--
-- Restent supprimables par l'équipe, car ils font partie de la modification d'un projet :
-- land_project_objectives, land_project_milestones, land_project_media.

do $$
declare
  t text;
begin
  foreach t in array array[
    'activity_domains', 'activity_services', 'company_values', 'company_contacts',
    'hero_slides', 'content_blocks', 'media'
  ] loop
    execute format('drop policy %I on public.%I', t || ': équipe supprime', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select private.is_admin()))',
      t || ': admin supprime', t
    );
  end loop;
end;
$$;

-- Fichiers du bucket public-media : suppression par les administrateurs uniquement.
drop policy "public-media: équipe supprime" on storage.objects;
create policy "public-media: admin supprime" on storage.objects
  for delete to authenticated
  using (bucket_id = 'public-media' and (select private.is_admin()));

-- Une catégorie (domaine) contenant des offres ne peut pas être supprimée : la clé étrangère
-- activity_services.domain_id est en « on delete cascade », ce qui effacerait ses offres.
-- Il faut d'abord déplacer ou supprimer les offres.
create function private.prevent_domain_delete_with_offers()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  n integer;
begin
  select count(*) into n from public.activity_services s where s.domain_id = old.id;
  if n > 0 then
    raise exception 'Catégorie non vide : % offre(s) rattachée(s).', n
      using errcode = '23503', hint = 'Déplacez ou supprimez d''abord les offres de cette catégorie.';
  end if;
  return old;
end;
$$;
revoke execute on function private.prevent_domain_delete_with_offers() from public, anon, authenticated;

create trigger prevent_domain_delete_with_offers
  before delete on public.activity_domains
  for each row execute function private.prevent_domain_delete_with_offers();
