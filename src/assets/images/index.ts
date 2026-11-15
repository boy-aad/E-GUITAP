// Images importées comme modules : Vite les inclut dans le build de production
// (avec un nom haché pour le cache). Ne pas référencer ces fichiers par chaîne
// '/src/assets/...', ce chemin n'existe pas une fois le site déployé.
import heroConakry from './hero_conakry_architecture_1794150312428.jpg';
import btpSite from './btp_construction_site_1794150314495.jpg';
import realEstate from './real_estate_residence_1794150314705.jpg';
import commerce from './general_commerce_distribution_1794150315331.jpg';
import importExport from './import_export_port_containers_1794150316174.jpg';

export const IMAGES = {
  heroConakry,
  btpSite,
  realEstate,
  commerce,
  importExport,
} as const;
