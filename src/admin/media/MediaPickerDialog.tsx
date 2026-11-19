import { useEffect, useId, useRef, useState } from 'react';
import { Loader2, Search, UploadCloud, X } from 'lucide-react';
import type { MediaAsset } from '../../content/types';
import { publicMediaUrl, toMediaAsset } from '../../lib/media';
import { secondaryButton } from '../ui';
import { listMedia, type MediaRow } from './mediaQueries';
import { Uploader } from './Uploader';

export type PickedMedia = { id: string; media: MediaAsset };

const thumb = (m: MediaRow) => {
  const v = m.variants && typeof m.variants === 'object' ? (m.variants as Record<string, string>) : {};
  return publicMediaUrl(Object.entries(v).sort(([a], [b]) => Number(a) - Number(b))[0]?.[1] ?? m.path);
};

type MediaPickerDialogProps = {
  open: boolean;
  onClose: () => void;
  onPick: (picked: PickedMedia) => void;
  /** Médias déjà choisis (signalés dans la grille). */
  selectedIds?: readonly string[];
  title?: string;
};

/** Fenêtre de choix d'une image de la médiathèque, avec recherche et téléversement sur place. */
export function MediaPickerDialog({ open, onClose, onPick, selectedIds = [], title = 'Choisir une image' }: MediaPickerDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [uploading, setUploading] = useState(false);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    else if (!open && d.open) d.close();
  }, [open]);

  // Liste chargée à l'ouverture et à chaque recherche (courte pause de saisie).
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const id = window.setTimeout(() => {
      setLoading(true);
      listMedia({ q })
        .then((rows) => !cancelled && setItems(rows))
        .catch(() => !cancelled && setItems([]))
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
    // oxlint-disable-next-line react/exhaustive-deps -- `refresh` est voulu : recharger après un téléversement.
  }, [open, q, refresh]);

  const pick = (row: MediaRow) => {
    const media = toMediaAsset(row);
    if (media) onPick({ id: row.id, media });
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-4xl rounded-xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50"
    >
      {open && (
        <div className="flex max-h-[88vh] flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
            <h2 id={titleId} className="font-poppins text-lg font-bold text-marine">
              {title}
            </h2>
            <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Fermer">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2 px-5 py-3">
            <div className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher (texte alternatif, crédit)"
                aria-label="Rechercher une image"
                className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-marine focus:outline-none focus:ring-2 focus:ring-marine/20"
              />
            </div>
            <button type="button" className={secondaryButton} onClick={() => setUploading((u) => !u)} aria-expanded={uploading}>
              <UploadCloud className="h-4 w-4" aria-hidden="true" /> Téléverser
            </button>
          </div>
          {uploading && (
            <div className="border-y border-slate-100 bg-slate-50 px-5 py-4">
              <Uploader
                onUploaded={() => {
                  setUploading(false);
                  setRefresh((r) => r + 1);
                }}
              />
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-5 pb-5 pt-2">
            {loading ? (
              <p className="flex items-center gap-2 py-10 text-sm text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Chargement…
              </p>
            ) : items.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-600">{q ? 'Aucune image ne correspond.' : 'La médiathèque est vide : téléversez une première image.'}</p>
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {items.map((m) => {
                  const selected = selectedIds.includes(m.id);
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => pick(m)}
                        aria-label={`Choisir : ${m.alt}`}
                        aria-pressed={selected}
                        className={`block w-full overflow-hidden rounded-lg border text-left focus-visible:outline-2 focus-visible:outline-gold ${
                          selected ? 'border-marine ring-2 ring-marine' : 'border-slate-200 hover:border-marine'
                        }`}
                      >
                        <img src={thumb(m)} alt="" loading="lazy" className="aspect-[4/3] w-full bg-slate-100 object-cover" />
                        <span className="block truncate px-2 py-1.5 text-xs text-slate-700">{m.alt}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </dialog>
  );
}
