import type { ImageSource, LandProject } from './types';

// Images des projets fonciers en attendant la médiathèque (phase 6) :
// - photos réelles communiquées par E-GUITAP (public/assets/projets/), retouchées
//   (rognage, désembuage, contraste) mais non modifiées sur le fond ;
// - sinon, illustration générée propre au projet (public/assets/illustrations/projets/),
//   toujours accompagnée de la mention « Visuel d'illustration ».

type RealPhoto = { file: string; widths: readonly [number, number]; height: number; alt: string };

const REAL_PHOTOS: Record<string, readonly RealPhoto[]> = {
  'tanene-kenende': [
    {
      file: 'tanene-kenende-1',
      widths: [1024, 640],
      height: 729,
      alt: 'Vue aérienne du site de Tanènè Kenendé : parcelles délimitées par des pistes ouvertes dans la végétation',
    },
    {
      file: 'tanene-kenende-2',
      widths: [1280, 640],
      height: 682,
      alt: 'Vue aérienne élargie du site de Tanènè Kenendé et de ses pistes jusqu’à l’horizon',
    },
  ],
};

/** Projets disposant d'une illustration générée (vue aérienne d'un lotissement en savane). */
const ILLUSTRATED = new Set(['amaria-ouassou', 'site-de-forecariah', 'bady']);

const photoUrl = (p: RealPhoto, w: number) => `/assets/projets/${p.file}-${w}.webp`;

/** Photos réelles d'un projet (galerie) ; vide s'il n'y en a pas. */
export function projectPhotos(slug: string): ImageSource[] {
  return (REAL_PHOTOS[slug] ?? []).map((p) => {
    const [large, small] = p.widths;
    return {
      src: photoUrl(p, large),
      srcSet: `${photoUrl(p, small)} ${small}w, ${photoUrl(p, large)} ${large}w`,
      alt: p.alt,
      width: large,
      height: p.height,
      notice: null,
      credit: 'Photo : E-GUITAP',
    };
  });
}

/** Image de couverture : première photo réelle, sinon illustration du projet, sinon rien. */
export function projectCover(project: Pick<LandProject, 'slug'>): ImageSource | null {
  const [first] = projectPhotos(project.slug);
  if (first) return first;
  if (!ILLUSTRATED.has(project.slug)) return null;
  return {
    src: `/assets/illustrations/projets/${project.slug}.svg`,
    alt: '',
    width: 800,
    height: 600,
    notice: "Visuel d'illustration",
  };
}
