import type { Enums } from '../types/database';

export const INQUIRY_STATUS_LABELS: Record<Enums<'inquiry_status'>, string> = {
  nouveau: 'Nouvelle',
  en_cours: 'En cours',
  traite: 'Traitée',
  archive: 'Archivée',
};

export const INQUIRY_STATUS_TONE: Record<Enums<'inquiry_status'>, 'info' | 'warning' | 'success' | 'neutral'> = {
  nouveau: 'info',
  en_cours: 'warning',
  traite: 'success',
  archive: 'neutral',
};

export const INQUIRY_TYPE_LABELS: Record<Enums<'inquiry_type'>, string> = {
  contact: 'Demande générale',
  renseignement_activite: 'Activité',
  renseignement_projet: 'Projet foncier',
};

export const PUBLICATION_LABELS: Record<Enums<'publication_status'>, string> = {
  brouillon: 'Brouillon',
  publie: 'Publié',
  archive: 'Archivé',
};

export const DOCUMENT_STATUS_LABELS: Record<Enums<'document_status'>, string> = {
  non_fourni: 'Non fournis',
  en_attente: 'En attente',
  verifie_interne: 'Vérifiés en interne',
  valide_juridiquement: 'Validés juridiquement',
};

const dateTime = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
const date = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' });

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatDate = (iso: string) => date.format(new Date(iso));

/** Identifiant d'URL à partir d'un nom : « Tanènè – Kenendé » → « tanene-kenende ». */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Traduit les erreurs Postgres courantes en messages compréhensibles. */
export function friendlyDbError(error: { code?: string; message: string }): string {
  if (error.code === '23505') return 'Cette valeur existe déjà (identifiant ou titre en double).';
  if (error.code === '23514') {
    if (error.message.includes('open_sale_requires_validation'))
      return 'La commercialisation ne peut être « ouverte » que si les documents sont « validés juridiquement ».';
    return 'Une valeur ne respecte pas les règles attendues (format ou plage autorisée).';
  }
  if (error.code === '42501') return "Vous n'avez pas les droits nécessaires pour cette action.";
  return `Enregistrement impossible : ${error.message}`;
}
