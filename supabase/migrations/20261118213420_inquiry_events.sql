-- Historique des demandes (PRD § 6.4) : changements de statut et d'assignation.
--
-- La table inquiries est volontairement exclue du journal d'audit (il dupliquerait des données
-- personnelles). Cet historique dédié ne conserve que des codes de statut et des identifiants
-- de membres de l'équipe : ni nom, ni téléphone, ni message, ni note interne.
-- Il est alimenté uniquement par un déclencheur ; personne ne peut y écrire directement.

create table public.inquiry_events (
  id          bigint generated always as identity primary key,
  inquiry_id  uuid not null references public.inquiries (id) on delete cascade,
  actor_id    uuid references auth.users (id) on delete set null,
  kind        text not null check (kind in ('statut', 'assignation')),
  from_value  text,
  to_value    text,
  created_at  timestamptz not null default now()
);
comment on table public.inquiry_events is 'Historique des changements de statut et d''assignation des demandes (sans données personnelles).';
create index inquiry_events_inquiry_idx on public.inquiry_events (inquiry_id, created_at);
create index inquiry_events_actor_idx on public.inquiry_events (actor_id);

alter table public.inquiry_events enable row level security;
revoke all on public.inquiry_events from anon;
revoke insert, update, delete on public.inquiry_events from authenticated;

-- Lecture : toute l'équipe (administrateurs et éditeurs) ; aucune écriture possible via l'API.
create policy "inquiry_events: équipe lit" on public.inquiry_events
  for select to authenticated
  using ((select private.is_staff()));

-- Déclencheur : une ligne par changement de statut ou d'assignation, auteur = utilisateur connecté.
create function private.log_inquiry_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status then
    insert into public.inquiry_events (inquiry_id, actor_id, kind, from_value, to_value)
    values (new.id, (select auth.uid()), 'statut', old.status::text, new.status::text);
  end if;
  if new.assigned_to is distinct from old.assigned_to then
    insert into public.inquiry_events (inquiry_id, actor_id, kind, from_value, to_value)
    values (new.id, (select auth.uid()), 'assignation', old.assigned_to::text, new.assigned_to::text);
  end if;
  return new;
end;
$$;
revoke execute on function private.log_inquiry_event() from public, anon, authenticated;

create trigger log_inquiry_event
  after update of status, assigned_to on public.inquiries
  for each row execute function private.log_inquiry_event();
