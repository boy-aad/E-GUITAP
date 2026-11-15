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
} as const;
