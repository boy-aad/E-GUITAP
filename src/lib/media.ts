import { supabase } from './supabase';

/** Bucket public des images du site. */
export const PUBLIC_MEDIA_BUCKET = 'public-media';

/** URL publique d'un fichier du bucket public-media (aucune requête réseau). */
export const publicMediaUrl = (path: string) =>
  supabase.storage.from(PUBLIC_MEDIA_BUCKET).getPublicUrl(path).data.publicUrl;
