import { useRef, useState } from 'react';
import { Form, useActionData, useLoaderData, useNavigation, useOutletContext, useSearchParams, useSubmit } from 'react-router';
import { Trash2 } from 'lucide-react';
import { CATEGORY_PHOTOS, stockImage } from '../../content/stockPhotos';
import { ImagePicker, type PickedMedia } from '../media/ImagePicker';
import { Field, Input, Select, Textarea } from '../../components/ui/Field';
import type { AdminSession } from '../auth';
import { AVAILABILITY_LABELS, slugify } from '../format';
import { AdminPageHeader, FormSection, Notice, PublishSwitch, StickyActionBar, dangerButton, useConfirm, useFlashToast, useUnsavedChanges } from '../ui';
import { editAction, editLoader, type ActionResult, type EditData } from './categories/categoryData';

export const loader = editLoader;
export const action = editAction;
export const handle = { crumb: (data: unknown) => (data as EditData | undefined)?.category?.short_title ?? 'Nouvelle catégorie' };

export function Component() {
  const data = useLoaderData() as EditData;
  return <CategoryForm key={`${data.category?.id ?? 'nouvelle'}-${data.category?.updated_at ?? ''}`} {...data} />;
}

function CategoryForm({ category, offers }: EditData) {
  const result = useActionData() as ActionResult | undefined;
  const navigation = useNavigation();
  const session = useOutletContext<AdminSession>();
  const [params] = useSearchParams();
  const confirm = useConfirm();
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const saving = navigation.state !== 'idle' && navigation.formData?.get('intent') !== 'delete';
  const unsaved = useUnsavedChanges(navigation.state !== 'idle');
  const errors = result?.fieldErrors ?? {};
  useFlashToast(Boolean(params.get('cree')), 'Catégorie créée.');

  const [shortTitle, setShortTitle] = useState(category?.short_title ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(category));
  const [cover, setCover] = useState<PickedMedia | null>(category?.cover_media_id && category.cover ? { id: category.cover_media_id, media: category.cover } : null);
  // Visuel par défaut : la photo d'illustration de la catégorie, s'il en existe une.
  const stockKey = CATEGORY_PHOTOS[slug];
  const fallback = stockKey ? stockImage(stockKey) : null;

  const onDelete = async () => {
    if (!category) return;
    const ok = await confirm({
      title: `Supprimer « ${category.title} » ?`,
      message: 'La catégorie disparaît du site et ne peut pas être restaurée.',
      confirmLabel: 'Supprimer la catégorie',
      danger: true,
    });
    if (ok) submit({ intent: 'delete' }, { method: 'post' });
  };

  const isAdmin = session.staff.role === 'admin';

  return (
    <>
      <title>{`${category?.title ?? 'Nouvelle catégorie'} | Catégories | Administration E-GUITAP`}</title>
      <AdminPageHeader
        title={category?.title ?? 'Nouvelle catégorie'}
        description={category ? `${offers} offre${offers > 1 ? 's' : ''} dans cette catégorie.` : 'Une catégorie regroupe des offres du catalogue (ex. BTP).'}
      />
      {result && !result.ok && <Notice tone="error">{result.message}</Notice>}

      <Form ref={formRef} method="post" onChange={unsaved.markDirty} onSubmit={unsaved.reset} className="space-y-6">
        <FormSection title="Identité" description="Noms affichés sur la page Activités, les filtres du catalogue et les cartes.">
          <Field label="Titre" required hint="Ex. BTP — Bâtiment et travaux publics" error={errors.title}>
            <Input name="title" defaultValue={category?.title ?? ''} maxLength={120} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Titre court" required hint="Filtres et pastilles (ex. BTP)." error={errors.short_title}>
              <Input
                name="short_title"
                value={shortTitle}
                maxLength={40}
                onChange={(e) => {
                  setShortTitle(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
              />
            </Field>
            <Field label="Lettre" required hint="Repère A, B, C…" error={errors.letter}>
              <Input name="letter" defaultValue={category?.letter ?? ''} maxLength={1} className="uppercase" />
            </Field>
            <Field label="Identifiant d'URL" hint={`/offres?categorie=${slug || '…'}`} error={errors.slug}>
              <Input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value);
                }}
              />
            </Field>
          </div>
          <Field label="Résumé" required hint="Une phrase, affichée sous le titre." error={errors.summary}>
            <Textarea name="summary" rows={2} defaultValue={category?.summary ?? ''} maxLength={300} />
          </Field>
          <Field label="Description" hint="Texte plus détaillé (facultatif).">
            <Textarea name="description" rows={5} defaultValue={category?.description ?? ''} maxLength={3000} />
          </Field>
        </FormSection>

        <FormSection title="Affichage">
          <PublishSwitch defaultValue={category?.publication ?? 'brouillon'} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Disponibilité" hint="« Non confirmée » masque la catégorie et ses offres du site.">
              <Select name="availability" defaultValue={category?.availability ?? 'operationnelle'}>
                {Object.entries(AVAILABILITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Ordre d'affichage" hint="Les petits nombres s'affichent en premier." error={errors.sort_order}>
              <Input name="sort_order" type="number" step={1} defaultValue={category?.sort_order ?? 100} />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Image de couverture" description="Affichée sur l'accueil et la page Activités. Sans image choisie, le site garde la photo d'illustration par défaut.">
          <ImagePicker
            name="cover_media_id"
            label="Image de couverture"
            value={cover}
            onChange={(next) => {
              setCover(next);
              unsaved.markDirty();
            }}
            fallback={fallback}
          />
        </FormSection>

        <StickyActionBar
          dirty={unsaved.dirty}
          saving={saving}
          saveLabel={category ? 'Enregistrer' : 'Créer la catégorie'}
          extra={
            category && isAdmin ? (
              offers > 0 ? (
                <span className="text-xs text-slate-500" title="Déplacez ou supprimez d'abord ses offres.">
                  Suppression impossible : {offers} offre{offers > 1 ? 's' : ''} rattachée{offers > 1 ? 's' : ''}
                </span>
              ) : (
                <button type="button" onClick={onDelete} className={dangerButton}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer
                </button>
              )
            ) : undefined
          }
        />
      </Form>
    </>
  );
}
