import { useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, Loader2, Search, Trash2, UploadCloud, X } from 'lucide-react';
import type { ImageSource, MediaAsset } from '../../content/types';
import { mediaImage, publicMediaUrl, toMediaAsset } from '../../lib/media';
import { secondaryButton, ghostButton } from '../ui';
import { listMedia, type MediaRow } from './mediaQueries';
import { Uploader } from './Uploader';

export type PickedMedia = { id: string; media: MediaAsset };

type ImagePickerProps = {
  /** Nom du champ envoyé avec le formulaire (identifiant du média, vide = aucun). */
  name: string;
  label: string;
  value: PickedMedia | null;
  onChange: (value: PickedMedia | null) => void;
  /** Image affichée quand aucun média n'est choisi (illustration ou photo par défaut). */
  fallback: ImageSource | null;
  hint?: string;
};

const thumb = (m: MediaRow) => {
  const v = m.variants && typeof m.variants === 'object' ? (m.variants as Record<string, string>) : {};
  return publicMediaUrl(Object.entries(v).sort(([a], [b]) => Number(a) - Number(b))[0]?.[1] ?? m.path);
};

/** Choix d'une image dans la médiathèque (avec téléversement sur place). */
export function ImagePicker({ name, label, value, onChange, fallback, hint }: ImagePickerProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState('');
  const [uploading, setUploading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const preview = value ? mediaImage(value.media) : fallback;

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
    if (media) onChange({ id: row.id, media });
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={value?.id ?? ''} />
      <p className="text-sm font-semibold text-marine">{label}</p>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative w-full max-w-60 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
          {preview ? <img src={preview.src} alt="" className="aspect-[4/3] w-full object-cover" /> : <div className="aspect-[4/3]" />}
          <span className="absolute left-2 top-2 rounded bg-white/90 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
            {value ? 'Image choisie' : 'Visuel par défaut'}
          </span>
        </div>
        <div className="space-y-2">
          <button type="button" className={secondaryButton} onClick={() => setOpen(true)}>
            <ImagePlus className="h-4 w-4" aria-hidden="true" /> {value ? 'Changer d’image' : 'Choisir dans la médiathèque'}
          </button>
          {value && (
            <button type="button" className={`${ghostButton} block`} onClick={() => onChange(null)}>
              <Trash2 className="h-4 w-4" aria-hidden="true" /> Revenir au visuel par défaut
            </button>
          )}
          {value && <p className="max-w-xs text-xs text-slate-600">Texte alternatif : « {value.media.alt} »</p>}
          {hint && <p className="max-w-xs text-xs text-slate-500">{hint}</p>}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onCancel={(e) => {
          e.preventDefault();
          setOpen(false);
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-4xl rounded-xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/50"
      >
        {open && (
          <div className="flex max-h-[88vh] flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
              <h2 id={titleId} className="font-poppins text-lg font-bold text-marine">
                Choisir une image
              </h2>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Fermer">
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
                  {items.map((m) => (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => pick(m)}
                        aria-label={`Choisir : ${m.alt}`}
                        aria-pressed={value?.id === m.id}
                        className={`block w-full overflow-hidden rounded-lg border text-left focus-visible:outline-2 focus-visible:outline-gold ${
                          value?.id === m.id ? 'border-marine ring-2 ring-marine' : 'border-slate-200 hover:border-marine'
                        }`}
                      >
                        <img src={thumb(m)} alt="" loading="lazy" className="aspect-[4/3] w-full bg-slate-100 object-cover" />
                        <span className="block truncate px-2 py-1.5 text-xs text-slate-700">{m.alt}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
