-- E-GUITAP — recette des règles RLS (PRD § 8 et phase 7) pour anon, éditeur et administrateur.
--
-- AUCUNE DONNÉE N'EST MODIFIÉE : chaque écriture est exécutée dans un sous-bloc systématiquement
-- annulé (exception interne) ; seul le nombre de lignes touchées (ou le code d'erreur) est retenu.
--
-- Utilisation : remplacer les deux identifiants ci-dessous (un éditeur actif, un administrateur actif),
-- puis exécuter le script entier dans l'éditeur SQL de Supabase. Le résultat liste chaque contrôle
-- avec le résultat attendu, obtenu et « ok ».
--
-- Attendus : « >0 » au moins une ligne ; « =0 » aucune ligne (filtrée par la RLS) ;
-- « refus » erreur de droits ; « =0|refus » l'un ou l'autre ; « accès » lecture permise (nombre quelconque).

create temp table if not exists rls_results (n int, profil text, controle text, attendu text, obtenu text, ok boolean);
truncate rls_results;

do $$
declare
  editor_id constant uuid := 'ff3fdab9-925d-4f73-9f1f-2a735d461a18';  -- éditeur actif
  admin_id  constant uuid := '610bfcaa-d5ab-400c-943e-90e6d2583225';  -- administrateur actif
  t record;
  cnt bigint;
  got text;
  i int := 0;
begin
  for t in
    select * from (values
      -- Visiteur (anon) : uniquement le publié, aucune donnée interne.
      ('anon', 'offres publiées lisibles', 'select count(*) from public.activity_services', 'count', '>0'),
      ('anon', 'offres non publiées invisibles', 'select count(*) from public.activity_services where publication <> ''publie''', 'count', '=0'),
      ('anon', 'projets non publiés invisibles', 'select count(*) from public.land_projects where publication <> ''publie''', 'count', '=0'),
      ('anon', 'coordonnées GPS des projets refusées', 'select count(approx_lat) from public.land_projects', 'count', 'refus'),
      ('anon', 'statut documentaire refusé', 'select count(document_status) from public.land_projects', 'count', 'refus'),
      ('anon', 'documents fonciers inaccessibles', 'select count(*) from public.land_project_documents', 'count', '=0|refus'),
      ('anon', 'fichiers land-documents inaccessibles', 'select count(*) from storage.objects where bucket_id = ''land-documents''', 'count', '=0|refus'),
      ('anon', 'demandes inaccessibles', 'select count(*) from public.inquiries', 'count', '=0|refus'),
      ('anon', 'journal inaccessible', 'select count(*) from public.audit_log', 'count', '=0|refus'),
      ('anon', 'équipe inaccessible', 'select count(*) from public.staff_profiles', 'count', '=0|refus'),
      ('anon', 'jalons internes invisibles', 'select count(*) from public.land_project_milestones where not is_public', 'count', '=0'),
      ('anon', 'textes non publiés invisibles', 'select count(*) from public.content_blocks where publication <> ''publie''', 'count', '=0'),
      ('anon', 'création directe de demande refusée', 'insert into public.inquiries (type, full_name, phone, message, consent) values (''contact'', ''Test'', ''+224000000'', ''Test'', true)', 'write', 'refus'),
      ('anon', 'modification d''offre impossible', 'update public.activity_services set title = title', 'write', '=0|refus'),
      -- Éditeur : lit et modifie le contenu, ne supprime rien, ne voit ni journal ni documents en écriture.
      ('editeur', 'demandes lisibles', 'select count(*) from public.inquiries', 'count', 'accès'),
      ('editeur', 'modification d''offre permise', 'update public.activity_services set title = title where id = (select id from public.activity_services limit 1)', 'write', '>0'),
      ('editeur', 'suppression d''offre impossible', 'delete from public.activity_services where id = (select id from public.activity_services limit 1)', 'write', '=0'),
      ('editeur', 'suppression de catégorie impossible', 'delete from public.activity_domains where id = (select id from public.activity_domains limit 1)', 'write', '=0'),
      ('editeur', 'suppression de média impossible', 'delete from public.media where id = (select id from public.media limit 1)', 'write', '=0'),
      ('editeur', 'suppression de valeur impossible', 'delete from public.company_values where id = (select id from public.company_values limit 1)', 'write', '=0'),
      ('editeur', 'suppression de coordonnée impossible', 'delete from public.company_contacts where id = (select id from public.company_contacts limit 1)', 'write', '=0'),
      ('editeur', 'suppression de projet impossible', 'delete from public.land_projects where id = (select id from public.land_projects limit 1)', 'write', '=0'),
      ('editeur', 'suppression de demande impossible', 'delete from public.inquiries where id = (select id from public.inquiries limit 1)', 'write', '=0|refus'),
      ('editeur', 'journal invisible', 'select count(*) from public.audit_log', 'count', '=0'),
      ('editeur', 'profil d''un autre membre non modifiable', 'update public.staff_profiles set full_name = full_name where user_id = ''610bfcaa-d5ab-400c-943e-90e6d2583225''', 'write', '=0'),
      ('editeur', 'ajout de membre refusé', 'insert into public.staff_profiles (user_id, full_name, role) values (gen_random_uuid(), ''Test'', ''admin'')', 'write', 'refus'),
      ('editeur', 'ajout de document foncier refusé', 'insert into public.land_project_documents (project_id, doc_type, title, storage_path) select id, ''autre'', ''Test'', ''test/test.pdf'' from public.land_projects limit 1', 'write', 'refus'),
      -- Administrateur : journal, suppressions, garde-fou du dernier administrateur.
      ('admin', 'journal lisible', 'select count(*) from public.audit_log', 'count', '>0'),
      ('admin', 'suppression de média permise', 'delete from public.media where id = (select id from public.media limit 1)', 'write', '>0'),
      ('admin', 'suppression d''offre permise', 'delete from public.activity_services where id = (select id from public.activity_services limit 1)', 'write', '>0'),
      ('admin', 'dernier administrateur protégé', 'update public.staff_profiles set role = ''editeur'' where user_id = ''610bfcaa-d5ab-400c-943e-90e6d2583225''', 'write', 'refus')
    ) as v(profil, controle, sql, kind, attendu)
  loop
    i := i + 1;
    cnt := null;
    begin
      if t.profil = 'anon' then
        perform set_config('request.jwt.claims', '{"role":"anon"}', true);
        set local role anon;
      else
        perform set_config('request.jwt.claims',
          json_build_object('sub', case t.profil when 'admin' then admin_id else editor_id end, 'role', 'authenticated')::text, true);
        set local role authenticated;
      end if;

      if t.kind = 'count' then
        execute t.sql into cnt;
        got := cnt::text;
      else
        begin
          execute t.sql;
          get diagnostics cnt = row_count;
          -- Annule l'écriture : seule la valeur de cnt est conservée.
          raise exception using errcode = 'P0099';
        exception when sqlstate 'P0099' then
          got := cnt::text;
        end;
      end if;
    exception when others then
      got := 'refus (' || sqlstate || ')';
    end;
    reset role;

    insert into rls_results values (
      i, t.profil, t.controle, t.attendu, got,
      case t.attendu
        when '>0' then case when got ~ '^\d+$' then got::bigint > 0 else false end
        when '=0' then got = '0'
        -- Refus valable : droits insuffisants (42501) ou garde-fou SQL (P0001), jamais une autre erreur.
        when 'refus' then got in ('refus (42501)', 'refus (P0001)')
        when '=0|refus' then got in ('0', 'refus (42501)')
        when 'accès' then got ~ '^\d+$'
      end
    );
  end loop;
end;
$$;

select n, profil, controle, attendu, obtenu, ok from rls_results order by n;
