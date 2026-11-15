import { useState } from 'react';
import {
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
  useOutletContext,
  useSearchParams,
} from 'react-router';
import { ArrowLeft, ExternalLink, Lock, Save, Trash2 } from 'lucide-react';
import { Field, Input, Select, Textarea } from '../../components/ui/Field';
import { COMMERCIAL_STATUS_LABELS, DEVELOPMENT_STATUS_LABELS, LAND_DISCLAIMER } from '../../content/landProjects';
import { supabase } from '../../lib/supabase';
import type { Enums, TablesInsert } from '../../types/database';
import type { AdminSession } from '../auth';
import { DOCUMENT_STATUS_LABELS, PUBLICATION_LABELS, friendlyDbError, slugify } from '../format';
import { AdminPageHeader, Notice, cardClass, dangerButton, primaryButton } from '../ui';

type Params = { params: { id?: string } };
type ActionResult = { ok: boolean; message: string; fieldErrors?: Record<string, string> };

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export async function loader({ params }: Params) {
  if (!params.id) return { project: null, objectives: [] as string[] };
  const { data, error } = await supabase
    .from('land_projects')
    .select('*, land_project_objectives (label, sort_order)')
    .eq('id', params.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Response('Projet introuvable', { status: 404 });
  const { land_project_objectives, ...project } = data;
  const objectives = [...land_project_objectives].sort((a, b) => a.sort_order - b.sort_order).map((o) => o.label);
  return { project, objectives };
}

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

  if (form.get('intent') === 'delete' && params.id) {
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

type LoaderData = Awaited<ReturnType<typeof loader>>;

export function Component() {
  const data = useLoaderData() as LoaderData;
  // Une clé par projet : passer d'un projet à un autre (ou à « Nouveau ») recrée le formulaire
  // au lieu de conserver l'état (nom, identifiant d'URL…) du projet précédent.
  return <ProjectForm key={data.project?.id ?? 'nouveau'} {...data} />;
}

function ProjectForm({ project, objectives }: LoaderData) {
  const result = useActionData() as ActionResult | undefined;
  const navigation = useNavigation();
  const session = useOutletContext<AdminSession>();
  const [params] = useSearchParams();
  const saving = navigation.state === 'submitting' && navigation.formData?.get('intent') !== 'delete';
  const errors = result?.fieldErrors ?? {};

  // Identifiant d'URL proposé à partir du nom tant qu'il n'a pas été modifié à la main.
  const [name, setName] = useState(project?.name ?? '');
  const [slug, setSlug] = useState(project?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(project));
  const [documentStatus, setDocumentStatus] = useState<string>(project?.document_status ?? 'non_fourni');

  const title = project ? project.name : 'Nouveau projet foncier';

  return (
    <>
      <title>{`${title} | Projets | Administration E-GUITAP`}</title>
      <Link to="/admin/projets" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:text-gold-hover">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Tous les projets
      </Link>
      <AdminPageHeader
        title={title}
        actions={
          project?.publication === 'publie' ? (
            <a href={`/projets/${project.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:text-gold-hover">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Voir sur le site
            </a>
          ) : undefined
        }
      />

      {params.get('cree') && !result && <Notice tone="success">Projet créé.</Notice>}
      {result && <Notice tone={result.ok ? 'success' : 'error'}>{result.message}</Notice>}

      <Form method="post" className="space-y-6" key={project?.updated_at ?? 'new'}>
        <section className={`${cardClass} space-y-4 p-5`}>
          <h2 className="font-poppins text-base font-bold">Informations générales</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nom du projet" required error={errors.name}>
              <Input
                name="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Identifiant d'URL" hint={`Adresse : /projets/${slug || '…'}`} error={errors.slug}>
              <Input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
              />
            </Field>
            <Field label="Superficie annoncée (hectares)" required error={errors.area_ha}>
              <Input name="area_ha" inputMode="decimal" defaultValue={project ? String(project.area_ha) : ''} />
            </Field>
            <Field label="Ordre d'affichage" hint="Les petits nombres s'affichent en premier.">
              <Input name="sort_order" inputMode="numeric" defaultValue={String(project?.sort_order ?? 0)} />
            </Field>
          </div>
          <Field label="Résumé" required hint="Une phrase, affichée sur les cartes de projet." error={errors.summary}>
            <Textarea name="summary" rows={2} defaultValue={project?.summary ?? ''} />
          </Field>
          <Field label="Description" hint="Présentation détaillée affichée sur la page du projet.">
            <Textarea name="description" rows={5} defaultValue={project?.description ?? ''} />
          </Field>
          <Field label="Potentiel de développement" hint="Un élément par ligne.">
            <Textarea name="objectives" rows={4} defaultValue={objectives.join('\n')} />
          </Field>
        </section>

        <section className={`${cardClass} space-y-4 p-5`}>
          <h2 className="font-poppins text-base font-bold">Localisation</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Préfecture">
              <Input name="prefecture" defaultValue={project?.prefecture ?? ''} placeholder="Ex. Préfecture de Dubréka" />
            </Field>
            <Field label="Sous-préfecture">
              <Input name="sous_prefecture" defaultValue={project?.sous_prefecture ?? ''} />
            </Field>
            <Field label="Localité">
              <Input name="locality" defaultValue={project?.locality ?? ''} />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Latitude approximative" hint="Privée : jamais affichée sur le site." error={errors.approx_lat}>
              <Input name="approx_lat" inputMode="decimal" defaultValue={project?.approx_lat?.toString() ?? ''} />
            </Field>
            <Field label="Longitude approximative" hint="Privée : jamais affichée sur le site." error={errors.approx_lng}>
              <Input name="approx_lng" inputMode="decimal" defaultValue={project?.approx_lng?.toString() ?? ''} />
            </Field>
          </div>
        </section>

        <section className={`${cardClass} space-y-4 p-5`}>
          <h2 className="font-poppins text-base font-bold">Statuts</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="État d'avancement" hint="« Non communiqué » : rien n'est affiché sur le site.">
              <Select name="development_status" defaultValue={project?.development_status ?? ''}>
                <option value="">Non communiqué</option>
                {Object.entries(DEVELOPMENT_STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Statut des documents fonciers" hint="Interne : jamais affiché sur le site.">
              <Select name="document_status" value={documentStatus} onChange={(e) => setDocumentStatus(e.target.value)}>
                {Object.entries(DOCUMENT_STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Commercialisation"
              hint={
                documentStatus === 'valide_juridiquement'
                  ? '« Non communiqué » : rien n’est affiché sur le site.'
                  : '« Ouverte » exige des documents validés juridiquement.'
              }
            >
              <Select name="commercial_status" defaultValue={project?.commercial_status ?? ''}>
                <option value="">Non communiqué</option>
                {Object.entries(COMMERCIAL_STATUS_LABELS).map(([v, l]) => (
                  <option key={v} value={v} disabled={v === 'commercialisation_ouverte' && documentStatus !== 'valide_juridiquement'}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Publication">
              <Select name="publication" defaultValue={project?.publication ?? 'brouillon'}>
                {Object.entries(PUBLICATION_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
          <label className="flex items-center gap-2.5 text-sm">
            <input type="checkbox" name="is_featured" defaultChecked={project?.is_featured ?? false} className="h-4 w-4 accent-marine" />
            Projet mis en avant
          </label>
          <p className="flex gap-2 rounded bg-ivory px-3 py-2.5 text-xs text-slate-text">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            Sur le site, chaque projet est accompagné de l'avertissement : « {LAND_DISCLAIMER} »
          </p>
        </section>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <div />
          <button type="submit" name="intent" value="save" disabled={saving} className={primaryButton}>
            <Save className="h-4 w-4" aria-hidden="true" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </Form>

      {project && session.staff.role === 'admin' && (
        <Form
          method="post"
          className="mt-10 border-t border-slate-200 pt-6"
          onSubmit={(e) => {
            if (!window.confirm(`Supprimer définitivement « ${project.name} » ? Ses objectifs et documents seront aussi supprimés.`))
              e.preventDefault();
          }}
        >
          <button type="submit" name="intent" value="delete" className={dangerButton}>
            <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer le projet
          </button>
        </Form>
      )}
    </>
  );
}
