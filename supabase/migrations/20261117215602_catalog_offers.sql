-- ============================================================================
-- Catalogue d'offres (PRD v2 § 5.2, § 7.1)
-- Une offre = une prestation de activity_services ; sa catégorie = son domaine.
-- ============================================================================

-- Identifiant d'URL : construit depuis le titre (accents translittérés, minuscules, tirets).
alter table public.activity_services add column slug text;

update public.activity_services
set slug = trim(both '-' from regexp_replace(
  lower(translate(title,
    'àâäáãçéèêëíìîïñóòôöõúùûüýÿœæÀÂÄÁÃÉÈÊËÍÌÎÏÔÖÓÒÕÙÛÜÚÇ''’',
    'aaaaaceeeeiiiinooooouuuuyyoeaaaaaeeeeiiiiooooouuuuc--')),
  '[^a-z0-9]+', '-', 'g'));

alter table public.activity_services
  alter column slug set not null,
  add constraint activity_services_slug_key unique (slug),
  add constraint activity_services_slug_check check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

-- Résumé affiché sur les cartes (≤ 200 caractères). Repris de la description quand elle existe ;
-- sinon laissé vide : aucun texte n'est inventé (la carte n'affiche alors pas de résumé).
alter table public.activity_services
  add column summary text check (char_length(summary) <= 200);

update public.activity_services
set summary = left(description, 200)
where description is not null and btrim(description) <> '';

-- Image de couverture (média réel) ; sinon, illustration par défaut côté site.
alter table public.activity_services
  add column cover_media_id uuid references public.media (id) on delete set null,
  add column is_featured   boolean not null default false,
  add column quote_enabled boolean not null default true,
  add column updated_by    uuid references auth.users (id) on delete set null;

create index activity_services_cover_media_idx on public.activity_services (cover_media_id);
create index activity_services_updated_by_idx on public.activity_services (updated_by);
create index activity_services_listing_idx on public.activity_services (publication, domain_id, sort_order);

comment on column public.activity_services.slug is 'Identifiant d''URL de l''offre (/offres/:slug).';
comment on column public.activity_services.summary is 'Résumé de carte, 200 caractères maximum ; vide = non affiché.';
comment on column public.activity_services.is_featured is 'Offre mise en avant (accueil, tête du catalogue).';
comment on column public.activity_services.quote_enabled is 'Bouton « Demander un devis » affiché.';

-- Les règles RLS existantes portent sur la ligne entière (publié + domaine publié) :
-- elles couvrent les nouvelles colonnes sans modification.
