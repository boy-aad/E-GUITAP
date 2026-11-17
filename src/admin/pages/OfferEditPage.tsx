import { useState } from 'react';
import { Form, Link, redirect, useActionData, useLoaderData, useNavigation } from 'react-router';
import { ArrowLeft, ExternalLink, Save } from 'lucide-react';
import { Field, Input, Select, Textarea } from '../../components/ui/Field';
import { supabase } from '../../lib/supabase';
import type { Enums, TablesUpdate } from '../../types/database';
import { AVAILABILITY_LABELS, PUBLICATION_LABELS, friendlyDbError } from '../format';
import { AdminPageHeader, Notice, cardClass, primaryButton } from '../ui';

type Params = { params: { id?: string } };
type ActionResult = { ok: false; message: string; fieldErrors?: Record<string, string> };

const SUMMARY_MAX = 200;

export async function loader({ params }: Params) {
  const { data, error } = await supabase
    .from('activity_services')
    .select('id, slug, title, summary, description, availability, publication, is_featured, quote_enabled, sort_order, activity_domains (title)')
    .eq('id', params.id ?? '')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Response('Offre introuvable', { status: 404 });
  return data;
}

const text = (v: FormDataEntryValue | null) => (typeof v === 'string' ? v.trim() : '');

export async function action({ request, params }: Params & { request: Request }): Promise<ActionResult | Response> {
  const form = await request.formData();
  const title = text(form.get('title'));
  const summary = text(form.get('summary'));
  const sortOrder = Number(text(form.get('sort_order')) || '0');

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = 'Le titre est obligatoire.';
  if (summary.length > SUMMARY_MAX) fieldErrors.summary = `${SUMMARY_MAX} caractères au maximum.`;
  if (!Number.isInteger(sortOrder)) fieldErrors.sort_order = 'Indiquez un nombre entier.';
  if (Object.keys(fieldErrors).length) return { ok: false, message: 'Certains champs sont à corriger.', fieldErrors };

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const values: TablesUpdate<'activity_services'> = {
    title,
    summary: summary || null,
    description: text(form.get('description')) || null,
    availability: text(form.get('availability')) as Enums<'availability_status'>,
    publication: text(form.get('publication')) as Enums<'publication_status'>,
    is_featured: form.get('is_featured') === 'on',
    quote_enabled: form.get('quote_enabled') === 'on',
    sort_order: sortOrder,
    updated_by: session?.user.id ?? null,
  };
  const { error } = await supabase.from('activity_services').update(values).eq('id', params.id ?? '');
  if (error) return { ok: false, message: friendlyDbError(error) };
  throw redirect('/admin/offres?enregistre=1');
}

export function Component() {
  const offer = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const result = useActionData() as ActionResult | undefined;
  const saving = useNavigation().state === 'submitting';
  const [summary, setSummary] = useState(offer.summary ?? '');
  const errors = result?.fieldErrors ?? {};

  return (
    <>
      <title>{`${offer.title} | Offres | Administration E-GUITAP`}</title>
      <Link to="/admin/offres" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-marine hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Toutes les offres
      </Link>
      <AdminPageHeader
        title={offer.title}
        description={`Catégorie : ${offer.activity_domains?.title ?? '—'}. Prix : jamais affichés, l'offre est « sur devis ».`}
        actions={
          offer.publication === 'publie' ? (
            <a href={`/offres/${offer.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-marine hover:underline">
              Voir sur le site <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : undefined
        }
      />
      {result && !result.ok && <Notice tone="error">{result.message}</Notice>}

      <Form method="post" className={`${cardClass} space-y-5 p-5 sm:p-6`}>
        <Field label="Titre" required error={errors.title}>
          <Input name="title" defaultValue={offer.title} maxLength={200} />
        </Field>
        <Field label="Adresse de la fiche" hint="Fixée à la création pour ne pas casser les liens partagés.">
          <Input value={`/offres/${offer.slug}`} readOnly className="bg-paper text-slate-text" />
        </Field>
        <Field
          label="Résumé (cartes du catalogue)"
          hint={`${summary.length} / ${SUMMARY_MAX} caractères`}
          error={errors.summary}
        >
          <Textarea name="summary" rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={SUMMARY_MAX} />
        </Field>
        <Field label="Description (fiche de l'offre)" hint="Laissez une ligne vide entre deux paragraphes.">
          <Textarea name="description" rows={8} defaultValue={offer.description ?? ''} maxLength={5000} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Disponibilité">
            <Select name="availability" defaultValue={offer.availability}>
              {Object.entries(AVAILABILITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Publication">
            <Select name="publication" defaultValue={offer.publication}>
              {Object.entries(PUBLICATION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Ordre dans la catégorie" error={errors.sort_order}>
            <Input name="sort_order" type="number" step={1} defaultValue={offer.sort_order} />
          </Field>
        </div>

        <div className="flex flex-col gap-3 text-sm text-marine sm:flex-row sm:gap-8">
          <label className="flex items-center gap-2.5">
            <input type="checkbox" name="is_featured" defaultChecked={offer.is_featured} className="h-4 w-4 accent-marine" />
            Mettre en avant (accueil et tête du catalogue)
          </label>
          <label className="flex items-center gap-2.5">
            <input type="checkbox" name="quote_enabled" defaultChecked={offer.quote_enabled} className="h-4 w-4 accent-marine" />
            Bouton « Demander un devis »
          </label>
        </div>

        <div className="flex justify-end border-t border-slate-200 pt-5">
          <button type="submit" className={primaryButton} disabled={saving}>
            <Save className="h-4 w-4" aria-hidden="true" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </Form>
    </>
  );
}
