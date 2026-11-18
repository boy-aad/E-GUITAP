import { supabase } from '../../lib/supabase';
import { PUBLIC_MEDIA_BUCKET } from '../../lib/media';
import type { Enums, TablesInsert } from '../../types/database';

// Téléversement d'images (PRD § 6.7) : conversion WebP dans le navigateur (canvas, sans
// dépendance) en deux tailles, envoi dans public-media, puis fiche dans la table media.

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
/** Limite du bucket public-media, appliquée après conversion. */
export const MAX_BYTES = 5 * 1024 * 1024;
const QUALITY = 0.82;
const SIZES = [1920, 640] as const;

export type UploadInput = { file: File; alt: string; kind: Enums<'media_kind'>; credit: string };
type Encoded = { label: number; blob: Blob; width: number; height: number };

/** Charge l'image en respectant l'orientation EXIF des photos de téléphone. */
async function decode(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    throw new Error(`« ${file.name} » n'est pas une image lisible (JPEG, PNG ou WebP).`);
  }
}

/** Redimensionne (jamais d'agrandissement) puis encode en WebP. */
async function encode(bitmap: ImageBitmap, maxWidth: number): Promise<Omit<Encoded, 'label'>> {
  const scale = Math.min(1, maxWidth / bitmap.width);
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Conversion impossible dans ce navigateur.');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, width, height);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', QUALITY));
  // Certains navigateurs anciens renvoient du PNG au lieu du WebP demandé.
  if (!blob || blob.type !== 'image/webp') throw new Error('Ce navigateur ne sait pas produire du WebP : utilisez Chrome, Edge ou Firefox récents.');
  return { blob, width, height };
}

/** Versions à produire : 1920 et 640 px, sans doublon si l'original est déjà petit. */
export async function convert(file: File): Promise<Encoded[]> {
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) {
    throw new Error(`« ${file.name} » : format non accepté (JPEG, PNG ou WebP uniquement).`);
  }
  const bitmap = await decode(file);
  try {
    const out: Encoded[] = [];
    for (const label of SIZES) {
      if (label !== SIZES[0] && bitmap.width <= label) continue; // pas de petite version d'une petite image
      const encoded = await encode(bitmap, label);
      if (encoded.blob.size > MAX_BYTES) throw new Error(`« ${file.name} » dépasse 5 Mo même après conversion.`);
      out.push({ label, ...encoded });
    }
    return out;
  } finally {
    bitmap.close();
  }
}

/** Convertit, envoie les fichiers et crée la fiche média. Renvoie l'identifiant créé. */
export async function uploadImage({ file, alt, kind, credit }: UploadInput): Promise<string> {
  if (!alt.trim()) throw new Error(`« ${file.name} » : le texte alternatif est obligatoire.`);
  const versions = await convert(file);
  const now = new Date();
  const folder = `media/${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}`;
  const id = crypto.randomUUID();
  const paths = versions.map((v) => `${folder}/${id}-${v.label}.webp`);

  for (const [i, v] of versions.entries()) {
    const { error } = await supabase.storage
      .from(PUBLIC_MEDIA_BUCKET)
      .upload(paths[i]!, v.blob, { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
    if (error) throw new Error(`Envoi de « ${file.name} » impossible : ${error.message}`);
  }

  const [main, ...others] = versions;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const row: TablesInsert<'media'> = {
    path: paths[0]!,
    kind,
    alt: alt.trim(),
    credit: credit.trim() || null,
    width: main!.width,
    height: main!.height,
    bytes: main!.blob.size,
    variants: others.length ? Object.fromEntries(others.map((v, i) => [String(v.width), paths[i + 1]!])) : null,
    created_by: session?.user.id ?? null,
  };
  const { data, error } = await supabase.from('media').insert(row).select('id').single();
  if (error) {
    // Nettoyage des fichiers envoyés (autorisé aux administrateurs ; sinon fichiers orphelins inoffensifs).
    await supabase.storage.from(PUBLIC_MEDIA_BUCKET).remove(paths);
    throw new Error(`Enregistrement de « ${file.name} » impossible : ${error.message}`);
  }
  return data.id;
}

/** « 182 Ko », « 1,4 Mo ». */
export function formatBytes(n: number | null | undefined): string {
  if (!n) return '—';
  const fmt = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
  return n < 1024 * 1024 ? `${fmt.format(n / 1024)} Ko` : `${fmt.format(n / 1024 / 1024)} Mo`;
}
