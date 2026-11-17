import type { ImageSource } from './types';

// Photos libres de droits (Unsplash, licence Unsplash) validées par E-GUITAP le 17/11/2026.
// Elles servent de repli tant qu'aucune image n'est rattachée en base (hero_slides.background_media_id,
// activity_domains.cover_media_id…). Elles ne montrent ni chantiers, ni terrains, ni équipes
// d'E-GUITAP : la mention « Photo d'illustration » est donc toujours affichée.
// Fichiers : public/assets/photos/ — crédits détaillés : docs/CREDITS-PHOTOS.md.

export interface StockPhoto {
  /** Nom de fichier sans largeur ni extension. */
  file: string;
  /** Largeurs disponibles (la première est la plus grande). */
  widths: readonly [number, number];
  /** Rapport largeur / hauteur des fichiers. */
  ratio: readonly [number, number];
  alt: string;
  author: string;
  sourceUrl: string;
}

const photo = (p: StockPhoto) => p;

export const STOCK_PHOTOS = {
  heroRoutes: photo({
    file: 'hero-routes',
    widths: [1920, 960],
    ratio: [16, 9],
    alt: "Vue aérienne d'une route goudronnée qui serpente entre des collines boisées",
    author: 'Shubham Sharan',
    sourceUrl: 'https://unsplash.com/photos/car-on-road-passing-with-trees-Zx49AWzWqFw',
  }),
  heroTerrassement: photo({
    file: 'hero-terrassement',
    widths: [1920, 960],
    ratio: [16, 9],
    alt: 'Pelle hydraulique chargeant de la terre rouge dans un tombereau sur un chantier de terrassement',
    author: 'Troy Mortier',
    sourceUrl: 'https://unsplash.com/photos/excavator-dumping-soil-into-dump-truck-eKY6_9W_iqY',
  }),
  heroFoncier: photo({
    file: 'hero-foncier',
    widths: [1920, 960],
    ratio: [16, 9],
    alt: "Paysage de collines vertes parsemées d'arbres",
    author: 'Ismail Abubakar',
    sourceUrl: 'https://unsplash.com/photos/expansive-green-landscape-with-rolling-hills-and-scattered-trees-_U863FniUCw',
  }),
  pageEntreprise: photo({
    file: 'page-entreprise',
    widths: [1920, 960],
    ratio: [21, 9],
    alt: 'Immeuble en construction à contre-jour au coucher du soleil',
    author: 'Nichika Sakurai',
    sourceUrl: 'https://unsplash.com/photos/a-building-under-construction-with-the-sun-setting-in-the-background-w16Jhg7J4g0',
  }),
  pageActivites: photo({
    file: 'page-activites',
    widths: [1920, 960],
    ratio: [21, 9],
    alt: 'Pelle hydraulique sur une butte, à contre-jour',
    author: 'Built Robotics',
    sourceUrl: 'https://unsplash.com/photos/a-yellow-excavator-on-a-hill-with-a-blue-sky-in-the-background-zmW-UG2OX_M',
  }),
  pageOffres: photo({
    file: 'page-offres',
    widths: [1920, 960],
    ratio: [21, 9],
    alt: 'Piste en terre qui serpente entre des buissons de savane',
    author: 'Wade Lambert',
    sourceUrl: 'https://unsplash.com/photos/empty-roadway-near-bushes-G2DK8n2qnyM',
  }),
  pageProjets: photo({
    file: 'page-projets',
    widths: [1920, 960],
    ratio: [21, 9],
    alt: 'Arbres de savane en silhouette au coucher du soleil',
    author: 'Dawn Westveld',
    sourceUrl: 'https://unsplash.com/photos/trees-on-land-during-sunset-xPbprms3u6Q',
  }),
  pageContact: photo({
    file: 'page-contact',
    widths: [1440, 720],
    ratio: [21, 9],
    alt: "Vue aérienne d'un quartier urbain aux rues arborées",
    author: 'Ben Koorengevel',
    sourceUrl: 'https://unsplash.com/photos/aerial-view-of-city-buildings-during-daytime-4wiwWdRBRW0',
  }),
  categorieBtp: photo({
    file: 'categorie-btp',
    widths: [1024, 640],
    ratio: [4, 3],
    alt: "Vue aérienne d'une pelle creusant une tranchée",
    author: 'Built Robotics',
    sourceUrl: 'https://unsplash.com/photos/a-large-yellow-truck-driving-down-a-dirt-road-oX2MggrtCVA',
  }),
  categorieImmobilier: photo({
    file: 'categorie-immobilier-amenagement',
    widths: [1280, 640],
    ratio: [4, 3],
    alt: "Vue aérienne d'un quartier résidentiel",
    author: 'Tunde Buremo',
    sourceUrl: 'https://unsplash.com/photos/aerial-view-of-a-city-with-many-buildings-and-roads-V5w1Gp67lg8',
  }),
  categorieCommerce: photo({
    file: 'categorie-commerce-general',
    widths: [1280, 640],
    ratio: [4, 3],
    alt: "Rayonnages d'entrepôt chargés de cartons",
    author: 'Ali Mkumbwa',
    sourceUrl: 'https://unsplash.com/photos/a-large-stack-of-boxes-in-a-warehouse-DU2ybvshovg',
  }),
  categorieImportExport: photo({
    file: 'categorie-import-export',
    widths: [1280, 640],
    ratio: [4, 3],
    alt: 'Porte-conteneurs vu du dessus sous des grues portuaires',
    author: 'Daniel Miksha',
    sourceUrl: 'https://unsplash.com/photos/cargo-ship-loaded-with-colorful-containers-at-a-port-w8VfTO3TGs8',
  }),
  ctaDevis: photo({
    file: 'cta-devis',
    widths: [1920, 960],
    ratio: [21, 9],
    alt: 'Grues de chantier en silhouette sur un ciel orangé',
    author: 'Jahanzeb Ahsan',
    sourceUrl: 'https://unsplash.com/photos/the-sun-is-setting-behind-a-building-under-construction-C24QDMvoblg',
  }),
} as const;

export type StockPhotoKey = keyof typeof STOCK_PHOTOS;

/** Photo par défaut des slides du hero, dans l'ordre des slides. */
export const HERO_PHOTOS: readonly StockPhotoKey[] = ['heroRoutes', 'heroTerrassement', 'heroFoncier'];

/** Couverture par défaut de chaque catégorie (slug du domaine). */
export const CATEGORY_PHOTOS: Record<string, StockPhotoKey | undefined> = {
  btp: 'categorieBtp',
  'immobilier-amenagement': 'categorieImmobilier',
  'commerce-general': 'categorieCommerce',
  'import-export': 'categorieImportExport',
};

const fileUrl = (p: StockPhoto, w: number) => `/assets/photos/${p.file}-${w}.webp`;

/** Image prête à afficher (deux tailles, dimensions, mention et crédit). */
export function stockImage(key: StockPhotoKey): ImageSource {
  const p: StockPhoto = STOCK_PHOTOS[key];
  const [large, small] = p.widths;
  return {
    src: fileUrl(p, large),
    srcSet: `${fileUrl(p, small)} ${small}w, ${fileUrl(p, large)} ${large}w`,
    alt: p.alt,
    width: large,
    height: Math.round((large * p.ratio[1]) / p.ratio[0]),
    notice: "Photo d'illustration",
    credit: `Photo : ${p.author} / Unsplash`,
  };
}

/** Crédits de toutes les photos (mentions légales). */
export const STOCK_PHOTO_CREDITS = Object.values(STOCK_PHOTOS).map((p: StockPhoto) => ({
  author: p.author,
  sourceUrl: p.sourceUrl,
  alt: p.alt,
}));
