-- E-GUITAP — stockage des fichiers
-- public-media   : images du site (lecture publique par URL), écriture par l'équipe.
-- land-documents : documents fonciers PRIVÉS, réservés à l'équipe (liens signés temporaires).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('public-media', 'public-media', true, 5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml']),
  ('land-documents', 'land-documents', false, 20971520,
    array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

-- public-media : pas de règle SELECT (inutile pour les URL publiques et évite le listage du bucket).
create policy "public-media: équipe ajoute" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'public-media' and (select public.is_staff()));
create policy "public-media: équipe modifie" on storage.objects
  for update to authenticated
  using (bucket_id = 'public-media' and (select public.is_staff()))
  with check (bucket_id = 'public-media' and (select public.is_staff()));
create policy "public-media: équipe supprime" on storage.objects
  for delete to authenticated
  using (bucket_id = 'public-media' and (select public.is_staff()));

-- land-documents : aucune règle pour anon. Lecture équipe, écriture admin.
create policy "land-documents: équipe lit" on storage.objects
  for select to authenticated
  using (bucket_id = 'land-documents' and (select public.is_staff()));
create policy "land-documents: admin ajoute" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'land-documents' and (select public.is_admin()));
create policy "land-documents: admin modifie" on storage.objects
  for update to authenticated
  using (bucket_id = 'land-documents' and (select public.is_admin()))
  with check (bucket_id = 'land-documents' and (select public.is_admin()));
create policy "land-documents: admin supprime" on storage.objects
  for delete to authenticated
  using (bucket_id = 'land-documents' and (select public.is_admin()));
