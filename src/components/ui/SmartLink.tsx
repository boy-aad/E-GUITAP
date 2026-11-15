import type { ReactNode } from 'react';
import { Link } from 'react-router';

/**
 * Lien saisi dans l'administration : page interne (« /projets ») ou adresse externe
 * (« https://… », « mailto: », « tel: »). Les liens externes s'ouvrent dans un nouvel onglet.
 */
export function SmartLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  if (/^(https?:|mailto:|tel:)/i.test(href)) {
    const external = /^https?:/i.test(href);
    return (
      <a
        href={href}
        className={className}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}
