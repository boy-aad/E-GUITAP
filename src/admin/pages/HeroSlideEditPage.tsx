import { useRef, useState } from 'react';
import { Form, useActionData, useLoaderData, useNavigation, useOutletContext, useSearchParams, useSubmit } from 'react-router';
import { Trash2 } from 'lucide-react';
import { Field, Input, Textarea } from '../../components/ui/Field';
import type { AdminSession } from '../auth';
import { ImagePicker, type PickedMedia } from '../media/ImagePicker';
import { AdminPageHeader, FormSection, Notice, StickyActionBar, dangerButton, useConfirm, useFlashToast, useUnsavedChanges } from '../ui';
import { FocalPointPicker, type Focal } from './content/FocalPointPicker';
import { HeroPreview } from './content/HeroPreview';
import { editAction, editLoader, type EditData } from './content/heroData';
import type { ActionResult } from './content/shared';
import { slideImage } from './content/slideImage';

export const loader = editLoader;
export const action = editAction;
export const handle = { crumb: (data: unknown) => (data as EditData | undefined)?.slide?.title ?? 'Nouvelle slide' };

export function Component() {
  const data = useLoaderData() as EditData;
  return <SlideForm key={`${data.slide?.id ?? 'nouvelle'}-${data.slide?.updated_at ?? ''}`} {...data} />;
}

const HREF_HINT = 'Page du site (/offres, /contact…), #devis (ouvre la demande de devis), https://…, mailto: ou tel:.';

function SlideForm({ slide, signature, activeIndex, nextOrder }: EditData) {
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
  useFlashToast(Boolean(params.get('cree')), 'Slide créée.');

  const initial = {
    eyebrow: slide?.eyebrow ?? '',
    title: slide?.title ?? '',
    highlight: slide?.title_highlight ?? '',
    subtitle: slide?.subtitle ?? '',
    showSignature: slide?.show_signature ?? true,
    primary: slide?.primary_cta_label ?? '',
    secondary: slide?.secondary_cta_label ?? '',
  };
  const [f, setF] = useState(initial);
  const set = <K extends keyof typeof initial>(k: K, v: (typeof initial)[K]) => setF((prev) => ({ ...prev, [k]: v }));
  const initialBackground: PickedMedia | null = slide?.background_media_id && slide.background ? { id: slide.background_media_id, media: slide.background } : null;
  const [background, setBackground] = useState(initialBackground);
  const initialFocal: Focal = { x: slide?.focal_x ?? 0.5, y: slide?.focal_y ?? 0.5 };
  const [focal, setFocal] = useState(initialFocal);
  const image = slideImage({ background: background?.media ?? null }, activeIndex);

  const onDelete = async () => {
    if (!slide) return;
    const ok = await confirm({
      title: 'Supprimer cette slide ?',
      message: 'Elle disparaît de l’accueil et ne peut pas être restaurée. Pour la retirer seulement, décochez « Afficher sur l’accueil ».',
      confirmLabel: 'Supprimer la slide',
      danger: true,
    });
    if (ok) submit({ intent: 'delete' }, { method: 'post' });
  };

  return (
    <>
      <title>{`${slide?.title ?? 'Nouvelle slide'} | Page d'accueil | Administration E-GUITAP`}</title>
      <AdminPageHeader title={slide ? 'Modifier la slide' : 'Nouvelle slide'} description="Le grand bandeau en haut de l'accueil. Le texte doit rester court : il s'affiche aussi sur téléphone." />
      {result && !result.ok && <Notice tone="error">{result.message}</Notice>}

      <Form ref={formRef} method="post" onChange={unsaved.markDirty} onSubmit={unsaved.reset} className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <FormSection title="Textes">
              <Field label="Surtitre" hint="Petite ligne au-dessus du titre (facultatif).">
                <Input name="eyebrow" value={f.eyebrow} maxLength={120} onChange={(e) => set('eyebrow', e.target.value)} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Titre" required error={errors.title}>
                  <Input name="title" value={f.title} maxLength={120} onChange={(e) => set('title', e.target.value)} />
                </Field>
                <Field label="Suite du titre (en or)" hint="Deuxième ligne, mise en valeur.">
                  <Input name="title_highlight" value={f.highlight} maxLength={120} onChange={(e) => set('highlight', e.target.value)} />
                </Field>
              </div>
              <Field label="Sous-titre" hint="Une à deux phrases.">
                <Textarea name="subtitle" rows={3} value={f.subtitle} maxLength={400} onChange={(e) => set('subtitle', e.target.value)} />
              </Field>
              <label className="flex items-center gap-2.5 text-sm text-marine">
                <input type="checkbox" name="show_signature" checked={f.showSignature} onChange={(e) => set('showSignature', e.target.checked)} className="h-4 w-4 accent-marine" />
                Afficher la signature « {signature ?? 'signature de marque'} »
              </label>
            </FormSection>

            <FormSection title="Boutons" description={HREF_HINT}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Bouton principal : libellé" error={errors.primary_cta_label}>
                  <Input name="primary_cta_label" value={f.primary} maxLength={40} onChange={(e) => set('primary', e.target.value)} />
                </Field>
                <Field label="Bouton principal : adresse" error={errors.primary_cta_href}>
                  <Input name="primary_cta_href" defaultValue={slide?.primary_cta_href ?? ''} placeholder="/offres ou #devis" />
                </Field>
                <Field label="Bouton secondaire : libellé" error={errors.secondary_cta_label}>
                  <Input name="secondary_cta_label" value={f.secondary} maxLength={40} onChange={(e) => set('secondary', e.target.value)} />
                </Field>
                <Field label="Bouton secondaire : adresse" error={errors.secondary_cta_href}>
                  <Input name="secondary_cta_href" defaultValue={slide?.secondary_cta_href ?? ''} placeholder="/activites" />
                </Field>
              </div>
            </FormSection>

            <FormSection title="Image de fond" description="Sans image choisie, la slide utilise une photo d'illustration par défaut. Une image paysage d'au moins 1600 px de large est conseillée.">
              <ImagePicker
                name="background_media_id"
                label="Image de fond"
                value={background}
                onChange={(next) => {
                  setBackground(next);
                  setFocal({ x: 0.5, y: 0.5 });
                  unsaved.markDirty();
                }}
                fallback={slideImage({ background: null }, activeIndex)}
              />
              <div className="border-t border-slate-100 pt-5">
                <p className="mb-3 text-sm font-semibold text-marine">Cadrage (point focal)</p>
                <FocalPointPicker
                  image={image}
                  value={focal}
                  onChange={(v) => {
                    setFocal(v);
                    unsaved.markDirty();
                  }}
                />
              </div>
            </FormSection>

            <FormSection title="Affichage">
              <label className="flex items-center gap-2.5 text-sm text-marine">
                <input type="checkbox" name="is_active" defaultChecked={slide?.is_active ?? true} className="h-4 w-4 accent-marine" />
                Afficher sur l'accueil
              </label>
              <Field label="Ordre" hint="Les petits nombres passent en premier (les flèches de la liste le règlent aussi)." error={errors.sort_order} className="max-w-48">
                <Input name="sort_order" type="number" step={1} defaultValue={nextOrder} />
              </Field>
            </FormSection>
          </div>

          <aside className="xl:sticky xl:top-20 xl:self-start">
            <HeroPreview
              image={image}
              focal={focal}
              eyebrow={f.eyebrow}
              title={f.title}
              highlight={f.highlight}
              subtitle={f.subtitle}
              signature={f.showSignature ? signature : null}
              primary={f.primary}
              secondary={f.secondary}
            />
          </aside>
        </div>

        <StickyActionBar
          dirty={unsaved.dirty}
          saving={saving}
          saveLabel={slide ? 'Enregistrer' : 'Créer la slide'}
          onCancel={() => {
            formRef.current?.reset();
            setF(initial);
            setBackground(initialBackground);
            setFocal(initialFocal);
            unsaved.reset();
          }}
          extra={
            slide && session.staff.role === 'admin' ? (
              <button type="button" onClick={onDelete} className={dangerButton}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer
              </button>
            ) : undefined
          }
        />
      </Form>
    </>
  );
}
