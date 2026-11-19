import { useEffect, useRef } from 'react';
import { Form, useActionData, useLoaderData, useNavigation, useOutletContext, useSearchParams, useSubmit } from 'react-router';
import { ExternalLink, Trash2 } from 'lucide-react';
import type { AdminSession } from '../auth';
import { AdminPageHeader, EmptyState, Notice, StickyActionBar, Tabs, dangerButton, useConfirm, useFlashToast, useResultToast, useTabs, useUnsavedChanges } from '../ui';
import { ProjectDocuments } from './project/ProjectDocuments';
import { ProjectGallery } from './project/ProjectGallery';
import { ProjectMilestones } from './project/ProjectMilestones';
import { GeneralSection, LocationSection, StatusSection } from './project/ProjectSections';
import type { ActionResult, LoaderData } from './project/projectData';

export { action, loader } from './project/projectData';

export const handle = {
  crumb: (data: unknown) => (data as LoaderData | undefined)?.project?.name ?? 'Nouveau projet',
};

export function Component() {
  const data = useLoaderData() as LoaderData;
  // Une clé par projet : passer d'un projet à un autre (ou à « Nouveau ») recrée le formulaire
  // au lieu de conserver l'état (nom, identifiant d'URL…) du projet précédent.
  return <ProjectForm key={data.project?.id ?? 'nouveau'} {...data} />;
}

/** Onglet de chaque champ contrôlé à l'enregistrement. */
const FIELD_TAB: Record<string, string> = { name: 'general', slug: 'general', area_ha: 'general', summary: 'general', approx_lat: 'location', approx_lng: 'location' };
/** Onglets enregistrés avec le formulaire principal ; les autres s'enregistrent à chaque action. */
const FORM_TABS = new Set(['general', 'location', 'status']);

function ProjectForm({ project, objectives, media, milestones, documents }: LoaderData) {
  const result = useActionData() as ActionResult | undefined;
  const navigation = useNavigation();
  const session = useOutletContext<AdminSession>();
  const [params] = useSearchParams();
  const confirm = useConfirm();
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const tabs = useTabs('general');
  const isAdmin = session.staff.role === 'admin';
  const intent = navigation.formData?.get('intent');
  const saving = navigation.state !== 'idle' && intent !== 'delete';
  const unsaved = useUnsavedChanges(navigation.state !== 'idle');
  const errors = result?.fieldErrors ?? {};
  useResultToast(result);
  useFlashToast(Boolean(params.get('cree')), 'Projet créé.');

  const flagged = new Set(Object.keys(errors).map((k) => FIELD_TAB[k]));
  const items = [
    { id: 'general', label: 'Général' },
    { id: 'location', label: 'Localisation' },
    { id: 'status', label: 'Statuts' },
    { id: 'media', label: `Médias${media.length ? ` (${media.length})` : ''}` },
    ...(isAdmin ? [{ id: 'documents', label: `Documents${documents.length ? ` (${documents.length})` : ''}` }] : []),
    { id: 'milestones', label: 'Jalons' },
  ].map((t) => ({ ...t, flagged: flagged.has(t.id) }));

  // Erreurs renvoyées : ouvrir le premier onglet à corriger.
  const firstFlagged = items.find((t) => t.flagged)?.id;
  const { setCurrent } = tabs;
  useEffect(() => {
    if (result && firstFlagged) setCurrent(firstFlagged);
  }, [result, firstFlagged, setCurrent]);

  const title = project ? project.name : 'Nouveau projet foncier';

  const onDelete = async () => {
    if (!project) return;
    const ok = await confirm({
      title: `Supprimer « ${project.name} » ?`,
      message: 'Le projet, ses objectifs, ses jalons et ses documents fonciers (fichiers compris) seront supprimés définitivement. Les images restent dans la médiathèque. Cette action est irréversible.',
      confirmLabel: 'Supprimer le projet',
      danger: true,
    });
    if (ok) submit({ intent: 'delete' }, { method: 'post' });
  };

  const needsProject = (
    <EmptyState title="Projet non encore créé">Enregistrez d'abord le projet (onglets Général, Localisation et Statuts) : cette rubrique sera ensuite disponible.</EmptyState>
  );

  return (
    <>
      <title>{`${title} | Projets | Administration E-GUITAP`}</title>
      <AdminPageHeader
        title={title}
        actions={
          project?.publication === 'publie' ? (
            <a href={`/projets/${project.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold hover:text-gold-hover">
              <ExternalLink className="h-4 w-4" aria-hidden="true" /> Voir sur le site
            </a>
          ) : undefined
        }
      />

      {result && !result.ok && <Notice tone="error">{result.message}</Notice>}

      <Tabs items={items} state={tabs} label="Rubriques du projet" />

      {/* noValidate : un champ peut se trouver dans un onglet masqué ; la validation est faite à l'enregistrement. */}
      <Form ref={formRef} method="post" noValidate onChange={unsaved.markDirty} onSubmit={unsaved.reset} className="mt-6" key={project?.updated_at ?? 'new'}>
        <div {...tabs.panelProps('general')}>
          <GeneralSection project={project} objectives={objectives} errors={errors} />
        </div>
        <div {...tabs.panelProps('location')}>
          <LocationSection project={project} errors={errors} />
        </div>
        <div {...tabs.panelProps('status')}>
          <StatusSection project={project} />
        </div>
        {FORM_TABS.has(tabs.current) && (
          <StickyActionBar
            dirty={unsaved.dirty}
            saving={saving}
            saveLabel={project ? 'Enregistrer' : 'Créer le projet'}
            onCancel={() => {
              formRef.current?.reset();
              unsaved.reset();
            }}
            extra={
              project && isAdmin ? (
                <button type="button" onClick={() => void onDelete()} className={dangerButton}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer
                </button>
              ) : undefined
            }
          />
        )}
      </Form>

      <div {...tabs.panelProps('media')}>{project ? <ProjectGallery items={media} /> : needsProject}</div>
      {isAdmin && <div {...tabs.panelProps('documents')}>{project ? <ProjectDocuments documents={documents} /> : needsProject}</div>}
      <div {...tabs.panelProps('milestones')}>{project ? <ProjectMilestones milestones={milestones} published={project.publication === 'publie'} /> : needsProject}</div>
    </>
  );
}
