import { redirect } from 'react-router';
import { supabase } from '../../../lib/supabase';
import type { Enums, TablesInsert } from '../../../types/database';
import { MEDIA_SELECT, toMediaAsset } from '../../../lib/media';
import { friendlyDbError, slugify } from '../../format';
import { DOCUMENTS_BUCKET, relationAction } from './projectRelations';

// Lecture et enregistrement d'un projet foncier (logique inchangée depuis l'étape E2).

type Params = { params: { id?: string } };
export type ActionResult = { ok: boolean; message: string; fieldErrors?: Record<string, string> };

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const EMPTY = { project: null, objectives: [] as string[], media: [] as GalleryItem[], milestones: [] as MilestoneRow[], documents: [] as DocumentRow[] };

export async function loader({ params }: Params) {
  if (!params.id) return EMPTY;
  const [main, gallery, milestones, documents] = await Promise.all([
    supabase.from('land_projects').select('*, land_project_objectives (label, sort_order)').eq('id', params.id).maybeSingle(),
    supabase.from('land_project_media').select(`media_id, sort_order, is_cover, media (${MEDIA_SELECT})`).eq('project_id', params.id).order('sort_order'),
    supabase.from('land_project_milestones').select('id, title, description, occurred_on, is_public').eq('project_id', params.id).order('occurred_on', { nullsFirst: false }).order('created_at'),
    // Documents : lisibles par l'équipe (RLS) ; l'onglet n'est proposé qu'aux administrateurs.
    supabase.from('land_project_documents').select('id, doc_type, title, storage_path, status, notes, created_at').eq('project_id', params.id).order('created_at', { ascending: false }),
  ]);
  const failed = [main, gallery, milestones, documents].find((r) => r.error)?.error;
  if (failed) throw new Error(failed.message);
  if (!main.data) throw new Response('Projet introuvable', { status: 404 });
  const { land_project_objectives, ...project } = main.data;
  const objectives = [...land_project_objectives].sort((a, b) => a.sort_order - b.sort_order).map((o) => o.label);
  const media = (gallery.data ?? []).flatMap((g) => {
    const asset = toMediaAsset(g.media);
    return asset ? [{ id: g.media_id, isCover: g.is_cover, media: asset }] : [];
  });
  return { project, objectives, media, milestones: milestones.data ?? [], documents: documents.data ?? [] };
}

export type GalleryItem = { id: string; isCover: boolean; media: NonNullable<ReturnType<typeof toMediaAsset>> };
export type MilestoneRow = { id: string; title: string; description: string | null; occurred_on: string | null; is_public: boolean };
export type DocumentRow = { id: string; doc_type: Enums<'land_document_type'>; title: string; storage_path: string; status: Enums<'document_status'>; notes: string | null; created_at: string };

/** « 1 000,5 » → 1000.5 ; null si vide ou invalide. */
function parseNumber(raw: FormDataEntryValue | null): number | null {
  const s = String(raw ?? '').replace(/\s/g, '').replace(',', '.');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
}

const text = (raw: FormDataEntryValue | null) => String(raw ?? '').trim();
const optionalText = (raw: FormDataEntryValue | null) => text(raw) || null;

export async function action({ request, params }: Params & { request: Request }): Promise<ActionResult | Response> {
  const form = await request.formData();

  if (params.id) {
    const related = await relationAction(params.id, form);
    if (related) return related;
  }

  if (form.get('intent') === 'delete' && params.id) {
    // Fichiers des documents d'abord : la suppression du projet efface leurs fiches en cascade.
    const { data: docs, error: docsError } = await supabase.from('land_project_documents').select('storage_path').eq('project_id', params.id);
    if (docsError) return { ok: false, message: friendlyDbError(docsError) };
    if (docs.length) {
      const removed = await supabase.storage.from(DOCUMENTS_BUCKET).remove(docs.map((d) => d.storage_path));
      if (removed.error) return { ok: false, message: `Documents non supprimés : ${removed.error.message}` };
    }
    const { error } = await supabase.from('land_projects').delete().eq('id', params.id);
    if (error) return { ok: false, message: friendlyDbError(error) };
    throw redirect('/admin/projets?supprime=1');
  }

  const name = text(form.get('name'));
  const slug = text(form.get('slug')) || slugify(name);
  const area = parseNumber(form.get('area_ha'));
  const lat = parseNumber(form.get('approx_lat'));
  const lng = parseNumber(form.get('approx_lng'));
  const sortOrder = parseNumber(form.get('sort_order'));

  const fieldErrors: Record<string, string> = {};
  if (!name) fieldErrors.name = 'Le nom est obligatoire.';
  if (!SLUG_RE.test(slug)) fieldErrors.slug = 'Lettres minuscules, chiffres et tirets uniquement (ex. site-de-bady).';
  if (area === null || Number.isNaN(area) || area <= 0) fieldErrors.area_ha = 'Indiquez une superficie en hectares supérieure à 0.';
  if (!text(form.get('summary'))) fieldErrors.summary = 'Le résumé est obligatoire (il apparaît sur les cartes).';
  if (lat !== null && (Number.isNaN(lat) || lat < -90 || lat > 90)) fieldErrors.approx_lat = 'Latitude entre -90 et 90.';
  if (lng !== null && (Number.isNaN(lng) || lng < -180 || lng > 180)) fieldErrors.approx_lng = 'Longitude entre -180 et 180.';
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, message: 'Certains champs sont à corriger.', fieldErrors };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user.id ?? null;

  const enumOrNull = <T extends string>(raw: FormDataEntryValue | null) => (text(raw) || null) as T | null;
  const values: TablesInsert<'land_projects'> = {
    name,
    slug,
    prefecture: optionalText(form.get('prefecture')),
    sous_prefecture: optionalText(form.get('sous_prefecture')),
    locality: optionalText(form.get('locality')),
    area_ha: area as number,
    summary: text(form.get('summary')),
    description: text(form.get('description')),
    development_status: enumOrNull<Enums<'land_dev_status'>>(form.get('development_status')),
    commercial_status: enumOrNull<Enums<'land_commercial_status'>>(form.get('commercial_status')),
    document_status: text(form.get('document_status')) as Enums<'document_status'>,
    publication: text(form.get('publication')) as Enums<'publication_status'>,
    is_featured: form.get('is_featured') === 'on',
    sort_order: sortOrder !== null && !Number.isNaN(sortOrder) ? Math.round(sortOrder) : 0,
    approx_lat: lat,
    approx_lng: lng,
    updated_by: userId,
  };

  let projectId = params.id ?? null;
  if (projectId) {
    const { error } = await supabase.from('land_projects').update(values).eq('id', projectId);
    if (error) return { ok: false, message: friendlyDbError(error) };
  } else {
    const { data, error } = await supabase
      .from('land_projects')
      .insert({ ...values, created_by: userId })
      .select('id')
      .single();
    if (error) return { ok: false, message: friendlyDbError(error) };
    projectId = data.id;
  }

  // Objectifs : une ligne = un objectif, dans l'ordre saisi (doublons ignorés).
  const objectives = [
    ...new Set(
      text(form.get('objectives'))
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    ),
  ];
  const del = await supabase.from('land_project_objectives').delete().eq('project_id', projectId);
  if (del.error) return { ok: false, message: friendlyDbError(del.error) };
  if (objectives.length > 0) {
    const ins = await supabase
      .from('land_project_objectives')
      .insert(objectives.map((label, i) => ({ project_id: projectId, label, sort_order: i + 1 })));
    if (ins.error) return { ok: false, message: friendlyDbError(ins.error) };
  }

  if (!params.id) throw redirect(`/admin/projets/${projectId}?cree=1`);
  return { ok: true, message: 'Projet enregistré. Rechargez le site public pour voir les changements.' };
}

export type LoaderData = Awaited<ReturnType<typeof loader>>;
