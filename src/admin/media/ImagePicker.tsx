import { useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import type { ImageSource } from '../../content/types';
import { mediaImage } from '../../lib/media';
import { secondaryButton, ghostButton } from '../ui';
import { MediaPickerDialog, type PickedMedia } from './MediaPickerDialog';

export type { PickedMedia };

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

/** Choix d'une image dans la médiathèque (avec téléversement sur place). */
export function ImagePicker({ name, label, value, onChange, fallback, hint }: ImagePickerProps) {
  const [open, setOpen] = useState(false);
  const preview = value ? mediaImage(value.media) : fallback;

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
      <MediaPickerDialog open={open} onClose={() => setOpen(false)} onPick={onChange} selectedIds={value ? [value.id] : []} />
    </div>
  );
}
