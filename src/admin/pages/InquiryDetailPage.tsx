import type { ReactNode } from 'react';
import { Form, Link, redirect, useActionData, useLoaderData, useNavigation, useOutletContext } from 'react-router';
import { ArrowLeft, Mail, MessageSquare, Phone, Save, Trash2 } from 'lucide-react';
import { Field, Select, Textarea } from '../../components/ui/Field';
import { supabase } from '../../lib/supabase';
import { mailtoUrl, telUrl, whatsappUrl } from '../../lib/contact';
import type { Enums } from '../../types/database';
import type { AdminSession } from '../auth';
import {
  INQUIRY_STATUS_LABELS,
  INQUIRY_STATUS_TONE as STATUS_TONE,
  INQUIRY_TYPE_LABELS,
  formatDateTime,
  friendlyDbError,
} from '../format';
import { AdminPageHeader, Badge, Notice, cardClass, dangerButton, primaryButton } from '../ui';

type Params = { params: { id?: string } };

export async function loader({ params }: Params) {
  const { data, error } = await supabase
    .from('inquiries')
    .select('*, activity_domains (title), land_projects (name, slug)')
    .eq('id', params.id ?? '')
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Response('Demande introuvable', { status: 404 });
  return data;
}

export async function action({ request, params }: Params & { request: Request }) {
  const form = await request.formData();
  const id = params.id ?? '';
  if (form.get('intent') === 'delete') {
    const { error } = await supabase.from('inquiries').delete().eq('id', id);
    if (error) return { ok: false, message: friendlyDbError(error) };
    throw redirect('/admin/demandes?supprime=1');
  }
  const { error } = await supabase
    .from('inquiries')
    .update({
      status: String(form.get('status')) as Enums<'inquiry_status'>,
      internal_notes: String(form.get('internal_notes') ?? '').trim() || null,
    })
    .eq('id', id);
  return error ? { ok: false, message: friendlyDbError(error) } : { ok: true, message: 'Modifications enregistrées.' };
}

export function Component() {
  const inquiry = useLoaderData() as Awaited<ReturnType<typeof loader>>;
  const result = useActionData() as { ok: boolean; message: string } | undefined;
  const navigation = useNavigation();
  const session = useOutletContext<AdminSession>();
  const saving = navigation.state === 'submitting';

  const rows: [string, ReactNode][] = [
    ['Reçue le', formatDateTime(inquiry.created_at)],
    ['Type', INQUIRY_TYPE_LABELS[inquiry.type]],
    ['Sujet', inquiry.subject ?? '—'],
    [
      'Projet',
      inquiry.land_projects ? (
        <Link key="projet" to={`/projets/${inquiry.land_projects.slug}`} target="_blank" className="underline">
          {inquiry.land_projects.name}
        </Link>
      ) : (
        '—'
      ),
    ],
    ['Domaine', inquiry.activity_domains?.title ?? '—'],
    ['Organisation', inquiry.organization ?? '—'],
    ['Page d’origine', inquiry.source_page ?? '—'],
    ['Consentement', `Oui, le ${formatDateTime(inquiry.consent_at)}`],
  ];

  return (
    <>
      <title>{`${inquiry.full_name} | Demandes | Administration E-GUITAP`}</title>
      <Link to="/admin/demandes" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:text-gold-hover">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Toutes les demandes
      </Link>
      <AdminPageHeader
        title={inquiry.full_name}
        description={inquiry.subject ?? undefined}
        actions={<Badge tone={STATUS_TONE[inquiry.status]}>{INQUIRY_STATUS_LABELS[inquiry.status]}</Badge>}
      />

      {result && <Notice tone={result.ok ? 'success' : 'error'}>{result.message}</Notice>}
      {!inquiry.notified_at && (
        <Notice tone="error">
          La notification e-mail de cette demande n'a pas été envoyée.
          {inquiry.notification_error && <span className="mt-1 block text-xs opacity-80">{inquiry.notification_error}</span>}
        </Notice>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className={`${cardClass} p-5`}>
            <h2 className="mb-3 font-poppins text-base font-bold">Message</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{inquiry.message}</p>
          </section>
          <section className={`${cardClass} p-5`}>
            <h2 className="mb-3 font-poppins text-base font-bold">Détails</h2>
            <dl className="divide-y divide-slate-100 text-sm">
              {rows.map(([k, v]) => (
                <div key={k} className="grid gap-1 py-2 sm:grid-cols-3">
                  <dt className="text-slate-text">{k}</dt>
                  <dd className="sm:col-span-2">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="space-y-6">
          <section className={`${cardClass} space-y-2 p-5`}>
            <h2 className="mb-1 font-poppins text-base font-bold">Répondre</h2>
            <a href={telUrl(inquiry.phone)} className="flex items-center gap-2 text-sm hover:underline">
              <Phone className="h-4 w-4 text-gold-hover" aria-hidden="true" /> {inquiry.phone}
            </a>
            <a
              href={whatsappUrl(inquiry.phone, `Bonjour ${inquiry.full_name}, nous revenons vers vous suite à votre demande sur le site E-GUITAP.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm hover:underline"
            >
              <MessageSquare className="h-4 w-4 text-gn-green" aria-hidden="true" /> WhatsApp
            </a>
            {inquiry.email && (
              <a
                href={mailtoUrl(inquiry.email, `Votre demande — ${inquiry.subject ?? 'E-GUITAP'}`)}
                className="flex items-center gap-2 break-all text-sm hover:underline"
              >
                <Mail className="h-4 w-4 text-gold-hover" aria-hidden="true" /> {inquiry.email}
              </a>
            )}
          </section>

          <Form method="post" className={`${cardClass} space-y-4 p-5`}>
            <h2 className="font-poppins text-base font-bold">Suivi</h2>
            <Field label="Statut">
              <Select name="status" defaultValue={inquiry.status}>
                {Object.entries(INQUIRY_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Notes internes" hint="Visibles uniquement par l'équipe.">
              <Textarea name="internal_notes" rows={5} defaultValue={inquiry.internal_notes ?? ''} />
            </Field>
            <button type="submit" name="intent" value="update" disabled={saving} className={`${primaryButton} w-full`}>
              <Save className="h-4 w-4" aria-hidden="true" /> Enregistrer
            </button>
          </Form>

          {session.staff.role === 'admin' && (
            <Form
              method="post"
              onSubmit={(e) => {
                if (!window.confirm('Supprimer définitivement cette demande ? Cette action est irréversible.')) e.preventDefault();
              }}
            >
              <button type="submit" name="intent" value="delete" className={`${dangerButton} w-full`}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer la demande
              </button>
            </Form>
          )}
        </div>
      </div>
    </>
  );
}
