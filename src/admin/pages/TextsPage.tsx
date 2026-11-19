import { useEffect, useState } from 'react';
import { useFetcher, useLoaderData, useNavigation } from 'react-router';
import { Eye, Pencil } from 'lucide-react';
import { Field, Input, Textarea } from '../../components/ui/Field';
import { formatDateTime } from '../format';
import { AdminPageHeader, Notice, PublicationBadge, PublishSwitch, cardClass, ghostButton, primaryButton, useResultToast, useUnsavedChanges } from '../ui';
import type { ActionResult } from './content/shared';
import { TEXT_BLOCKS, action as textsAction, loader as textsLoader, type BlockRow, type TextsData } from './content/textsData';

export const loader = textsLoader;
export const action = textsAction;
export const handle = { crumb: 'Textes des pages' };

export function Component() {
  const { blocks } = useLoaderData() as TextsData;
  const navigation = useNavigation();
  const unsaved = useUnsavedChanges(navigation.state !== 'idle');
  const [dirty, setDirty] = useState<ReadonlySet<string>>(new Set());
  const { markDirty, reset } = unsaved;

  // Un seul garde-fou pour la page : actif tant qu'un bloc a des modifications.
  useEffect(() => {
    if (dirty.size) markDirty();
    else reset();
    // oxlint-disable-next-line react/exhaustive-deps -- markDirty / reset changent à chaque rendu ; seul `dirty` compte.
  }, [dirty]);

  const setBlockDirty = (key: string, value: boolean) =>
    setDirty((prev) => {
      if (prev.has(key) === value) return prev;
      const next = new Set(prev);
      if (value) next.add(key);
      else next.delete(key);
      return next;
    });

  return (
    <>
      <title>Textes des pages | Administration E-GUITAP</title>
      <AdminPageHeader
        title="Textes des pages"
        description="Textes d'introduction et d'accroche du site. Un texte en brouillon n'est pas affiché : le site garde alors son texte par défaut."
      />
      <div className="space-y-5">
        {TEXT_BLOCKS.map((b) => (
          <BlockCard key={b.key} meta={b} row={blocks.find((r) => r.key === b.key) ?? null} onDirty={(v) => setBlockDirty(b.key, v)} />
        ))}
      </div>
    </>
  );
}

function BlockCard({ meta, row, onDirty }: { meta: (typeof TEXT_BLOCKS)[number]; row: BlockRow | null; onDirty: (dirty: boolean) => void }) {
  const fetcher = useFetcher<ActionResult>();
  const [title, setTitle] = useState(row?.title ?? '');
  const [body, setBody] = useState(row?.body ?? '');
  const [preview, setPreview] = useState(false);
  const [changed, setChanged] = useState(false);
  const saving = fetcher.state !== 'idle';
  const result = fetcher.data;
  useResultToast(result);

  // Enregistré : le bloc n'a plus de modification en attente.
  const saved = !saving && result?.ok === true;
  useEffect(() => {
    if (saved) {
      setChanged(false);
      onDirty(false);
    }
    // oxlint-disable-next-line react/exhaustive-deps -- `onDirty` est recréé à chaque rendu de la page.
  }, [saved, result]);

  const markChanged = () => {
    if (!changed) {
      setChanged(true);
      onDirty(true);
    }
  };

  const bodyError = result && !result.ok ? result.fieldErrors?.[`${meta.key}.body`] : undefined;

  return (
    <section className={`${cardClass} p-5`} aria-labelledby={`bloc-${meta.key}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`bloc-${meta.key}`} className="font-poppins text-base font-semibold text-marine">
            {meta.label}
          </h2>
          <p className="mt-0.5 text-sm text-slate-600">{meta.where}</p>
        </div>
        <div className="flex items-center gap-2">
          {row ? <PublicationBadge value={row.publication} /> : <span className="text-xs text-slate-500">Jamais enregistré</span>}
          <button type="button" className={ghostButton} onClick={() => setPreview((p) => !p)} aria-pressed={preview}>
            {preview ? <Pencil className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            {preview ? 'Modifier' : 'Aperçu'}
          </button>
        </div>
      </div>

      {result && !result.ok && !bodyError && (
        <div className="mt-4">
          <Notice tone="error">{result.message}</Notice>
        </div>
      )}

      <fetcher.Form method="post" onChange={markChanged} className="mt-4 space-y-4">
        <input type="hidden" name="key" value={meta.key} />
        <div hidden={preview} className="space-y-4">
          {meta.titleUsed && (
            <Field label="Titre" hint="Laissez vide pour garder le titre par défaut.">
              <Input name="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} />
            </Field>
          )}
          <Field label="Texte" hint="Les retours à la ligne sont conservés." error={bodyError}>
            <Textarea name="body" rows={5} value={body} onChange={(e) => setBody(e.target.value)} maxLength={3000} />
          </Field>
        </div>
        {preview && (
          <div className="rounded-lg border border-slate-200 bg-paper p-5">
            {meta.titleUsed && title && <p className="font-poppins text-xl font-bold text-marine">{title}</p>}
            {body ? <p className="mt-2 whitespace-pre-line leading-relaxed text-slate-text">{body}</p> : <p className="text-sm italic text-slate-500">{meta.fallback}</p>}
          </div>
        )}
        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4">
          <PublishSwitch defaultValue={row?.publication ?? 'brouillon'} />
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500" aria-live="polite">
              {saving ? 'Enregistrement…' : changed ? <span className="font-semibold text-amber-800">Modifications non enregistrées</span> : row ? `Modifié le ${formatDateTime(row.updated_at)}` : ''}
            </span>
            <button type="submit" className={primaryButton} disabled={saving}>
              Enregistrer
            </button>
          </div>
        </div>
      </fetcher.Form>
    </section>
  );
}
