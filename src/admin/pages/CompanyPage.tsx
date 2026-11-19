import { useEffect, useRef } from 'react';
import { Form, useActionData, useLoaderData, useNavigation, useOutletContext } from 'react-router';
import { Field, Input, Textarea } from '../../components/ui/Field';
import type { AdminSession } from '../auth';
import { formatDateTime } from '../format';
import { AdminPageHeader, FormSection, Notice, StickyActionBar, Tabs, useResultToast, useTabs, useUnsavedChanges } from '../ui';
import { CompanyValues } from './content/CompanyValues';
import { REQUIRED_FIELDS, action as companyAction, loader as companyLoader, type CompanyData } from './content/companyData';
import type { ActionResult } from './content/shared';

export const loader = companyLoader;
export const action = companyAction;
export const handle = { crumb: 'Entreprise' };

export function Component() {
  const data = useLoaderData() as CompanyData;
  return <CompanyForm key={data.profile.updated_at} {...data} />;
}

const TAB_LABELS = {
  identity: 'Identité',
  presentation: 'Présentation',
  mission: 'Mission et vision',
  signatures: 'Signatures',
  legal: 'Mentions légales',
  values: 'Valeurs',
} as const;
type TabId = keyof typeof TAB_LABELS;

function CompanyForm({ profile, values }: CompanyData) {
  // Résultat de la fiche uniquement (les valeurs ont leurs propres envois).
  const result = useActionData() as ActionResult | undefined;
  const navigation = useNavigation();
  const session = useOutletContext<AdminSession>();
  const formRef = useRef<HTMLFormElement>(null);
  const unsaved = useUnsavedChanges(navigation.state !== 'idle');
  const tabs = useTabs('identity');
  const errors = result?.fieldErrors ?? {};
  useResultToast(result);

  const flagged = new Set<string>(Object.keys(errors).map((k) => REQUIRED_FIELDS[k as keyof typeof REQUIRED_FIELDS]));
  const items = (Object.keys(TAB_LABELS) as TabId[]).map((id) => ({ id, label: TAB_LABELS[id], flagged: flagged.has(id) }));
  const saving = navigation.state !== 'idle' && navigation.formData?.get('intent') === 'profile';

  // Erreurs renvoyées : ouvrir le premier onglet à corriger.
  const firstFlagged = items.find((t) => t.flagged)?.id;
  const { setCurrent } = tabs;
  useEffect(() => {
    // À chaque nouveau résultat en erreur (même si l'onglet fautif ne change pas).
    if (result && firstFlagged) setCurrent(firstFlagged);
  }, [result, firstFlagged, setCurrent]);

  return (
    <>
      <title>Entreprise | Administration E-GUITAP</title>
      <AdminPageHeader title="Entreprise" description={`Présentation, mission, signatures et mentions légales du site. Dernière modification : ${formatDateTime(profile.updated_at)}.`} />
      {result && !result.ok && <Notice tone="error">{result.message}</Notice>}

      <Tabs items={items} state={tabs} label="Rubriques de la fiche entreprise" />

      {/* noValidate : un champ obligatoire peut se trouver dans un onglet masqué ; la validation est faite à l'enregistrement. */}
      <Form ref={formRef} method="post" noValidate onChange={unsaved.markDirty} onSubmit={unsaved.reset} className="mt-6">
        <input type="hidden" name="intent" value="profile" />

        <div {...tabs.panelProps('identity')}>
          <FormSection title="Identité" description="Repris dans l'en-tête, le pied de page et la page Entreprise.">
            <Field label="Nom de marque" hint="Toujours écrit « E-GUITAP » : non modifiable.">
              <Input value={profile.brand_name} readOnly disabled />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Pays" required error={errors.country}>
                <Input name="country" defaultValue={profile.country} maxLength={80} />
              </Field>
              <Field label="Siège" required hint="Ville(s), ex. Dubréka et Conakry." error={errors.head_office}>
                <Input name="head_office" defaultValue={profile.head_office} maxLength={120} />
              </Field>
            </div>
            <Field label="Ambition" hint="Une phrase (page Entreprise).">
              <Textarea name="ambition" rows={2} defaultValue={profile.ambition ?? ''} maxLength={400} />
            </Field>
          </FormSection>
        </div>

        <div {...tabs.panelProps('presentation')}>
          <FormSection title="Présentation" description="Texte de la page Entreprise (et de l'accueil si le texte « Présentation de l'accueil » est vide).">
            <Field label="Paragraphes" hint="Laissez une ligne vide entre deux paragraphes.">
              <Textarea name="presentation" rows={12} defaultValue={profile.presentation.join('\n\n')} maxLength={5000} />
            </Field>
          </FormSection>
        </div>

        <div {...tabs.panelProps('mission')}>
          <FormSection title="Mission et vision">
            <Field label="Mission">
              <Textarea name="mission" rows={4} defaultValue={profile.mission ?? ''} maxLength={1000} />
            </Field>
            <Field label="Vision">
              <Textarea name="vision" rows={4} defaultValue={profile.vision ?? ''} maxLength={1000} />
            </Field>
          </FormSection>
        </div>

        <div {...tabs.panelProps('signatures')}>
          <FormSection title="Signatures" description="Phrases d'accroche réutilisées sur le site (hero, pied de page, bandeaux).">
            <Field label="Signature de marque" hint="Ex. Construire • Échanger • Développer">
              <Input name="signature_brand" defaultValue={profile.signature_brand ?? ''} maxLength={120} />
            </Field>
            <Field label="Signature institutionnelle">
              <Input name="signature_institutional" defaultValue={profile.signature_institutional ?? ''} maxLength={200} />
            </Field>
            <Field label="Signature sectorielle">
              <Input name="signature_sectoral" defaultValue={profile.signature_sectoral ?? ''} maxLength={200} />
            </Field>
          </FormSection>
        </div>

        <div {...tabs.panelProps('legal')}>
          <FormSection title="Mentions légales" description="Page « Mentions légales ». Un champ vide n'est pas affiché : ne renseignez que des informations officielles.">
            <Field label="Dénomination complète" required error={errors.full_name}>
              <Input name="full_name" defaultValue={profile.full_name} maxLength={200} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Forme juridique" hint="Ex. SARL, SA, SAS…">
                <Input name="legal_form" defaultValue={profile.legal_form ?? ''} maxLength={80} />
              </Field>
              <Field label="RCCM">
                <Input name="rccm" defaultValue={profile.rccm ?? ''} maxLength={80} />
              </Field>
              <Field label="NIF">
                <Input name="nif" defaultValue={profile.nif ?? ''} maxLength={80} />
              </Field>
              <Field label="Responsable de la publication">
                <Input name="publication_manager" defaultValue={profile.publication_manager ?? ''} maxLength={120} />
              </Field>
            </div>
            <Field label="Hébergeur du site" hint="Nom et adresse de l'hébergeur, une fois choisi.">
              <Input name="host_name" defaultValue={profile.host_name ?? ''} maxLength={200} />
            </Field>
          </FormSection>
        </div>

        {tabs.current !== 'values' && (
          <StickyActionBar
            dirty={unsaved.dirty}
            saving={saving}
            saveLabel="Enregistrer la fiche"
            onCancel={() => {
              formRef.current?.reset();
              unsaved.reset();
            }}
          />
        )}
      </Form>

      <div {...tabs.panelProps('values')}>
        <FormSection title="Valeurs">
          <CompanyValues values={values} isAdmin={session.staff.role === 'admin'} />
        </FormSection>
      </div>
    </>
  );
}
