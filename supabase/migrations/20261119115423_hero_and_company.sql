-- Contenus (PRD § 6.6 et § 7, migration 3) : cadrage des slides, position du siège,
-- réseaux sociaux en https, journal d'activité des contenus éditoriaux.

-- Point focal de l'image de fond d'une slide (0 = gauche / haut, 1 = droite / bas) :
-- l'image reste cadrée sur ce point quel que soit le format d'écran.
alter table public.hero_slides
  add column focal_x numeric(4,3) not null default 0.5 check (focal_x between 0 and 1),
  add column focal_y numeric(4,3) not null default 0.5 check (focal_y between 0 and 1);

comment on column public.hero_slides.focal_x is 'Point focal horizontal de l''image de fond (0 à 1, 0,5 = centre).';
comment on column public.hero_slides.focal_y is 'Point focal vertical de l''image de fond (0 à 1, 0,5 = centre).';

-- Position publique du siège, pour une carte éventuelle (question Q3 : carte masquée par défaut).
-- Les deux valeurs sont renseignées ensemble ou pas du tout.
alter table public.company_profile
  add column office_lat numeric(8,6) check (office_lat between -90 and 90),
  add column office_lng numeric(9,6) check (office_lng between -180 and 180),
  add constraint company_profile_office_position_check
    check ((office_lat is null) = (office_lng is null));

comment on column public.company_profile.office_lat is 'Latitude publique du siège (degrés décimaux), affichée sur une carte.';
comment on column public.company_profile.office_lng is 'Longitude publique du siège (degrés décimaux), affichée sur une carte.';

-- Un réseau social est toujours une adresse https (le site public ignorait déjà les autres).
alter table public.company_contacts
  add constraint company_contacts_social_https_check
    check (kind <> 'social' or raw_value ~* '^https://[^\s]+$');

-- Journal d'activité : les contenus éditoriaux modifiables dans l'administration
-- (company_profile et company_contacts y sont déjà).
create trigger write_audit_log
  after insert or update or delete on public.hero_slides
  for each row execute function private.write_audit_log();

create trigger write_audit_log
  after insert or update or delete on public.company_values
  for each row execute function private.write_audit_log();

create trigger write_audit_log
  after insert or update or delete on public.content_blocks
  for each row execute function private.write_audit_log();
