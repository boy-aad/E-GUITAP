import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';
import { ExternalLink, FileText, Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import { Field, Input, Select, Textarea } from '../../../components/ui/Field';
import { formatDate } from '../../format';
import { Badge, FormSection, Notice, cardClass, ghostButton, iconButton, primaryButton, secondaryButton, useConfirm, useResultToast, useToast } from '../../ui';
import type { ActionResult, DocumentRow } from './projectData';
import { DOCUMENT_ACCEPT, DOCUMENT_FILE_STATUS_LABELS, DOCUMENT_TYPE_LABELS, signedDocumentUrl } from './projectRelations';

const STATUS_TONE = { non_fourni: 'neutral', en_attente: 'warning', verifie_interne: 'info', valide_juridiquement: 'success' } as const;

/** Documents fonciers (administrateurs) : bucket privé, consultation par lien signé de 60 secondes. */
export function ProjectDocuments({ documents }: { documents: DocumentRow[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const fetcher = useFetcher<ActionResult>();
  const confirm = useConfirm();
  const toast = useToast();
  const close = useCallback(() => setEditing(null), []);
  useResultToast(fetcher.data);

  const open = async (doc: DocumentRow) => {
    // Fenêtre ouverte tout de suite (sinon bloquée comme fenêtre surgissante), puis dirigée vers le lien signé.
    const win = window.open('', '_blank');
    if (win) win.opener = null;
    try {
      const url = await signedDocumentUrl(doc.storage_path);
      if (win) win.location.href = url;
      else window.location.assign(url);
    } catch (e) {
      win?.close();
      toast('error', `Consultation impossible : ${e instanceof Error ? e.message : 'erreur inconnue'}`);
    }
  };

  const remove = async (doc: DocumentRow) => {
    const ok = await confirm({ title: `Supprimer « ${doc.title} » ?`, message: 'La fiche et le fichier seront supprimés définitivement. Cette action est irréversible.', confirmLabel: 'Supprimer le document', danger: true });
    if (ok) void fetcher.submit({ intent: 'doc-delete', id: doc.id }, { method: 'post' });
  };

  return (
    <FormSection title="Documents fonciers" description="Réservés aux administrateurs, jamais visibles sur le site. Chaque consultation passe par un lien temporaire valable 60 secondes.">
      <p className="flex gap-2 rounded-lg bg-ivory px-3 py-2.5 text-xs text-slate-text">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Le statut de chaque document est indicatif ; le statut documentaire du projet (onglet Statuts) reste celui qui autorise l'ouverture de la commercialisation.
      </p>
      {fetcher.data && !fetcher.data.ok && <Notice tone="error">{fetcher.data.message}</Notice>}
      {documents.length === 0 && editing !== 'new' && <p className="text-sm text-slate-600">Aucun document enregistré.</p>}
      <ul className="space-y-2">
        {documents.map((doc) =>
          editing === doc.id ? (
            <li key={doc.id}>
              <DocumentForm doc={doc} onDone={close} />
            </li>
          ) : (
            <li key={doc.id} className={`${cardClass} flex flex-wrap items-start gap-3 p-3`}>
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-marine" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-marine">{doc.title}</p>
                <p className="text-xs text-slate-500">
                  {DOCUMENT_TYPE_LABELS[doc.doc_type]} · ajouté le {formatDate(doc.created_at)}
                </p>
                {doc.notes && <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{doc.notes}</p>}
              </div>
              <Badge tone={STATUS_TONE[doc.status]}>{DOCUMENT_FILE_STATUS_LABELS[doc.status]}</Badge>
              <div className="flex shrink-0 items-center">
                <button type="button" onClick={() => void open(doc)} className={iconButton} aria-label={`Consulter « ${doc.title} » (nouvel onglet)`}>
                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setEditing(doc.id)} className={iconButton} aria-label={`Modifier « ${doc.title} »`}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" disabled={fetcher.state !== 'idle'} onClick={() => void remove(doc)} className={iconButton} aria-label={`Supprimer « ${doc.title} »`}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </li>
          ),
        )}
      </ul>
      {editing === 'new' ? (
        <DocumentForm doc={null} onDone={close} />
      ) : (
        <button type="button" onClick={() => setEditing('new')} className={secondaryButton}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter un document
        </button>
      )}
    </FormSection>
  );
}

function DocumentForm({ doc, onDone }: { doc: DocumentRow | null; onDone: () => void }) {
  const fetcher = useFetcher<ActionResult>();
  useResultToast(fetcher.data);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => formRef.current?.querySelector<HTMLInputElement>(doc ? 'input[name="title"]' : 'input[name="file"]')?.focus(), [doc]);
  const saved = fetcher.state === 'idle' && fetcher.data?.ok === true;
  useEffect(() => {
    if (saved) onDone();
  }, [saved, onDone]);
  const errors = fetcher.data && !fetcher.data.ok ? (fetcher.data.fieldErrors ?? {}) : {};
  const busy = fetcher.state !== 'idle';

  return (
    <fetcher.Form ref={formRef} method="post" encType="multipart/form-data" className={`${cardClass} space-y-4 border-marine/40 p-4`}>
      <input type="hidden" name="intent" value={doc ? 'doc-update' : 'doc-add'} />
      {doc && <input type="hidden" name="id" value={doc.id} />}
      {fetcher.data && !fetcher.data.ok && !fetcher.data.fieldErrors && <Notice tone="error">{fetcher.data.message}</Notice>}
      {!doc && (
        <Field label="Fichier" required hint="PDF, JPEG, PNG ou WebP ; 20 Mo au maximum." error={errors.file}>
          <input
            name="file"
            type="file"
            accept={DOCUMENT_ACCEPT}
            className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-marine file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
          />
        </Field>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Titre" required error={errors.title}>
          <Input name="title" defaultValue={doc?.title ?? ''} maxLength={160} />
        </Field>
        <Field label="Type" error={errors.doc_type}>
          <Select name="doc_type" defaultValue={doc?.doc_type ?? 'titre_foncier'}>
            {Object.entries(DOCUMENT_TYPE_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Statut" error={errors.status}>
          <Select name="status" defaultValue={doc?.status ?? 'en_attente'}>
            {Object.entries(DOCUMENT_FILE_STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Notes internes" hint="Facultatives.">
        <Textarea name="notes" rows={2} defaultValue={doc?.notes ?? ''} maxLength={1000} />
      </Field>
      <div className="flex gap-2">
        <button type="submit" className={primaryButton} disabled={busy}>
          {busy ? 'Envoi…' : doc ? 'Enregistrer' : 'Ajouter le document'}
        </button>
        <button type="button" className={ghostButton} onClick={onDone}>
          Annuler
        </button>
      </div>
    </fetcher.Form>
  );
}
