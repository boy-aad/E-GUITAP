import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Field, Input, Select, Textarea } from '../../../components/ui/Field';
import { COMMERCIAL_STATUS_LABELS, DEVELOPMENT_STATUS_LABELS, LAND_DISCLAIMER } from '../../../content/landProjects';
import { DOCUMENT_STATUS_LABELS, slugify } from '../../format';
import { FormSection, PublishSwitch } from '../../ui';
import type { LoaderData } from './projectData';

type Project = LoaderData['project'];
type Errors = Record<string, string>;

/** Nom, identifiant d'URL (proposé depuis le nom), superficie, textes et potentiel. */
export function GeneralSection({ project, objectives, errors }: { project: Project; objectives: string[]; errors: Errors }) {
  // Identifiant d'URL proposé à partir du nom tant qu'il n'a pas été modifié à la main.
  const [name, setName] = useState(project?.name ?? '');
  const [slug, setSlug] = useState(project?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(project));

  return (
    <FormSection title="Informations générales" description="Textes affichés sur la carte et sur la page du projet.">
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
    </FormSection>
  );
}

/** Localisation administrative publique et coordonnées privées. */
export function LocationSection({ project, errors }: { project: Project; errors: Errors }) {
  return (
    <FormSection title="Localisation" description="Les coordonnées GPS restent privées : elles ne sont jamais affichées sur le site.">
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
    </FormSection>
  );
}

/** Avancement, documents (interne), commercialisation (liée aux documents) et publication. */
export function StatusSection({ project }: { project: Project }) {
  const [documentStatus, setDocumentStatus] = useState<string>(project?.document_status ?? 'non_fourni');
  return (
    <FormSection title="Statuts" description="« Non communiqué » : rien n'est affiché sur le site.">
      <PublishSwitch defaultValue={project?.publication ?? 'brouillon'} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="État d'avancement">
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
          hint={documentStatus === 'valide_juridiquement' ? '« Non communiqué » : rien n’est affiché sur le site.' : '« Ouverte » exige des documents validés juridiquement.'}
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
      </div>
      <label className="flex items-center gap-2.5 text-sm">
        <input type="checkbox" name="is_featured" defaultChecked={project?.is_featured ?? false} className="h-4 w-4 accent-marine" />
        Projet mis en avant
      </label>
      <p className="flex gap-2 rounded-lg bg-ivory px-3 py-2.5 text-xs text-slate-text">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Sur le site, chaque projet est accompagné de l'avertissement : « {LAND_DISCLAIMER} »
      </p>
    </FormSection>
  );
}
