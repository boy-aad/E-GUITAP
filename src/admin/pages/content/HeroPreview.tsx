import { useState } from 'react';
import { ArrowRight, Monitor, Smartphone } from 'lucide-react';
import type { ImageSource } from '../../../content/types';
import type { Focal } from './FocalPointPicker';

type HeroPreviewProps = {
  image: ImageSource;
  focal: Focal;
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  signature: string | null;
  primary: string;
  secondary: string;
};

/**
 * Aperçu du hero tel qu'il s'affiche sur l'accueil (image cadrée, voile marine, textes,
 * boutons), en format ordinateur ou téléphone. Aperçu statique : sans animation.
 */
export function HeroPreview({ image, focal, eyebrow, title, highlight, subtitle, signature, primary, secondary }: HeroPreviewProps) {
  const [mobile, setMobile] = useState(false);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-marine">Aperçu</p>
        <div className="inline-flex rounded-lg bg-slate-100 p-1" role="group" aria-label="Format de l'aperçu">
          {[
            { m: false, label: 'Ordinateur', Icon: Monitor },
            { m: true, label: 'Téléphone', Icon: Smartphone },
          ].map(({ m, label, Icon }) => (
            <button
              key={label}
              type="button"
              aria-pressed={mobile === m}
              onClick={() => setMobile(m)}
              className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold focus-visible:outline-2 focus-visible:outline-gold ${mobile === m ? 'bg-white text-marine shadow-sm' : 'text-slate-600'}`}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </div>
      <div
        className={`relative isolate mx-auto overflow-hidden rounded-lg bg-marine-dark text-white ${mobile ? 'aspect-[9/16] max-w-64' : 'aspect-video w-full'}`}
        aria-label="Aperçu de la slide"
        role="img"
      >
        <img src={image.src} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" style={{ objectPosition: `${focal.x * 100}% ${focal.y * 100}%` }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-marine-dark/90 via-marine/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-marine-dark/70 to-transparent" />
        <div className={`flex h-full flex-col justify-center ${mobile ? 'p-4' : 'p-6 sm:p-8'}`}>
          {eyebrow && <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">{eyebrow}</p>}
          <p className={`mt-2 font-poppins font-bold leading-tight ${mobile ? 'text-lg' : 'text-xl sm:text-3xl'}`}>
            {title || <span className="text-white/50">Titre de la slide</span>}
            {highlight && <span className="block text-gold">{highlight}</span>}
          </p>
          {subtitle && <p className={`mt-2 max-w-md text-white/85 ${mobile ? 'line-clamp-4 text-[11px]' : 'line-clamp-3 text-xs sm:text-sm'}`}>{subtitle}</p>}
          {signature && <p className="mt-2 font-lora text-xs italic text-gold/90">{signature}</p>}
          {(primary || secondary) && (
            <div className="mt-3 flex flex-wrap gap-2">
              {primary && (
                <span className="inline-flex items-center gap-1 rounded bg-gold px-2.5 py-1 text-[11px] font-semibold text-marine-dark">
                  {primary} <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              )}
              {secondary && <span className="rounded border border-white/60 px-2.5 py-1 text-[11px] font-semibold">{secondary}</span>}
            </div>
          )}
        </div>
        {image.notice && <span className="absolute bottom-1.5 right-2 text-[9px] text-white/70">{image.notice}</span>}
      </div>
    </div>
  );
}
