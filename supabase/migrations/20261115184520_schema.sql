-- E-GUITAP — schéma initial
-- Blocs : équipe et journal, institutionnel, médias, activités, contenus éditables,
-- projets fonciers (dont documents privés), demandes. Produits : plus tard.

-- ============================================================================
-- Types énumérés
-- ============================================================================
create type public.availability_status as enum ('operationnelle', 'en_developpement', 'non_confirmee');
create type public.publication_status as enum ('brouillon', 'publie', 'archive');
create type public.land_dev_status as enum (
  'identification', 'etudes', 'amenagement_en_cours', 'morcellement_en_cours', 'viabilisation_en_cours', 'suspendu'
);
create type public.land_commercial_status as enum (
  'non_commercialise', 'pre_commercialisation', 'commercialisation_ouverte', 'suspendu', 'cloture'
);
create type public.document_status as enum ('non_fourni', 'en_attente', 'verifie_interne', 'valide_juridiquement');
create type public.land_document_type as enum (
  'titre_foncier', 'plan_lotissement', 'acte_cession', 'autorisation', 'plan_situation', 'etude_technique', 'autre'
);
create type public.inquiry_type as enum ('contact', 'renseignement_activite', 'renseignement_projet');
create type public.inquiry_status as enum ('nouveau', 'en_cours', 'traite', 'archive');
create type public.staff_role as enum ('admin', 'editeur');
create type public.contact_kind as enum ('phone', 'whatsapp', 'email', 'address', 'social');
create type public.media_kind as enum ('photo_reelle', 'illustration', 'plan', 'logo');

-- ============================================================================
-- Fonctions utilitaires
-- ============================================================================
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ============================================================================
-- Équipe (administration)
-- ============================================================================
create table public.staff_profiles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null,
  role       public.staff_role not null default 'editeur',
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.staff_profiles is 'Membres de l''équipe ayant accès à l''administration.';

-- security definer : lit staff_profiles sans déclencher ses propres règles RLS.
create function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_profiles
    where user_id = (select auth.uid()) and is_active
  );
$$;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_profiles
    where user_id = (select auth.uid()) and is_active and role = 'admin'
  );
$$;

revoke execute on function public.is_staff() from public, anon;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- ============================================================================
-- Journal des modifications
-- ============================================================================
create table public.audit_log (
  id         bigint generated always as identity primary key,
  actor_id   uuid,
  table_name text not null,
  row_id     text,
  action     text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  old_data   jsonb,
  new_data   jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_table_row_idx on public.audit_log (table_name, row_id);
create index audit_log_created_at_idx on public.audit_log (created_at desc);

create function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  rec jsonb := to_jsonb(coalesce(new, old));
begin
  insert into public.audit_log (actor_id, table_name, row_id, action, old_data, new_data)
  values (
    (select auth.uid()),
    tg_table_name,
    coalesce(rec ->> 'id', rec ->> 'user_id', rec ->> 'key'),
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end;
$$;
revoke execute on function public.write_audit_log() from public, anon, authenticated;

-- ============================================================================
-- Institutionnel
-- ============================================================================
create table public.company_profile (
  id                       boolean primary key default true check (id), -- une seule ligne
  brand_name               text not null,
  full_name                text not null,
  country                  text not null,
  head_office              text not null,
  ambition                 text,
  presentation             text[] not null default '{}',
  mission                  text,
  vision                   text,
  signature_brand          text,
  signature_institutional  text,
  signature_sectoral       text,
  -- Champs juridiques : vides tant qu'ils ne sont pas communiqués.
  legal_form               text,
  rccm                     text,
  nif                      text,
  publication_manager      text,
  host_name                text,
  updated_at               timestamptz not null default now(),
  updated_by               uuid references auth.users (id) on delete set null
);
create index company_profile_updated_by_idx on public.company_profile (updated_by);

create table public.company_values (
  id          uuid primary key default gen_random_uuid(),
  title       text not null unique,
  description text,
  sort_order  integer not null default 0,
  publication public.publication_status not null default 'publie',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.company_contacts (
  id         uuid primary key default gen_random_uuid(),
  kind       public.contact_kind not null,
  label      text not null,
  value      text not null,                -- valeur affichée
  raw_value  text not null,                -- valeur technique (numéro international, e-mail…)
  is_public  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- Médiathèque (fichiers du bucket public-media)
-- ============================================================================
create table public.media (
  id         uuid primary key default gen_random_uuid(),
  path       text not null unique,          -- chemin dans le bucket public-media
  kind       public.media_kind not null,    -- 'illustration' => mention « Visuel d'illustration »
  alt        text not null default '',
  credit     text,
  width      integer check (width > 0),
  height     integer check (height > 0),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);
create index media_created_by_idx on public.media (created_by);

-- ============================================================================
-- Domaines d'activité et prestations
-- ============================================================================
create table public.activity_domains (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  letter         text not null check (char_length(letter) = 1),
  title          text not null,
  short_title    text not null,
  summary        text not null,
  description    text,
  availability   public.availability_status not null default 'operationnelle',
  publication    public.publication_status not null default 'brouillon',
  sort_order     integer not null default 0,
  cover_media_id uuid references public.media (id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index activity_domains_listing_idx on public.activity_domains (publication, sort_order);
create index activity_domains_cover_media_idx on public.activity_domains (cover_media_id);

create table public.activity_services (
  id           uuid primary key default gen_random_uuid(),
  domain_id    uuid not null references public.activity_domains (id) on delete cascade,
  title        text not null,
  description  text,
  availability public.availability_status not null default 'operationnelle',
  publication  public.publication_status not null default 'publie',
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (domain_id, title)
);
create index activity_services_domain_idx on public.activity_services (domain_id, sort_order);

-- ============================================================================
-- Contenus éditables (accueil, textes de sections)
-- ============================================================================
create table public.hero_slides (
  id                  uuid primary key default gen_random_uuid(),
  eyebrow             text,
  title               text not null,
  title_highlight     text,          -- seconde ligne en or
  subtitle            text,
  show_signature      boolean not null default true,
  primary_cta_label   text,
  primary_cta_href    text,
  secondary_cta_label text,
  secondary_cta_href  text,
  background_media_id uuid references public.media (id) on delete set null,
  is_active           boolean not null default true,
  sort_order          integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index hero_slides_active_idx on public.hero_slides (is_active, sort_order);
create index hero_slides_background_media_idx on public.hero_slides (background_media_id);

create table public.content_blocks (
  key         text primary key check (key in (
    'home.presentation', 'home.cta', 'company.presentation', 'projects.intro', 'contact.intro'
  )),
  title       text,
  body        text,
  media_id    uuid references public.media (id) on delete set null,
  publication public.publication_status not null default 'publie',
  updated_at  timestamptz not null default now()
);
create index content_blocks_media_idx on public.content_blocks (media_id);

-- ============================================================================
-- Projets fonciers
-- ============================================================================
create table public.land_projects (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name               text not null,
  prefecture         text,
  sous_prefecture    text,
  locality           text,
  area_ha            numeric(10, 2) not null check (area_ha > 0),
  area_is_declared   boolean not null default true,  -- superficie annoncée, non mesurée
  summary            text not null,
  description        text not null default '',
  development_status public.land_dev_status,          -- null = non communiqué
  commercial_status  public.land_commercial_status,   -- null = non communiqué
  document_status    public.document_status not null default 'non_fourni',
  publication        public.publication_status not null default 'brouillon',
  is_featured        boolean not null default false,
  sort_order         integer not null default 0,
  approx_lat         numeric(9, 6) check (approx_lat between -90 and 90),    -- privé
  approx_lng         numeric(9, 6) check (approx_lng between -180 and 180),  -- privé
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  created_by         uuid references auth.users (id) on delete set null,
  updated_by         uuid references auth.users (id) on delete set null,
  -- Garde-fou : pas de « commercialisation ouverte » sans validation juridique des documents.
  constraint land_projects_open_sale_requires_validation check (
    commercial_status is distinct from 'commercialisation_ouverte'
    or document_status = 'valide_juridiquement'
  )
);
create index land_projects_listing_idx on public.land_projects (publication, sort_order);
create index land_projects_commercial_idx on public.land_projects (commercial_status);
create index land_projects_created_by_idx on public.land_projects (created_by);
create index land_projects_updated_by_idx on public.land_projects (updated_by);

create table public.land_project_objectives (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.land_projects (id) on delete cascade,
  label      text not null,
  sort_order integer not null default 0,
  unique (project_id, label)
);
create index land_project_objectives_project_idx on public.land_project_objectives (project_id, sort_order);

create table public.land_project_milestones (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.land_projects (id) on delete cascade,
  title       text not null,
  description text,
  occurred_on date,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now()
);
create index land_project_milestones_project_idx on public.land_project_milestones (project_id, occurred_on);

create table public.land_project_media (
  project_id uuid not null references public.land_projects (id) on delete cascade,
  media_id   uuid not null references public.media (id) on delete cascade,
  sort_order integer not null default 0,
  is_cover   boolean not null default false,
  primary key (project_id, media_id)
);
create index land_project_media_media_idx on public.land_project_media (media_id);
create unique index land_project_media_one_cover_idx on public.land_project_media (project_id) where is_cover;

-- Documents fonciers : bucket privé land-documents, jamais accessibles au public.
create table public.land_project_documents (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.land_projects (id) on delete cascade,
  doc_type     public.land_document_type not null,
  title        text not null,
  storage_path text not null unique,
  status       public.document_status not null default 'en_attente',
  notes        text,
  uploaded_by  uuid references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index land_project_documents_project_idx on public.land_project_documents (project_id);
create index land_project_documents_uploaded_by_idx on public.land_project_documents (uploaded_by);

-- ============================================================================
-- Demandes de renseignements
-- ============================================================================
create table public.inquiries (
  id              uuid primary key default gen_random_uuid(),
  type            public.inquiry_type not null default 'contact',
  full_name       text not null check (char_length(full_name) between 1 and 200),
  organization    text check (char_length(organization) <= 200),
  email           text check (char_length(email) <= 320),
  phone           text not null check (char_length(phone) between 1 and 50),
  domain_id       uuid references public.activity_domains (id) on delete set null,
  service_id      uuid references public.activity_services (id) on delete set null,
  land_project_id uuid references public.land_projects (id) on delete set null,
  subject         text check (char_length(subject) <= 300),
  message         text not null check (char_length(message) between 1 and 5000),
  consent         boolean not null check (consent),
  consent_at      timestamptz not null default now(),
  source_page     text,
  status          public.inquiry_status not null default 'nouveau',
  assigned_to     uuid references auth.users (id) on delete set null,
  internal_notes  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index inquiries_status_idx on public.inquiries (status, created_at desc);
create index inquiries_domain_idx on public.inquiries (domain_id);
create index inquiries_service_idx on public.inquiries (service_id);
create index inquiries_land_project_idx on public.inquiries (land_project_id);
create index inquiries_assigned_to_idx on public.inquiries (assigned_to);

-- ============================================================================
-- Déclencheurs : updated_at et journal
-- ============================================================================
do $$
declare
  t text;
begin
  foreach t in array array[
    'staff_profiles', 'company_profile', 'company_values', 'company_contacts', 'activity_domains',
    'activity_services', 'hero_slides', 'content_blocks', 'land_projects', 'land_project_documents', 'inquiries'
  ] loop
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t
    );
  end loop;

  -- inquiries est exclue volontairement : le journal dupliquerait des données personnelles.
  foreach t in array array[
    'staff_profiles', 'company_profile', 'company_contacts', 'activity_domains', 'activity_services',
    'land_projects', 'land_project_documents'
  ] loop
    execute format(
      'create trigger write_audit_log after insert or update or delete on public.%I for each row execute function public.write_audit_log()', t
    );
  end loop;
end;
$$;
