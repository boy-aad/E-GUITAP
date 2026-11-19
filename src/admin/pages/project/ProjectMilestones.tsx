import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Field, Input, Textarea } from '../../../components/ui/Field';
import { formatDate } from '../../format';
import { Badge, FormSection, Notice, cardClass, ghostButton, iconButton, primaryButton, secondaryButton, useConfirm, useResultToast } from '../../ui';
import type { ActionResult, MilestoneRow } from './projectData';

/** Jalons du projet : étapes datées, publiques ou internes (enregistrement immédiat). */
export function ProjectMilestones({ milestones, published }: { milestones: MilestoneRow[]; published: boolean }) {
  const [editing, setEditing] = useState<string | null>(null);
  const fetcher = useFetcher<ActionResult>();
  const confirm = useConfirm();
  const close = useCallback(() => setEditing(null), []);
  useResultToast(fetcher.data);

  const remove = async (m: MilestoneRow) => {
    const ok = await confirm({ title: `Supprimer le jalon « ${m.title} » ?`, message: 'Cette action est irréversible.', confirmLabel: 'Supprimer', danger: true });
    if (ok) void fetcher.submit({ intent: 'milestone-delete', id: m.id }, { method: 'post' });
  };

  return (
    <FormSection
      title="Jalons"
      description={`Étapes du projet, classées par date. Un jalon « public » est affiché sur la page du projet${published ? '' : ' une fois le projet publié'} ; les autres restent internes.`}
    >
      {fetcher.data && !fetcher.data.ok && <Notice tone="error">{fetcher.data.message}</Notice>}
      {milestones.length === 0 && editing !== 'new' && <p className="text-sm text-slate-600">Aucun jalon enregistré.</p>}
      <ol className="space-y-2">
        {milestones.map((m) =>
          editing === m.id ? (
            <li key={m.id}>
              <MilestoneForm milestone={m} onDone={close} />
            </li>
          ) : (
            <li key={m.id} className={`${cardClass} flex items-start gap-3 p-3`}>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{m.occurred_on ? formatDate(`${m.occurred_on}T12:00:00`) : 'Sans date'}</p>
                <p className="font-semibold text-marine">{m.title}</p>
                {m.description && <p className="mt-0.5 whitespace-pre-line text-sm text-slate-600">{m.description}</p>}
              </div>
              <Badge tone={m.is_public ? 'success' : 'neutral'}>{m.is_public ? 'Public' : 'Interne'}</Badge>
              <div className="flex shrink-0 items-center">
                <button type="button" onClick={() => setEditing(m.id)} className={iconButton} aria-label={`Modifier « ${m.title} »`}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" disabled={fetcher.state !== 'idle'} onClick={() => void remove(m)} className={iconButton} aria-label={`Supprimer « ${m.title} »`}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ),
        )}
      </ol>
      {editing === 'new' ? (
        <MilestoneForm milestone={null} onDone={close} />
      ) : (
        <button type="button" onClick={() => setEditing('new')} className={secondaryButton}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter un jalon
        </button>
      )}
    </FormSection>
  );
}

function MilestoneForm({ milestone, onDone }: { milestone: MilestoneRow | null; onDone: () => void }) {
  const fetcher = useFetcher<ActionResult>();
  useResultToast(fetcher.data);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => formRef.current?.querySelector<HTMLInputElement>('input[name="title"]')?.focus(), []);
  const saved = fetcher.state === 'idle' && fetcher.data?.ok === true;
  useEffect(() => {
    if (saved) onDone();
  }, [saved, onDone]);
  const errors = fetcher.data && !fetcher.data.ok ? (fetcher.data.fieldErrors ?? {}) : {};

  return (
    <fetcher.Form ref={formRef} method="post" className={`${cardClass} space-y-4 border-marine/40 p-4`}>
      <input type="hidden" name="intent" value="milestone-save" />
      {milestone && <input type="hidden" name="id" value={milestone.id} />}
      {fetcher.data && !fetcher.data.ok && !fetcher.data.fieldErrors && <Notice tone="error">{fetcher.data.message}</Notice>}
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <Field label="Titre" required error={errors.title}>
          <Input name="title" defaultValue={milestone?.title ?? ''} maxLength={160} />
        </Field>
        <Field label="Date" hint="Facultative." error={errors.occurred_on}>
          <Input name="occurred_on" type="date" defaultValue={milestone?.occurred_on ?? ''} />
        </Field>
      </div>
      <Field label="Description" hint="Facultative.">
        <Textarea name="description" rows={2} defaultValue={milestone?.description ?? ''} maxLength={1000} />
      </Field>
      <label className="flex items-center gap-2.5 text-sm text-marine">
        <input type="checkbox" name="is_public" defaultChecked={milestone?.is_public ?? false} className="h-4 w-4 accent-marine" />
        Afficher sur la page du projet
      </label>
      <div className="flex gap-2">
        <button type="submit" className={primaryButton} disabled={fetcher.state !== 'idle'}>
          {milestone ? 'Enregistrer' : 'Ajouter'}
        </button>
        <button type="button" className={ghostButton} onClick={onDone}>
          Annuler
        </button>
      </div>
    </fetcher.Form>
  );
}
