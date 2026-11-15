import { useRouteLoaderData } from 'react-router';
import type { SiteContent } from '../content/types';

export const ROOT_ROUTE_ID = 'root';

/** Contenu du site, chargé par le loader de la route racine (voir app/router.tsx). */
export function useSiteContent(): SiteContent {
  const data = useRouteLoaderData(ROOT_ROUTE_ID) as SiteContent | undefined;
  if (!data) throw new Error('useSiteContent doit être utilisé sous la route racine.');
  return data;
}
