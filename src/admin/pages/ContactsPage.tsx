import { useRef, useState } from 'react';
import { Form, useActionData, useLoaderData, useNavigation, useOutletContext } from 'react-router';
import { Plus, Trash2 } from 'lucide-react';
import { Field, Input } from '../../components/ui/Field';
import { SOCIAL_NETWORK_NAMES, socialNetworkOf } from '../../lib/social';
import type { AdminSession } from '../auth';
import { AdminPageHeader, FormSection, Notice, StickyActionBar, iconButton, secondaryButton, useResultToast, useUnsavedChanges } from '../ui';
import { CONTACT_KINDS, action as contactsAction, loader as contactsLoader, type ContactsData } from './content/contactsData';
import type { ActionResult } from './content/shared';

export const loader = contactsLoader;
export const action = contactsAction;
export const handle = { crumb: 'Coordonnées et réseaux' };

export function Component() {
  const data = useLoaderData() as ContactsData;
  // Clé : recréer le formulaire après chaque enregistrement (nouvelles lignes, identifiants).
  const key = data.contacts.map((c) => `${c.id}:${c.value}:${c.is_public}`).join('|') + `|${data.office.office_lat}`;
  return <ContactsForm key={key} {...data} />;
}

type Social = { key: string; id: string; url: string; isPublic: boolean };

function ContactsForm({ contacts, office }: ContactsData) {
  const result = useActionData() as ActionResult | undefined;
  const navigation = useNavigation();
  const session = useOutletContext<AdminSession>();
  const formRef = useRef<HTMLFormElement>(null);
  const unsaved = useUnsavedChanges(navigation.state !== 'idle');
  const errors = result?.fieldErrors ?? {};
  const isAdmin = session.staff.role === 'admin';
  useResultToast(result);

  const initialSocials: Social[] = contacts.filter((c) => c.kind === 'social').map((c) => ({ key: c.id, id: c.id, url: c.raw_value, isPublic: c.is_public }));
  const [socials, setSocials] = useState(initialSocials);
  const updateSocial = (key: string, patch: Partial<Social>) => setSocials((list) => list.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  return (
    <>
      <title>Coordonnées et réseaux | Administration E-GUITAP</title>
      <AdminPageHeader title="Coordonnées et réseaux" description="Affichées dans l'en-tête, le pied de page, la page Contact et les boutons d'appel, de WhatsApp et d'e-mail." />
      {result && !result.ok && <Notice tone="error">{result.message}</Notice>}

      <Form ref={formRef} method="post" onChange={unsaved.markDirty} onSubmit={unsaved.reset} className="space-y-6">
        <FormSection title="Coordonnées" description="Un champ décoché reste enregistré mais n'est plus visible sur le site.">
          {CONTACT_KINDS.map(({ kind, label, hint, placeholder }) => {
            const row = contacts.find((c) => c.kind === kind);
            return (
              <div key={kind} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-4">
                <input type="hidden" name={`${kind}_id`} value={row?.id ?? ''} />
                <Field label={label} hint={hint} error={errors[`${kind}_value`]}>
                  <Input
                    name={`${kind}_value`}
                    defaultValue={row?.value ?? ''}
                    placeholder={placeholder}
                    type={kind === 'email' ? 'email' : kind === 'address' ? 'text' : 'tel'}
                    maxLength={200}
                  />
                </Field>
                <label className="flex items-center gap-2 text-sm text-marine sm:mt-8">
                  <input type="checkbox" name={`${kind}_public`} defaultChecked={row?.is_public ?? true} className="h-4 w-4 accent-marine" />
                  Afficher sur le site
                </label>
              </div>
            );
          })}
        </FormSection>

        <FormSection title="Réseaux sociaux" description="Adresse complète de la page officielle (https://…). Le réseau est reconnu automatiquement ; sans réseau public, la section est masquée.">
          {errors.social && <Notice tone="error">{errors.social}</Notice>}
          {socials.length === 0 && <p className="text-sm text-slate-600">Aucun réseau enregistré.</p>}
          <ul className="space-y-3">
            {socials.map((s, i) => {
              const network = s.url ? SOCIAL_NETWORK_NAMES[socialNetworkOf(s.url)] : 'Nouveau réseau';
              return (
                <li key={s.key} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-start sm:gap-4">
                  <input type="hidden" name="social_id" value={s.id} />
                  <Field label={network} error={errors[`social_${i}`]}>
                    <Input name="social_url" type="url" value={s.url} onChange={(e) => updateSocial(s.key, { url: e.target.value })} placeholder="https://www.facebook.com/…" maxLength={300} />
                  </Field>
                  <label className="flex items-center gap-2 text-sm text-marine sm:mt-8">
                    <input type="checkbox" name="social_public" value={i} checked={s.isPublic} onChange={(e) => updateSocial(s.key, { isPublic: e.target.checked })} className="h-4 w-4 accent-marine" />
                    Afficher
                  </label>
                  {(isAdmin || !s.id) && (
                    <button
                      type="button"
                      className={`${iconButton} sm:mt-7`}
                      aria-label={`Retirer ${network}`}
                      onClick={() => {
                        setSocials((list) => list.filter((x) => x.key !== s.key));
                        unsaved.markDirty();
                      }}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className={secondaryButton}
            onClick={() => {
              setSocials((list) => [...list, { key: crypto.randomUUID(), id: '', url: '', isPublic: true }]);
              unsaved.markDirty();
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Ajouter un réseau
          </button>
        </FormSection>

        <FormSection
          title="Position du siège"
          description="Coordonnées GPS publiques du siège (degrés décimaux), pour une future carte. La carte n'est pas affichée sur le site tant que son affichage n'a pas été décidé."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Latitude" hint="Ex. 9.7860" error={errors.office_lat}>
              <Input name="office_lat" inputMode="decimal" defaultValue={office.office_lat ?? ''} />
            </Field>
            <Field label="Longitude" hint="Ex. -13.5230 (négative à l'ouest)" error={errors.office_lng}>
              <Input name="office_lng" inputMode="decimal" defaultValue={office.office_lng ?? ''} />
            </Field>
          </div>
        </FormSection>

        <StickyActionBar
          dirty={unsaved.dirty}
          saving={navigation.state !== 'idle'}
          onCancel={() => {
            formRef.current?.reset();
            setSocials(initialSocials);
            unsaved.reset();
          }}
        />
      </Form>
    </>
  );
}
