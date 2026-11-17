import { useState } from 'react';
import { BrandPanel } from '../../components/brand/Skyline';
import { SmartImage } from '../../components/ui/SmartImage';
import { projectCover, projectPhotos } from '../../content/projectImages';
import type { LandProject } from '../../content/types';

/**
 * Visuel de la fiche projet : photo principale et vignettes si le projet a des photos
 * réelles ; sinon, son illustration (avec mention) ou le visuel neutre de la charte.
 */
export function ProjectGallery({ project }: { project: LandProject }) {
  const photos = projectPhotos(project.slug);
  const [selected, setSelected] = useState(0);
  const main = photos[selected] ?? projectCover(project);

  return (
    <div className="space-y-3">
      <SmartImage
        image={main}
        ratio="16/9"
        priority
        sizes="(min-width: 1024px) 66vw, 100vw"
        className="rounded-xl"
        fallback={<BrandPanel className="h-full" />}
      />
      {photos.length > 1 && (
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4" aria-label="Photos du site">
          {photos.map((photo, i) => (
            <li key={photo.src}>
              <button
                type="button"
                onClick={() => setSelected(i)}
                aria-pressed={i === selected}
                aria-label={`Afficher la photo ${i + 1} sur ${photos.length}`}
                className={`block w-full overflow-hidden rounded-lg ring-2 ring-offset-2 transition focus-visible:outline-2 focus-visible:outline-gold ${
                  i === selected ? 'ring-gold' : 'ring-transparent opacity-80 hover:opacity-100'
                }`}
              >
                <SmartImage image={{ ...photo, alt: '' }} ratio="16/9" sizes="160px" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {photos.length > 0 && <p className="text-xs text-slate-text">Photos du site communiquées par E-GUITAP.</p>}
    </div>
  );
}
