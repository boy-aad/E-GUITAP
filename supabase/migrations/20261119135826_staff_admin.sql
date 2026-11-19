-- E-GUITAP — équipe (PRD § 6.8) : garde-fou « au moins un administrateur actif ».
--
-- Les administrateurs gèrent l'équipe depuis l'administration (rôle, désactivation) ; une
-- erreur de manipulation ne doit jamais laisser le site sans administrateur actif, y compris
-- quand un administrateur modifie son propre compte.
--
-- La dernière connexion et l'e-mail des membres ne sont pas copiés ici : ils sont lus dans
-- auth.users par l'Edge Function admin-users (réservée aux administrateurs).

create function private.ensure_active_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.staff_profiles where role = 'admin' and is_active) then
    raise exception 'Il doit rester au moins un administrateur actif.'
      using errcode = 'P0001', hint = 'Nommez ou réactivez d''abord un autre administrateur.';
  end if;
  return null;
end;
$$;
revoke execute on function private.ensure_active_admin() from public, anon, authenticated;

comment on function private.ensure_active_admin() is
  'Refuse toute modification ou suppression qui laisserait l''équipe sans administrateur actif.';

-- Contrôle après l'instruction complète : l'état final de la table est vérifié une fois.
create trigger ensure_active_admin
  after update of role, is_active or delete on public.staff_profiles
  for each statement execute function private.ensure_active_admin();
