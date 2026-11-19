import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { Field, Input, Textarea } from '../../../components/ui/Field';
import { Notice, PublicationBadge, PublishSwitch, cardClass, ghostButton, iconButton, primaryButton, secondaryButton, useConfirm, useResultToast } from '../../ui';
import type { ValueRow } from './companyData';
import type { ActionResult } from './shared';

/** Valeurs de l'entreprise : liste ordonnable, ajout et modification sur place. */
export function CompanyValues({ values, isAdmin }: { values: ValueRow[]; isAdmin: boolean }) {
  const [editing, setEditing] = useState<string | null>(null);
  const fetcher = useFetcher<ActionResult>();
  const confirm = useConfirm();
  const busy = fetcher.state !== 'idle';
  const close = useCallback(() => setEditing(null), []);
  useResultToast(fetcher.data);

  const remove = async (v: ValueRow) => {
    const ok = await confirm({ title: `Supprimer « ${v.title} » ?`, message: 'La valeur disparaît du site. Pour la masquer seulement, passez-la en brouillon.', confirmLabel: 'Supprimer', danger: true });
    if (ok) void fetcher.submit({ intent: 'value-delete', id: v.id }, { method: 'post' });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Affichées sur les pages Accueil et Entreprise, dans cet ordre. Seules les valeurs publiées sont visibles.</p>
      {fetcher.data && !fetcher.data.ok && <Notice tone="error">{fetcher.data.message}</Notice>}
      <ol className="space-y-2">
        {values.map((v, i) =>
          editing === v.id ? (
            <li key={v.id}>
              <ValueForm value={v} onDone={close} />
            </li>
          ) : (
            <li key={v.id} className={`${cardClass} flex items-start gap-3 p-3`}>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-marine">{v.title}</p>
                {v.description && <p className="mt-0.5 text-sm text-slate-600">{v.description}</p>}
              </div>
              <PublicationBadge value={v.publication} />
              <div className="flex shrink-0 items-center">
                <button type="button" disabled={i === 0 || busy} onClick={() => void fetcher.submit({ intent: 'value-move', id: v.id, direction: 'up' }, { method: 'post' })} className={iconButton} aria-label={`Monter « ${v.title} »`}>
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={i === values.length - 1 || busy}
                  onClick={() => void fetcher.submit({ intent: 'value-move', id: v.id, direction: 'down' }, { method: 'post' })}
                  className={iconButton}
                  aria-label={`Descendre « ${v.title} »`}
                >
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setEditing(v.id)} className={iconButton} aria-label={`Modifier « ${v.title} »`}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                {isAdmin && (
                  <button type="button" disabled={busy} onClick={() => void remove(v)} className={iconButton} aria-label={`Supprimer « ${v.title} »`}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </li>
          ),
        )}
      </ol>
      {editing === 'new' ? (
        <ValueForm value={null} onDone={close} />
      ) : (
        <button type="button" onClick={() => setEditing('new')} className={secondaryButton}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter une valeur
        </button>
      )}
    </div>
  );
}

function ValueForm({ value, onDone }: { value: ValueRow | null; onDone: () => void }) {
  const fetcher = useFetcher<ActionResult>();
  useResultToast(fetcher.data);
  // Le formulaire s'ouvre sur place : le curseur va directement au champ.
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => formRef.current?.querySelector<HTMLInputElement>('input[name="title"]')?.focus(), []);
  // Fermeture après un enregistrement réussi (le toast est affiché juste avant).
  const saved = fetcher.state === 'idle' && fetcher.data?.ok === true;
  useEffect(() => {
    if (saved) onDone();
  }, [saved, onDone]);
  const error = fetcher.data && !fetcher.data.ok ? fetcher.data.fieldErrors?.title ?? fetcher.data.message : undefined;

  return (
    <fetcher.Form ref={formRef} method="post" className={`${cardClass} space-y-4 border-marine/40 p-4`}>
      <input type="hidden" name="intent" value="value-save" />
      {value && <input type="hidden" name="id" value={value.id} />}
      <Field label="Valeur" required error={error}>
        <Input name="title" defaultValue={value?.title ?? ''} maxLength={80} />
      </Field>
      <Field label="Description" hint="Facultatif : une phrase d'explication.">
        <Textarea name="description" rows={2} defaultValue={value?.description ?? ''} maxLength={300} />
      </Field>
      <PublishSwitch defaultValue={value?.publication ?? 'publie'} />
      <div className="flex gap-2">
        <button type="submit" className={primaryButton} disabled={fetcher.state !== 'idle'}>
          {value ? 'Enregistrer' : 'Ajouter'}
        </button>
        <button type="button" className={ghostButton} onClick={onDone}>
          Annuler
        </button>
      </div>
    </fetcher.Form>
  );
}
