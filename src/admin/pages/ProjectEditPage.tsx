import { useRef } from 'react';
import { Form, useActionData, useLoaderData, useNavigation, useOutletContext, useSearchParams, useSubmit } from 'react-router';
import { ExternalLink, Trash2 } from 'lucide-react';
import type { AdminSession } from '../auth';
import { AdminPageHeader, Notice, StickyActionBar, dangerButton, useConfirm, useFlashToast, useResultToast, useUnsavedChanges } from '../ui';
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

function ProjectForm({ project, objectives }: LoaderData) {
  const result = useActionData() as ActionResult | undefined;
  const navigation = useNavigation();
  const session = useOutletContext<AdminSession>();
  const [params] = useSearchParams();
  const confirm = useConfirm();
  const submit = useSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const saving = navigation.state !== 'idle' && navigation.formData?.get('intent') !== 'delete';
  const unsaved = useUnsavedChanges(navigation.state !== 'idle');
  const errors = result?.fieldErrors ?? {};
  useResultToast(result);
  useFlashToast(Boolean(params.get('cree')), 'Projet créé.');

  const title = project ? project.name : 'Nouveau projet foncier';

  const onDelete = async () => {
    if (!project) return;
    const ok = await confirm({
      title: `Supprimer « ${project.name} » ?`,
      message: 'Le projet, ses objectifs et ses documents seront supprimés définitivement. Cette action est irréversible.',
      confirmLabel: 'Supprimer le projet',
      danger: true,
    });
    if (ok) submit({ intent: 'delete' }, { method: 'post' });
  };

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

      <Form ref={formRef} method="post" onChange={unsaved.markDirty} onSubmit={unsaved.reset} className="space-y-6" key={project?.updated_at ?? 'new'}>
        <GeneralSection project={project} objectives={objectives} errors={errors} />
        <LocationSection project={project} errors={errors} />
        <StatusSection project={project} />
        <StickyActionBar
          dirty={unsaved.dirty}
          saving={saving}
          saveLabel={project ? 'Enregistrer' : 'Créer le projet'}
          extra={
            project && session.staff.role === 'admin' ? (
              <button type="button" onClick={onDelete} className={dangerButton}>
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer
              </button>
            ) : undefined
          }
        />
      </Form>
    </>
  );
}
