import { HardHat, LandPlot, Package, Ship, type LucideIcon } from 'lucide-react';
import type { ActivityDomain } from '../../content/types';

export const DOMAIN_ICONS: Record<ActivityDomain['slug'], LucideIcon> = {
  btp: HardHat,
  'immobilier-amenagement': LandPlot,
  'commerce-general': Package,
  'import-export': Ship,
};
