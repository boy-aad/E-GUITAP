import type { MouseEvent } from 'react';
import type { ImageSource } from '../../../content/types';

export type Focal = { x: number; y: number };

const pct = (v: number) => `${Math.round(v * 100)} %`;

/**
 * Point focal d'une image de fond : clic sur l'image ou curseurs (clavier). L'image reste
 * cadrée sur ce point, sur ordinateur (paysage) comme sur téléphone (portrait).
 */
export function FocalPointPicker({ image, value, onChange }: { image: ImageSource; value: Focal; onChange: (v: Focal) => void }) {
  const round = (v: number) => Math.min(1, Math.max(0, Math.round(v * 100) / 100));
  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    onChange({ x: round((e.clientX - r.left) / r.width), y: round((e.clientY - r.top) / r.height) });
  };
  const position = `${value.x * 100}% ${value.y * 100}%`;

  return (
    <div className="space-y-4">
      <input type="hidden" name="focal_x" value={value.x} />
      <input type="hidden" name="focal_y" value={value.y} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <button
            type="button"
            onClick={onClick}
            tabIndex={-1}
            aria-hidden="true"
            className="relative block w-full cursor-crosshair overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
          >
            <img src={image.src} alt="" className="block h-auto w-full" />
            <span
              className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(16,44,80,0.8)]"
              style={{ left: `${value.x * 100}%`, top: `${value.y * 100}%` }}
            />
          </button>
          <p className="mt-1.5 text-xs text-slate-500">Cliquez sur la zone la plus importante de l'image, ou utilisez les curseurs.</p>
        </div>
        <div className="flex gap-3 lg:flex-col" aria-hidden="true">
          <figure>
            <div className="aspect-video w-40 overflow-hidden rounded border border-slate-200">
              <img src={image.src} alt="" className="h-full w-full object-cover" style={{ objectPosition: position }} />
            </div>
            <figcaption className="mt-1 text-[11px] text-slate-500">Ordinateur</figcaption>
          </figure>
          <figure>
            <div className="aspect-[9/16] w-20 overflow-hidden rounded border border-slate-200">
              <img src={image.src} alt="" className="h-full w-full object-cover" style={{ objectPosition: position }} />
            </div>
            <figcaption className="mt-1 text-[11px] text-slate-500">Téléphone</figcaption>
          </figure>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {(['x', 'y'] as const).map((axis) => (
          <label key={axis} className="block text-sm">
            <span className="flex justify-between font-semibold text-marine">
              {axis === 'x' ? 'Horizontal (gauche → droite)' : 'Vertical (haut → bas)'}
              <span className="font-normal tabular-nums text-slate-600">{pct(value[axis])}</span>
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={value[axis]}
              onChange={(e) => onChange({ ...value, [axis]: Number(e.target.value) })}
              className="mt-2 w-full accent-marine"
            />
          </label>
        ))}
      </div>
    </div>
  );
}
