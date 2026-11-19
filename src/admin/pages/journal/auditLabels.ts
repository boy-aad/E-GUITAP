// Libellés lisibles du journal d'activité (audit_log), partagés par le tableau de bord et la page Journal.

/** Rubrique de chaque table suivie : libellé de filtre et complément de phrase (« a modifié une offre »). */
export const AUDIT_TABLES: Record<string, { label: string; phrase: string }> = {
  inquiries: { label: 'Demandes', phrase: 'une demande' },
  activity_services: { label: 'Offres', phrase: 'une offre' },
  activity_domains: { label: 'Catégories', phrase: 'une catégorie' },
  land_projects: { label: 'Projets fonciers', phrase: 'un projet foncier' },
  land_project_objectives: { label: 'Objectifs de projet', phrase: "l'objectif d'un projet" },
  land_project_documents: { label: 'Documents fonciers', phrase: 'un document foncier' },
  land_project_media: { label: 'Médias de projet', phrase: 'un média de projet' },
  company_profile: { label: 'Entreprise', phrase: "le profil de l'entreprise" },
  company_values: { label: 'Valeurs', phrase: 'une valeur' },
  company_contacts: { label: 'Coordonnées', phrase: 'une coordonnée' },
  hero_slides: { label: "Page d'accueil", phrase: "une slide d'accueil" },
  content_blocks: { label: 'Textes des pages', phrase: 'un texte de page' },
  media: { label: 'Médiathèque', phrase: 'un média' },
  staff_profiles: { label: 'Équipe', phrase: "un membre de l'équipe" },
};

export const ACTION_VERBS: Record<string, string> = { INSERT: 'a créé', UPDATE: 'a modifié', DELETE: 'a supprimé' };
export const ACTION_LABELS: Record<string, string> = { INSERT: 'Création', UPDATE: 'Modification', DELETE: 'Suppression' };

export const tableLabel = (table: string) => AUDIT_TABLES[table]?.label ?? table;
export const tablePhrase = (table: string) => AUDIT_TABLES[table]?.phrase ?? table;

/** Libellé lisible d'une ligne du journal (titre, nom…), sans jamais afficher de données privées. */
export function itemLabel(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  for (const k of ['title', 'name', 'full_name', 'label', 'key', 'alt']) if (typeof d[k] === 'string' && d[k]) return d[k] as string;
  return null;
}

/** Auteur d'une entrée (le journal n'affiche que les écritures faites par un membre connecté). */
export const actorLabel = (actorId: string | null, names: Map<string, string>) => (actorId && names.get(actorId)) || 'Un membre de l’équipe';
