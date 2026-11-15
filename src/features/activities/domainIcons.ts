import { Briefcase, HardHat, LandPlot, Package, Ship, type LucideIcon } from 'lucide-react';

/** Icône par domaine (slug). Un domaine ajouté dans l'administration reçoit l'icône par défaut. */
export const DOMAIN_ICONS: Record<string, LucideIcon | undefined> = {
  btp: HardHat,
  'immobilier-amenagement': LandPlot,
  'commerce-general': Package,
  'import-export': Ship,
};

export const DEFAULT_DOMAIN_ICON: LucideIcon = Briefcase;
