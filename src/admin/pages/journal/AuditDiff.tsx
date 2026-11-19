import type { Json } from '../../../types/database';

// Détail d'une entrée du journal : champ par champ, avant / après.

/** Libellés des colonnes courantes ; les autres sont affichées sous leur nom technique. */
const FIELD_LABELS: Record<string, string> = {
  title: 'Titre',
  name: 'Nom',
  full_name: 'Nom complet',
  label: 'Libellé',
  slug: "Identifiant d'URL",
  summary: 'Résumé',
  description: 'Description',
  body: 'Texte',
  publication: 'Publication',
  availability: 'Disponibilité',
  sort_order: "Ordre d'affichage",
  is_featured: 'Mis en avant',
  is_active: 'Actif',
  is_public: 'Public',
  is_cover: 'Couverture',
  quote_enabled: 'Devis activé',
  role: 'Rôle',
  value: 'Valeur',
  raw_value: 'Valeur technique',
  kind: 'Type',
  alt: 'Texte alternatif',
  credit: 'Crédit',
  status: 'Statut',
  area_ha: 'Superficie annoncée (ha)',
  prefecture: 'Préfecture',
  sous_prefecture: 'Sous-préfecture',
  locality: 'Localité',
  development_status: "État d'avancement",
  commercial_status: 'Commercialisation',
  document_status: 'Statut des documents',
  approx_lat: 'Latitude (privée)',
  approx_lng: 'Longitude (privée)',
  eyebrow: 'Surtitre',
  subtitle: 'Sous-titre',
  title_highlight: 'Mot mis en valeur',
  presentation: 'Présentation',
  mission: 'Mission',
  vision: 'Vision',
  notes: 'Notes internes',
  focal_x: 'Point focal (horizontal)',
  focal_y: 'Point focal (vertical)',
  show_signature: 'Signature affichée',
  primary_cta_label: 'Bouton principal (texte)',
  primary_cta_href: 'Bouton principal (lien)',
  secondary_cta_label: 'Bouton secondaire (texte)',
  secondary_cta_href: 'Bouton secondaire (lien)',
  background_media_id: 'Image de fond',
  cover_media_id: 'Image de couverture',
  media_id: 'Image',
  domain_id: 'Catégorie',
  project_id: 'Projet',
};

/** Colonnes techniques sans intérêt pour la lecture du journal (l'identifiant est affiché en tête). */
const HIDDEN = new Set(['id', 'created_at', 'updated_at', 'created_by', 'updated_by', 'uploaded_by']);

function formatValue(v: Json | undefined): string {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Oui' : 'Non';
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  if (Array.isArray(v) && v.every((x) => typeof x === 'string')) return v.join('\n\n');
  return JSON.stringify(v, null, 2);
}

const asRecord = (d: Json | null): Record<string, Json> => (d && typeof d === 'object' && !Array.isArray(d) ? (d as Record<string, Json>) : {});

/** Tableau avant / après : seuls les champs modifiés pour une modification, tous les champs sinon. */
export function AuditDiff({ action, oldData, newData }: { action: string; oldData: Json | null; newData: Json | null }) {
  const before = asRecord(oldData);
  const after = asRecord(newData);
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((k) => !HIDDEN.has(k));
  const shown = action === 'UPDATE' ? keys.filter((k) => JSON.stringify(before[k]) !== JSON.stringify(after[k])) : keys;

  if (shown.length === 0) return <p className="p-5 text-sm text-slate-600">Aucun champ lisible modifié (seules des informations techniques ont changé).</p>;

  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-sm ${action === 'UPDATE' ? 'min-w-[36rem]' : ''}`}>
        <caption className="sr-only">Champs {action === 'UPDATE' ? 'modifiés' : 'enregistrés'}</caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
          <tr>
            <th scope="col" className="w-48 px-4 py-2.5 font-semibold">
              Champ
            </th>
            {action !== 'INSERT' && (
              <th scope="col" className="px-4 py-2.5 font-semibold">
                Avant
              </th>
            )}
            {action !== 'DELETE' && (
              <th scope="col" className="px-4 py-2.5 font-semibold">
                Après
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 align-top">
          {shown.map((k) => (
            <tr key={k}>
              <th scope="row" className="px-4 py-2.5 font-semibold text-marine">
                {FIELD_LABELS[k] ?? <code className="text-xs font-normal text-slate-600">{k}</code>}
              </th>
              {action !== 'INSERT' && <td className={`whitespace-pre-wrap break-words px-4 py-2.5 ${action === 'UPDATE' ? 'bg-red-50/60 text-red-900' : 'text-slate-800'}`}>{formatValue(before[k])}</td>}
              {action !== 'DELETE' && <td className={`whitespace-pre-wrap break-words px-4 py-2.5 ${action === 'UPDATE' ? 'bg-emerald-50/60 text-emerald-900' : 'text-slate-800'}`}>{formatValue(after[k])}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
