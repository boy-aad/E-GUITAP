-- Médiathèque (PRD § 6.7 et § 7, migration 4) : tailles d'image, poids, date de modification.
--
-- Chaque image est téléversée en WebP en deux tailles (≤ 1920 px et 640 px). Le chemin principal
-- reste dans media.path (grande taille) ; les autres tailles sont listées dans media.variants.
-- La table entre dans le journal d'activité (aucune donnée personnelle).

alter table public.media
  add column variants   jsonb check (variants is null or jsonb_typeof(variants) = 'object'),
  add column bytes      integer check (bytes is null or bytes > 0),
  add column updated_at timestamptz not null default now();

comment on column public.media.variants is
  'Autres tailles : largeur en px → chemin dans public-media, ex. {"640": "media/2026/11/<uuid>-640.webp"}.';
comment on column public.media.bytes is 'Poids du fichier principal, en octets.';

create trigger set_updated_at
  before update on public.media
  for each row execute function private.set_updated_at();

create trigger write_audit_log
  after insert or update or delete on public.media
  for each row execute function private.write_audit_log();
