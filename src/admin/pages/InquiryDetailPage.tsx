import type { ReactNode } from 'react';
import { Form, useActionData, useLoaderData, useNavigation, useOutletContext, useSubmit } from 'react-router';
import { CheckCheck, Loader2, PlayCircle, Save, Trash2 } from 'lucide-react';
import { Field, Select, Textarea } from '../../components/ui/Field';
import type { AdminSession } from '../auth';
import { INQUIRY_STATUS_LABELS, INQUIRY_TYPE_LABELS, formatDateTime } from '../format';
import {
  AdminPageHeader,
  InquiryStatusBadge,
  Notice,
  cardClass,
  dangerButton,
  primaryButton,
  secondaryButton,
  useConfirm,
  useResultToast,
  useUnsavedChanges,
} from '../ui';
import type { ActionResult, DetailData } from './inquiries/inquiryDetail';
import { HistoryPanel, QuoteDetailsPanel, ReplyPanel, topicLink } from './inquiries/InquiryPanels';

export { action, loader } from './inquiries/inquiryDetail';

export const handle = { crumb: (data: unknown) => (data as DetailData | undefined)?.inquiry.full_name ?? 'Demande' };

export function Component() {
  const data = useLoaderData() as DetailData;
  // Clé : après un changement rapide de statut, le formulaire repart des valeurs enregistrées.
  return <InquiryDetail key={`${data.inquiry.id}-${data.inquiry.updated_at}`} {...data} />;
}

function InquiryDetail({ inquiry, staff, history }: DetailData) {
  const result = useActionData() as ActionResult | undefined;
  const navigation = useNavigation();
  const session = useOutletContext<AdminSession>();
  const confirm = useConfirm();
  const submit = useSubmit();
  const busy = navigation.state !== 'idle';
  const pendingIntent = navigation.formData?.get('intent');
  const unsaved = useUnsavedChanges(busy);
  useResultToast(result);

  const onDelete = async () => {
    const ok = await confirm({
      title: 'Supprimer cette demande ?',
      message: `La demande de ${inquiry.full_name} sera supprimée définitivement. Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
    if (ok) submit({ intent: 'delete' }, { method: 'post' });
  };

  const quickStatus = (status: 'en_cours' | 'traite') => submit({ intent: 'status', status }, { method: 'post' });

  const rows: [string, ReactNode][] = [
    ['Reçue le', formatDateTime(inquiry.created_at)],
    ['Type', INQUIRY_TYPE_LABELS[inquiry.type]],
    ['Objet', topicLink(inquiry)],
    ['Organisation', inquiry.organization ?? '—'],
    ['Page d’origine', inquiry.source_page ?? '—'],
    ['Consentement', `Oui, le ${formatDateTime(inquiry.consent_at)}`],
  ];

  return (
    <>
      <title>{`${inquiry.full_name} | Demandes | Administration E-GUITAP`}</title>
      <AdminPageHeader
        title={inquiry.full_name}
        description={inquiry.subject ?? undefined}
        actions={
          <>
            <InquiryStatusBadge value={inquiry.status} />
            {inquiry.status === 'nouveau' && (
              <button type="button" onClick={() => quickStatus('en_cours')} disabled={busy} className={secondaryButton}>
                {pendingIntent === 'status' ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <PlayCircle className="h-4 w-4" aria-hidden="true" />}
                Marquer en cours
              </button>
            )}
            {(inquiry.status === 'nouveau' || inquiry.status === 'en_cours') && (
              <button type="button" onClick={() => quickStatus('traite')} disabled={busy} className={primaryButton}>
                <CheckCheck className="h-4 w-4" aria-hidden="true" /> Marquer traitée
              </button>
            )}
          </>
        }
      />

      {result && !result.ok && <Notice tone="error">{result.message}</Notice>}
      {!inquiry.notified_at && (
        <Notice tone="warning">
          La notification e-mail de cette demande n'a pas été envoyée.
          {inquiry.notification_error && <span className="mt-1 block break-words text-xs opacity-80">{inquiry.notification_error}</span>}
        </Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className={`${cardClass} p-5`} aria-labelledby="message">
            <h2 id="message" className="mb-3 font-poppins text-base font-bold text-marine">
              Message
            </h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{inquiry.message}</p>
          </section>
          {inquiry.type === 'demande_devis' && <QuoteDetailsPanel details={inquiry.request_details} />}
          <section className={`${cardClass} p-5`} aria-labelledby="details">
            <h2 id="details" className="mb-3 font-poppins text-base font-bold text-marine">
              Détails
            </h2>
            <dl className="divide-y divide-slate-100 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-2 sm:grid-cols-3">
                  <dt className="text-slate-600">{k}</dt>
                  <dd className="sm:col-span-2">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <HistoryPanel history={history} />
        </div>

        <div className="space-y-6">
          <ReplyPanel inquiry={inquiry} />

          <Form method="post" onChange={unsaved.markDirty} onSubmit={unsaved.reset} className={`${cardClass} space-y-4 p-5`}>
            <h2 className="font-poppins text-base font-bold text-marine">Suivi</h2>
            <Field label="Statut">
              <Select name="status" defaultValue={inquiry.status}>
                {Object.entries(INQUIRY_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Assignée à" hint="Personne de l'équipe qui suit la demande.">
              <Select name="assigned_to" defaultValue={inquiry.assigned_to ?? ''}>
                <option value="">Personne</option>
                {staff.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                    {s.value === session.userId ? ' (moi)' : ''}
                  </option>
                ))}
                {/* Assignée à un collègue non visible avec vos droits : on conserve la valeur. */}
                {inquiry.assigned_to && !staff.some((s) => s.value === inquiry.assigned_to) && (
                  <option value={inquiry.assigned_to}>Un membre de l’équipe</option>
                )}
              </Select>
            </Field>
            <Field label="Notes internes" hint="Visibles uniquement par l'équipe.">
              <Textarea name="internal_notes" rows={5} defaultValue={inquiry.internal_notes ?? ''} />
            </Field>
            {unsaved.dirty && <p className="text-xs font-semibold text-amber-800">Modifications non enregistrées</p>}
            <button type="submit" name="intent" value="update" disabled={busy} className={`${primaryButton} w-full`}>
              <Save className="h-4 w-4" aria-hidden="true" /> {busy && pendingIntent === 'update' ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </Form>

          {session.staff.role === 'admin' && (
            <button type="button" onClick={onDelete} className={`${dangerButton} w-full`}>
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer la demande
            </button>
          )}
        </div>
      </div>
    </>
  );
}
