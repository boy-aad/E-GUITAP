import { Facebook, Globe, Instagram, Linkedin, Music2, Twitter, Youtube, type LucideIcon } from 'lucide-react';
import type { SocialLink, SocialNetwork } from '../../content/types';
import { SOCIAL_NETWORK_NAMES } from '../../lib/social';

const ICONS: Record<SocialNetwork, LucideIcon> = {
  facebook: Facebook,
  linkedin: Linkedin,
  instagram: Instagram,
  tiktok: Music2,
  youtube: Youtube,
  x: Twitter,
  autre: Globe,
};

/** Comptes officiels (company_contacts « social ») ; rien n'est affiché s'il n'y en a pas. */
export function SocialLinks({ links }: { links: SocialLink[] }) {
  if (links.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Réseaux sociaux">
      {links.map(({ network, label, url }) => {
        const Icon = ICONS[network];
        return (
          <li key={url}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-gold hover:bg-gold hover:text-marine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              aria-label={`${label || SOCIAL_NETWORK_NAMES[network]} (nouvel onglet)`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
