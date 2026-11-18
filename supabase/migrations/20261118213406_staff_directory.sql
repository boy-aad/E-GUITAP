-- Annuaire de l'équipe (PRD § 6.4 : assignation des demandes).
--
-- Jusqu'ici, un éditeur ne pouvait lire que son propre profil ; il ne voyait donc ni le nom
-- de la personne à qui une demande est assignée, ni la liste des collègues à qui l'assigner.
-- Cette règle ajoute une LECTURE SEULE de staff_profiles pour tout membre actif de l'équipe.
-- Rien ne change pour l'écriture (ajout, modification, retrait : administrateurs seulement),
-- ni pour les visiteurs (anon n'a aucun accès à cette table).

create policy "staff: équipe lit l'annuaire" on public.staff_profiles
  for select to authenticated
  using ((select private.is_staff()));
