import { useState } from 'react';
import { useFetcher } from 'react-router';
import { ArrowLeft, ArrowRight, ImagePlus, Star, X } from 'lucide-react';
import { mediaImage } from '../../../lib/media';
import { MediaPickerDialog } from '../../media/MediaPickerDialog';
import { Badge, FormSection, Notice, cardClass, iconButton, secondaryButton, useResultToast } from '../../ui';
import type { ActionResult, GalleryItem } from './projectData';

const KIND_LABELS = { photo_reelle: 'Photo réelle', illustration: 'Illustration', plan: 'Plan', logo: 'Logo' } as const;

/** Galerie du projet : images de la médiathèque, ordre, couverture (enregistrement immédiat). */
export function ProjectGallery({ items }: { items: GalleryItem[] }) {
  const fetcher = useFetcher<ActionResult>();
  const [picking, setPicking] = useState(false);
  const busy = fetcher.state !== 'idle';
  useResultToast(fetcher.data);
  const send = (intent: string, mediaId: string, extra: Record<string, string> = {}) => void fetcher.submit({ intent, media_id: mediaId, ...extra }, { method: 'post' });

  return (
    <FormSection
      title="Galerie"
      description="Images de la page du projet, dans cet ordre. La couverture illustre les cartes de projet. Sans image, le site garde le visuel actuel du projet. Une illustration porte toujours la mention « Visuel d'illustration »."
    >
      {fetcher.data && !fetcher.data.ok && <Notice tone="error">{fetcher.data.message}</Notice>}
      {items.length === 0 ? (
        <p className="text-sm text-slate-600">Aucune image dans la galerie.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy={busy}>
          {items.map((item, i) => {
            const image = mediaImage(item.media);
            const label = item.media.alt || `Image ${i + 1}`;
            return (
              <li key={item.id} className={`${cardClass} overflow-hidden`}>
                <div className="relative bg-slate-100">
                  <img src={image.src} alt="" loading="lazy" width={320} height={240} className="aspect-[4/3] w-full object-cover" />
                  {item.isCover && (
                    <span className="absolute left-2 top-2">
                      <Badge tone="info">Couverture</Badge>
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <p className="line-clamp-2 text-sm text-slate-700">{label}</p>
                  <p className="text-xs text-slate-500">{KIND_LABELS[item.media.kind]}</p>
                  <div className="flex flex-wrap items-center gap-1">
                    <button type="button" disabled={i === 0 || busy} onClick={() => send('media-move', item.id, { direction: 'up' })} className={iconButton} aria-label={`Avancer « ${label} »`}>
                      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      disabled={i === items.length - 1 || busy}
                      onClick={() => send('media-move', item.id, { direction: 'down' })}
                      className={iconButton}
                      aria-label={`Reculer « ${label} »`}
                    >
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                    {!item.isCover && (
                      <button type="button" disabled={busy} onClick={() => send('media-cover', item.id)} className={iconButton} aria-label={`Utiliser « ${label} » comme couverture`}>
                        <Star className="h-4 w-4" aria-hidden="true" />
                      </button>
                    )}
                    <button type="button" disabled={busy} onClick={() => send('media-remove', item.id)} className={`${iconButton} ml-auto`} aria-label={`Retirer « ${label} » de la galerie`}>
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <button type="button" className={secondaryButton} onClick={() => setPicking(true)} disabled={busy}>
        <ImagePlus className="h-4 w-4" aria-hidden="true" /> Ajouter une image
      </button>
      <MediaPickerDialog
        open={picking}
        onClose={() => setPicking(false)}
        onPick={(picked) => send('media-add', picked.id)}
        selectedIds={items.map((m) => m.id)}
        title="Ajouter une image à la galerie"
      />
    </FormSection>
  );
}
