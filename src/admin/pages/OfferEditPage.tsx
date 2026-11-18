import { useRef, useState } from 'react';
import { Form, useActionData, useLoaderData, useNavigation, useOutletContext, useSearchParams, useSubmit } from 'react-router';
import { ExternalLink, ImageIcon, Trash2 } from 'lucide-react';
import { Field, Input, Select, Textarea } from '../../components/ui/Field';
import type { AdminSession } from '../auth';
import { AVAILABILITY_LABELS, slugify } from '../format';
import { AdminPageHeader, FormSection, Notice, PublishSwitch, StickyActionBar, dangerButton, useConfirm, useFlashToast, useUnsavedChanges } from '../ui';
import { SUMMARY_MAX, editAction, editLoader, type ActionResult, type EditData } from './offers/offerData';
import { OfferPreview } from './offers/OfferPreview';

export const loader = editLoader;
export const action = editAction;
export const handle = { crumb: (data: unknown) => (data as EditData | undefined)?.offer?.title ?? 'Nouvelle offre' };

export function Component() {
  const data = useLoaderData() as EditData;
  return <OfferForm key={`${data.offer?.id ?? 'nouvelle'}-${data.offer?.updated_at ?? ''}`} {...data} />;
}

function OfferForm({ offer, domains }: EditData) {
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
  useFlashToast(Boolean(params.get('cree')), 'Offre créée.');
  useFlashToast(Boolean(params.get('copie')), 'Offre dupliquée : la copie est en brouillon.');

  // Champs suivis pour l'aperçu en direct et l'identifiant proposé.
  const initial = {
    title: offer?.title ?? '',
    slug: offer?.slug ?? '',
    summary: offer?.summary ?? '',
    domainId: offer?.domain_id ?? '',
    availability: offer?.availability ?? 'operationnelle',
    featured: offer?.is_featured ?? false,
    quote: offer?.quote_enabled ?? true,
  };
  const [f, setF] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(offer));
  const set = <K extends keyof typeof initial>(k: K, v: (typeof initial)[K]) => setF((prev) => ({ ...prev, [k]: v }));
  const domain = domains.find((d) => d.id === f.domainId) ?? null;

  const onDelete = async () => {
    if (!offer) return;
    const ok = await confirm({
      title: `Supprimer « ${offer.title} » ?`,
      message: 'L’offre disparaît du catalogue et ne peut pas être restaurée. Pour la masquer seulement, passez-la en « Archivé ».',
      confirmLabel: 'Supprimer l’offre',
      danger: true,
    });
    if (ok) submit({ intent: 'delete' }, { method: 'post' });
  };

  return (
    <>
      <title>{`${offer?.title ?? 'Nouvelle offre'} | Offres | Administration E-GUITAP`}</title>
      <AdminPageHeader
        title={offer?.title ?? 'Nouvelle offre'}
        description="Aucun prix n'est affiché : l'offre est toujours « sur devis »."
        actions={
          offer?.publication === 'publie' ? (
            <a href={`/offres/${offer.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-marine hover:underline">
              Voir sur le site <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : undefined
        }
      />
      {result && !result.ok && <Notice tone="error">{result.message}</Notice>}

      <Form ref={formRef} method="post" onChange={unsaved.markDirty} onSubmit={unsaved.reset}>
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <FormSection title="Contenu" description="Textes de la carte du catalogue et de la fiche de l'offre.">
              <Field label="Titre" required error={errors.title}>
                <Input
                  name="title"
                  value={f.title}
                  maxLength={200}
                  onChange={(e) => {
                    set('title', e.target.value);
                    if (!slugTouched) set('slug', slugify(e.target.value));
                  }}
                />
              </Field>
              <Field
                label="Identifiant d'URL"
                hint={offer ? `Adresse : /offres/${f.slug || '…'} — le modifier casse les liens déjà partagés.` : `Adresse : /offres/${f.slug || '…'}`}
                error={errors.slug}
              >
                <Input
                  name="slug"
                  value={f.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set('slug', e.target.value);
                  }}
                />
              </Field>
              <Field label="Catégorie" required error={errors.domain_id}>
                <Select name="domain_id" value={f.domainId} onChange={(e) => set('domainId', e.target.value)}>
                  <option value="">Choisir…</option>
                  {domains.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Résumé (carte du catalogue)" hint={`${f.summary.length} / ${SUMMARY_MAX} caractères`} error={errors.summary}>
                <Textarea name="summary" rows={3} value={f.summary} maxLength={SUMMARY_MAX} onChange={(e) => set('summary', e.target.value)} />
              </Field>
              <Field label="Description (fiche de l'offre)" hint="Laissez une ligne vide entre deux paragraphes.">
                <Textarea name="description" rows={8} defaultValue={offer?.description ?? ''} maxLength={5000} />
              </Field>
            </FormSection>

            <FormSection title="Affichage" description="Visibilité sur le site et place dans la catégorie.">
              <PublishSwitch defaultValue={offer?.publication ?? 'brouillon'} />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Disponibilité">
                  <Select name="availability" value={f.availability} onChange={(e) => set('availability', e.target.value as typeof f.availability)}>
                    {Object.entries(AVAILABILITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Ordre dans la catégorie" hint="Les petits nombres s'affichent en premier." error={errors.sort_order}>
                  <Input name="sort_order" type="number" step={1} defaultValue={offer?.sort_order ?? 100} />
                </Field>
              </div>
              <div className="flex flex-col gap-3 text-sm text-marine sm:flex-row sm:gap-8">
                <label className="flex items-center gap-2.5">
                  <input type="checkbox" name="is_featured" checked={f.featured} onChange={(e) => set('featured', e.target.checked)} className="h-4 w-4 accent-marine" />
                  Mettre en avant (accueil et tête du catalogue)
                </label>
                <label className="flex items-center gap-2.5">
                  <input type="checkbox" name="quote_enabled" checked={f.quote} onChange={(e) => set('quote', e.target.checked)} className="h-4 w-4 accent-marine" />
                  Bouton « Demander un devis »
                </label>
              </div>
            </FormSection>

            <FormSection title="Image" description="Sans image téléversée, la carte affiche l'illustration de l'offre (ou de sa catégorie).">
              <p className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
                <ImageIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                Le choix d'une photo depuis la médiathèque arrive avec le module Médiathèque (phase 6d).
              </p>
            </FormSection>
          </div>

          <aside className="xl:sticky xl:top-20 xl:self-start">
            <OfferPreview
              title={f.title}
              slug={f.slug}
              summary={f.summary}
              categoryLabel={domain?.short_title ?? null}
              categorySlug={domain?.slug ?? null}
              inDevelopment={f.availability === 'en_developpement'}
              featured={f.featured}
              quoteEnabled={f.quote}
              cover={offer?.cover ?? null}
            />
          </aside>
        </div>

        <StickyActionBar
          dirty={unsaved.dirty}
          saving={saving}
          saveLabel={offer ? 'Enregistrer' : 'Créer l’offre'}
          onCancel={() => {
            formRef.current?.reset();
            setF(initial);
            setSlugTouched(Boolean(offer));
            unsaved.reset();
          }}
          extra={
            offer && session.staff.role === 'admin' ? (
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
