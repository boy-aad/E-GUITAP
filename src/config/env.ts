// Variables d'environnement validées au démarrage : une erreur claire plutôt
// qu'un site vide si .env.local est absent ou incomplet.

function required(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_PUBLISHABLE_KEY'): string {
  const value = import.meta.env[name];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Variable d'environnement manquante : ${name} (voir .env.example).`);
  }
  return value.trim();
}

const supabaseKey = required('VITE_SUPABASE_PUBLISHABLE_KEY');
if (supabaseKey.startsWith('sb_secret_')) {
  throw new Error('Une clé secrète Supabase ne doit jamais être utilisée dans le navigateur.');
}

export const env = {
  supabaseUrl: required('VITE_SUPABASE_URL'),
  supabaseKey,
  /** Clé publique (site key) Cloudflare Turnstile ; sans elle, le formulaire renvoie vers WhatsApp. */
  turnstileSiteKey: (import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '').trim(),
  /** Adresse publique du site (ex. https://www.e-guitap.com), sans « / » final. Sert aux liens
   *  canoniques et aux balises de partage ; à défaut, l'adresse courante du navigateur. */
  siteUrl: (import.meta.env.VITE_SITE_URL ?? '').trim().replace(/\/+$/, ''),
} as const;
