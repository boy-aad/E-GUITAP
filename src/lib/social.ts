import type { SocialNetwork } from '../content/types';

const HOSTS: [RegExp, SocialNetwork][] = [
  [/(^|\.)facebook\.com$|(^|\.)fb\.com$/, 'facebook'],
  [/(^|\.)linkedin\.com$/, 'linkedin'],
  [/(^|\.)instagram\.com$/, 'instagram'],
  [/(^|\.)tiktok\.com$/, 'tiktok'],
  [/(^|\.)youtube\.com$|(^|\.)youtu\.be$/, 'youtube'],
  [/(^|\.)x\.com$|(^|\.)twitter\.com$/, 'x'],
];

/** Réseau social déduit du domaine de l'URL. */
export function socialNetworkOf(url: string): SocialNetwork {
  let host: string;
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return 'autre';
  }
  return HOSTS.find(([re]) => re.test(host))?.[1] ?? 'autre';
}

export const SOCIAL_NETWORK_NAMES: Record<SocialNetwork, string> = {
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  x: 'X',
  autre: 'Réseau social',
};
