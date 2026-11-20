import { useEffect, useId, useRef } from 'react';
import { Form, Link, useNavigation, useSubmit } from 'react-router';
import { ExternalLink, Save, Trash2, X } from 'lucide-react';
import { publicMediaUrl } from '../../../lib/media';
import { formatDateTime } from '../../format';
import { MEDIA_KIND_LABELS, type MediaRow, type MediaUsage } from '../../media/mediaQueries';
import { formatBytes } from '../../media/upload';
import { dangerButton, primaryButton, useConfirm } from '../../ui';

const field = 'mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm font-normal focus:border-marine focus:outline-none focus:ring-2 focus:ring-marine/20';

/** Panneau de détail d'un média (fenêtre modale) : aperçu, informations, usages, suppression. */
export function MediaDetails({ media, usages, isAdmin, onClose }: { media: MediaRow | null; usages: MediaUsage[]; isAdmin: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const submit = useSubmit();
  const confirm = useConfirm();
  const busy = useNavigation().state !== 'idle';

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (media && !d.open) d.showModal();
    else if (!media && d.open) d.close();
  }, [media]);

  const onDelete = async () => {
    if (!media) return;
    const ok = await confirm({ title: 'Supprimer ce média ?', message: 'Le fichier est retiré du stockage et ne peut pas être restauré.', confirmLabel: 'Supprimer', danger: true });
    if (ok) submit({ intent: 'delete', id: media.id }, { method: 'post' });
  };

  const variants = media?.variants && typeof media.variants === 'object' ? Object.keys(media.variants as object) : [];

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="dialog-anim m-auto w-[calc(100%-2rem)] max-w-3xl rounded-xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50"
    >
      {media && (
        <div className="grid max-h-[90vh] overflow-y-auto md:grid-cols-[1.2fr_1fr]">
          <div className="bg-slate-100 p-4">
            <img src={publicMediaUrl(media.path)} alt={media.alt} className="max-h-[60vh] w-full rounded-md object-contain" />
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                <dt className="font-semibold">Dimensions</dt>
                <dd>{media.width && media.height ? `${media.width} × ${media.height} px` : '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold">Poids</dt>
                <dd>{formatBytes(media.bytes)}</dd>
              </div>
              <div>
                <dt className="font-semibold">Autres tailles</dt>
                <dd>{variants.length ? variants.map((w) => `${w} px`).join(', ') : '—'}</dd>
              </div>
              <div>
                <dt className="font-semibold">Ajouté le</dt>
                <dd>{formatDateTime(media.created_at)}</dd>
              </div>
            </dl>
            <a href={publicMediaUrl(media.path)} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-marine hover:underline">
              Ouvrir le fichier <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 id={titleId} className="font-poppins text-lg font-bold text-marine">
                Détails du média
              </h2>
              <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Fermer">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <Form method="post" key={media.updated_at} className="space-y-3">
              <input type="hidden" name="id" value={media.id} />
              <label className="block text-xs font-semibold text-slate-700">
                Texte alternatif <span className="text-red-700">*</span>
                <textarea name="alt" required rows={3} maxLength={250} defaultValue={media.alt} className={field} />
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Type
                <select name="kind" defaultValue={media.kind} className={field}>
                  {Object.entries(MEDIA_KIND_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-700">
                Crédit
                <input name="credit" maxLength={200} defaultValue={media.credit ?? ''} className={field} />
              </label>
              <button type="submit" name="intent" value="update" disabled={busy} className={`${primaryButton} w-full`}>
                <Save className="h-4 w-4" aria-hidden="true" /> Enregistrer
              </button>
            </Form>

            <section aria-labelledby={`${titleId}-usages`}>
              <h3 id={`${titleId}-usages`} className="mb-1.5 text-sm font-semibold text-slate-800">
                Utilisé dans
              </h3>
              {usages.length ? (
                <ul className="space-y-1 text-sm">
                  {usages.map((u) => (
                    <li key={u.label}>
                      <Link to={u.to} className="text-marine underline">
                        {u.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600">Nulle part pour l'instant.</p>
              )}
            </section>

            {isAdmin &&
              (usages.length ? (
                <p className="text-xs text-slate-500">Suppression impossible tant que le média est utilisé.</p>
              ) : (
                <button type="button" onClick={onDelete} disabled={busy} className={`${dangerButton} w-full`}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer le média
                </button>
              ))}
          </div>
        </div>
      )}
    </dialog>
  );
}
