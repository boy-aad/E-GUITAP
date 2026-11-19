import { supabase } from '../../../lib/supabase';
import type { Enums } from '../../../types/database';
import { friendlyDbError } from '../../format';
import type { ActionResult } from './projectData';

// Galerie, jalons et documents d'un projet : chaque opération est enregistrée immédiatement
// (hors du formulaire principal). Les documents vont dans le bucket privé land-documents
// (administrateurs uniquement, vérifié par la RLS) et ne sont consultables que par lien signé.

export const DOCUMENTS_BUCKET = 'land-documents';
/** Limite du bucket land-documents. */
export const DOCUMENT_MAX_BYTES = 20 * 1024 * 1024;
const DOCUMENT_TYPES: Record<string, string> = { 'application/pdf': 'pdf', 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export const DOCUMENT_ACCEPT = Object.keys(DOCUMENT_TYPES).join(',');

export const DOCUMENT_TYPE_LABELS: Record<Enums<'land_document_type'>, string> = {
  titre_foncier: 'Titre foncier',
  plan_lotissement: 'Plan de lotissement',
  acte_cession: 'Acte de cession',
  autorisation: 'Autorisation',
  plan_situation: 'Plan de situation',
  etude_technique: 'Étude technique',
  autre: 'Autre',
};

export const DOCUMENT_FILE_STATUS_LABELS: Record<Enums<'document_status'>, string> = {
  non_fourni: 'Non fourni',
  en_attente: 'En attente',
  verifie_interne: 'Vérifié en interne',
  valide_juridiquement: 'Validé juridiquement',
};

const text = (raw: FormDataEntryValue | null) => String(raw ?? '').trim();
const fail = (error: { code?: string; message: string }): ActionResult => ({ ok: false, message: friendlyDbError(error) });

/** Traite une opération sur la galerie, les jalons ou les documents ; null si l'intention est autre. */
export async function relationAction(projectId: string, form: FormData): Promise<ActionResult | null> {
  const intent = text(form.get('intent'));
  if (intent.startsWith('media-')) return mediaAction(projectId, intent, form);
  if (intent.startsWith('milestone-')) return milestoneAction(projectId, intent, form);
  if (intent.startsWith('doc-')) return documentAction(projectId, intent, form);
  return null;
}

async function mediaAction(projectId: string, intent: string, form: FormData): Promise<ActionResult> {
  const mediaId = text(form.get('media_id'));
  const table = () => supabase.from('land_project_media');
  const { data: rows, error } = await table().select('media_id, sort_order, is_cover').eq('project_id', projectId).order('sort_order');
  if (error) return fail(error);

  if (intent === 'media-add') {
    if (rows.some((r) => r.media_id === mediaId)) return { ok: false, message: 'Cette image est déjà dans la galerie.' };
    const order = Math.max(0, ...rows.map((r) => r.sort_order)) + 10;
    // La première image devient la couverture.
    const res = await table().insert({ project_id: projectId, media_id: mediaId, sort_order: order, is_cover: rows.length === 0 });
    return res.error ? fail(res.error) : { ok: true, message: 'Image ajoutée à la galerie.' };
  }
  if (intent === 'media-cover') {
    // Index unique partiel : retirer l'ancienne couverture avant de poser la nouvelle.
    const off = await table().update({ is_cover: false }).eq('project_id', projectId).eq('is_cover', true);
    if (off.error) return fail(off.error);
    const on = await table().update({ is_cover: true }).eq('project_id', projectId).eq('media_id', mediaId);
    return on.error ? fail(on.error) : { ok: true, message: 'Image de couverture modifiée.' };
  }
  if (intent === 'media-remove') {
    // L'image reste dans la médiathèque : seul le lien avec le projet est retiré.
    const removed = rows.find((r) => r.media_id === mediaId);
    const del = await table().delete().eq('project_id', projectId).eq('media_id', mediaId);
    if (del.error) return fail(del.error);
    const next = rows.find((r) => r.media_id !== mediaId);
    if (removed?.is_cover && next) {
      const res = await table().update({ is_cover: true }).eq('project_id', projectId).eq('media_id', next.media_id);
      if (res.error) return fail(res.error);
    }
    return { ok: true, message: 'Image retirée de la galerie (elle reste dans la médiathèque).' };
  }
  if (intent === 'media-move') {
    const i = rows.findIndex((r) => r.media_id === mediaId);
    const j = text(form.get('direction')) === 'up' ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= rows.length) return { ok: true, message: 'Ordre inchangé.' };
    const ordered = [...rows];
    [ordered[i], ordered[j]] = [ordered[j]!, ordered[i]!];
    const results = await Promise.all(ordered.map((r, k) => table().update({ sort_order: (k + 1) * 10 }).eq('project_id', projectId).eq('media_id', r.media_id)));
    const failed = results.find((r) => r.error);
    return failed?.error ? fail(failed.error) : { ok: true, message: 'Ordre de la galerie modifié.' };
  }
  return { ok: false, message: 'Opération inconnue.' };
}

async function milestoneAction(projectId: string, intent: string, form: FormData): Promise<ActionResult> {
  const id = text(form.get('id'));
  if (intent === 'milestone-delete') {
    const res = await supabase.from('land_project_milestones').delete().eq('id', id).eq('project_id', projectId);
    return res.error ? fail(res.error) : { ok: true, message: 'Jalon supprimé.' };
  }
  const title = text(form.get('title'));
  const occurredOn = text(form.get('occurred_on'));
  if (!title) return { ok: false, message: 'Certains champs sont à corriger.', fieldErrors: { title: 'Le titre est obligatoire.' } };
  if (occurredOn && !/^\d{4}-\d{2}-\d{2}$/.test(occurredOn)) return { ok: false, message: 'Certains champs sont à corriger.', fieldErrors: { occurred_on: 'Date invalide.' } };
  const values = { title, description: text(form.get('description')) || null, occurred_on: occurredOn || null, is_public: form.get('is_public') === 'on' };
  const res = id
    ? await supabase.from('land_project_milestones').update(values).eq('id', id).eq('project_id', projectId)
    : await supabase.from('land_project_milestones').insert({ ...values, project_id: projectId });
  return res.error ? fail(res.error) : { ok: true, message: id ? 'Jalon enregistré.' : 'Jalon ajouté.' };
}

async function documentAction(projectId: string, intent: string, form: FormData): Promise<ActionResult> {
  const id = text(form.get('id'));
  const table = () => supabase.from('land_project_documents');

  if (intent === 'doc-delete') {
    const { data: doc, error } = await table().select('storage_path').eq('id', id).eq('project_id', projectId).single();
    if (error) return fail(error);
    const removed = await supabase.storage.from(DOCUMENTS_BUCKET).remove([doc.storage_path]);
    if (removed.error) return { ok: false, message: `Fichier non supprimé : ${removed.error.message}` };
    const res = await table().delete().eq('id', id);
    return res.error ? fail(res.error) : { ok: true, message: 'Document supprimé.' };
  }

  const title = text(form.get('title'));
  const values = {
    title,
    doc_type: text(form.get('doc_type')) as Enums<'land_document_type'>,
    status: text(form.get('status')) as Enums<'document_status'>,
    notes: text(form.get('notes')) || null,
  };
  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = 'Le titre est obligatoire.';
  if (!(values.doc_type in DOCUMENT_TYPE_LABELS)) fieldErrors.doc_type = 'Type de document inconnu.';
  if (!(values.status in DOCUMENT_FILE_STATUS_LABELS)) fieldErrors.status = 'Statut inconnu.';

  if (intent === 'doc-update') {
    if (Object.keys(fieldErrors).length) return { ok: false, message: 'Certains champs sont à corriger.', fieldErrors };
    const res = await table().update(values).eq('id', id).eq('project_id', projectId);
    return res.error ? fail(res.error) : { ok: true, message: 'Document enregistré.' };
  }

  // doc-add : fichier envoyé dans le bucket privé, puis fiche ; fichier retiré si la fiche échoue.
  const file = form.get('file');
  const ext = file instanceof File ? DOCUMENT_TYPES[file.type] : undefined;
  if (!(file instanceof File) || file.size === 0) fieldErrors.file = 'Choisissez un fichier.';
  else if (!ext) fieldErrors.file = 'Formats acceptés : PDF, JPEG, PNG ou WebP.';
  else if (file.size > DOCUMENT_MAX_BYTES) fieldErrors.file = 'Fichier trop lourd (20 Mo au maximum).';
  if (Object.keys(fieldErrors).length || !(file instanceof File)) return { ok: false, message: 'Certains champs sont à corriger.', fieldErrors };

  const path = `${projectId}/${crypto.randomUUID()}.${ext}`;
  const up = await supabase.storage.from(DOCUMENTS_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (up.error) return { ok: false, message: `Téléversement impossible : ${up.error.message}` };
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const res = await table().insert({ ...values, project_id: projectId, storage_path: path, uploaded_by: session?.user.id ?? null });
  if (res.error) {
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([path]);
    return fail(res.error);
  }
  return { ok: true, message: 'Document ajouté.' };
}

/** Lien de consultation valable 60 secondes. */
export async function signedDocumentUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(DOCUMENTS_BUCKET).createSignedUrl(path, 60);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}
