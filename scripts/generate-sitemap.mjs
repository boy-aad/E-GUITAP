// Génère dist/sitemap.xml après le build (script npm « postbuild »), à partir du contenu publié
// lu avec la clé publique (publishable) : les règles RLS ne renvoient que le publié.
// - Sans VITE_SITE_URL (adresse de production inconnue), rien n'est généré.
// - Sans accès réseau à Supabase, seules les pages fixes sont listées.
// Ajoute aussi la ligne « Sitemap: » à dist/robots.txt.
import { appendFileSync, existsSync, writeFileSync } from 'node:fs';

for (const file of ['.env.local', '.env']) {
  try {
    if (existsSync(file)) process.loadEnvFile(file);
  } catch {
    // Fichier illisible : on continue avec les variables déjà définies.
  }
}

const site = (process.env.VITE_SITE_URL ?? '').trim().replace(/\/+$/, '');
const supabaseUrl = (process.env.VITE_SUPABASE_URL ?? '').trim();
const key = (process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '').trim();

if (!site) {
  console.log('sitemap.xml : non généré (VITE_SITE_URL non défini).');
  process.exit(0);
}

const STATIC_PAGES = ['/', '/entreprise', '/activites', '/offres', '/projets', '/contact', '/mentions-legales', '/confidentialite'];

async function rest(path) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

const entries = STATIC_PAGES.map((path) => ({ path, lastmod: null }));
try {
  const [offers, projects] = await Promise.all([
    rest('activity_services?select=slug,updated_at,activity_domains!inner(publication)&publication=eq.publie&activity_domains.publication=eq.publie'),
    rest('land_projects?select=slug,updated_at&publication=eq.publie'),
  ]);
  for (const o of offers) entries.push({ path: `/offres/${o.slug}`, lastmod: o.updated_at });
  for (const p of projects) entries.push({ path: `/projets/${p.slug}`, lastmod: p.updated_at });
} catch (error) {
  console.log(`sitemap.xml : contenu non lu (${error.message}) ; pages fixes uniquement.`);
}

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map(
    ({ path, lastmod }) =>
      `  <url><loc>${escape(site + path)}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}</url>`,
  ),
  '</urlset>',
  '',
].join('\n');

writeFileSync('dist/sitemap.xml', xml);
appendFileSync('dist/robots.txt', `\nSitemap: ${site}/sitemap.xml\n`);
console.log(`sitemap.xml : ${entries.length} adresses.`);
