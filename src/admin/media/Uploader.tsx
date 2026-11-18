import { useId, useRef, useState, type DragEvent } from 'react';
import { Loader2, UploadCloud, X } from 'lucide-react';
import type { Enums } from '../../types/database';
import { primaryButton, secondaryButton, useToast } from '../ui';
import { MEDIA_KIND_LABELS } from './mediaQueries';
import { ACCEPTED_TYPES, uploadImage } from './upload';

type Pending = { key: string; file: File; preview: string; alt: string; kind: Enums<'media_kind'>; credit: string; error?: string };

const field = 'w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm focus:border-marine focus:outline-none focus:ring-2 focus:ring-marine/20';

/**
 * Dépôt d'images (glisser-déposer ou sélection multiple). Chaque image demande un texte
 * alternatif (obligatoire), un type et un crédit, puis est convertie et envoyée.
 */
export function Uploader({ onUploaded }: { onUploaded: (ids: string[]) => void }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [items, setItems] = useState<Pending[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const next = [...files]
      .filter((f) => (ACCEPTED_TYPES as readonly string[]).includes(f.type))
      .map((file) => ({ key: `${file.name}-${file.size}-${file.lastModified}`, file, preview: URL.createObjectURL(file), alt: '', kind: 'photo_reelle' as const, credit: '' }));
    if (next.length < files.length) toast('error', 'Seules les images JPEG, PNG ou WebP sont acceptées.');
    setItems((prev) => [...prev, ...next.filter((n) => !prev.some((p) => p.key === n.key))]);
  };

  const update = (key: string, patch: Partial<Pending>) => setItems((prev) => prev.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  const remove = (key: string) =>
    setItems((prev) => {
      const item = prev.find((p) => p.key === key);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((p) => p.key !== key);
    });

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const uploadAll = async () => {
    const missing = items.filter((i) => !i.alt.trim());
    if (missing.length) {
      missing.forEach((i) => update(i.key, { error: 'Texte alternatif obligatoire.' }));
      return;
    }
    setBusy(true);
    const done: string[] = [];
    for (const item of items) {
      try {
        done.push(await uploadImage(item));
        remove(item.key);
      } catch (e) {
        update(item.key, { error: e instanceof Error ? e.message : 'Échec du téléversement.' });
      }
    }
    setBusy(false);
    if (done.length) {
      toast('success', `${done.length} image${done.length > 1 ? 's' : ''} ajoutée${done.length > 1 ? 's' : ''} à la médiathèque.`);
      onUploaded(done);
    }
  };

  return (
    <div className="space-y-4">
      {/* Le glisser-déposer est un raccourci souris ; au clavier, la zone ouvre le sélecteur de fichiers. */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
      >
      <label
        htmlFor={inputId}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors focus-within:outline-2 focus-within:outline-gold ${
          dragging ? 'border-marine bg-ivory' : 'border-slate-300 bg-white hover:border-marine'
        }`}
      >
        <UploadCloud className="h-8 w-8 text-slate-400" aria-hidden="true" />
        <span className="text-sm font-semibold text-slate-800">Déposez vos images ici ou cliquez pour les choisir</span>
        <span className="text-xs text-slate-500">JPEG, PNG ou WebP · converties en WebP (1920 et 640 px) · 5 Mo maximum après conversion</span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            if (inputRef.current) inputRef.current.value = '';
          }}
        />
      </label>
      </div>

      {items.length > 0 && (
        <div className="space-y-3">
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.key} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-[96px_1fr_auto]">
                <img src={item.preview} alt="" className="h-20 w-24 rounded-md bg-slate-100 object-cover" />
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
                    Texte alternatif <span className="text-red-700">*</span>
                    <input
                      value={item.alt}
                      onChange={(e) => update(item.key, { alt: e.target.value, error: undefined })}
                      placeholder="Ce que montre l'image (ex. vue aérienne du site de Bady)"
                      maxLength={250}
                      aria-invalid={item.error ? true : undefined}
                      className={`${field} mt-1 font-normal`}
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-700">
                    Type
                    <select value={item.kind} onChange={(e) => update(item.key, { kind: e.target.value as Enums<'media_kind'> })} className={`${field} mt-1 font-normal`}>
                      {Object.entries(MEDIA_KIND_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs font-semibold text-slate-700">
                    Crédit
                    <input value={item.credit} onChange={(e) => update(item.key, { credit: e.target.value })} placeholder="Ex. Photo : E-GUITAP" maxLength={200} className={`${field} mt-1 font-normal`} />
                  </label>
                  {item.error && (
                    <p role="alert" className="text-xs font-medium text-red-700 sm:col-span-2">
                      {item.error}
                    </p>
                  )}
                </div>
                <button type="button" onClick={() => remove(item.key)} disabled={busy} className="self-start rounded-md p-1.5 text-slate-500 hover:bg-slate-100" aria-label={`Retirer ${item.file.name}`}>
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex justify-end gap-2">
            <button type="button" className={secondaryButton} disabled={busy} onClick={() => items.forEach((i) => remove(i.key))}>
              Tout retirer
            </button>
            <button type="button" className={primaryButton} disabled={busy} onClick={uploadAll}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UploadCloud className="h-4 w-4" aria-hidden="true" />}
              {busy ? 'Conversion et envoi…' : `Téléverser ${items.length} image${items.length > 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
