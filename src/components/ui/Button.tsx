import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'dark' | 'whatsapp';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-poppins font-bold uppercase tracking-wider transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-wait disabled:opacity-70';

const VARIANTS: Record<ButtonVariant, string> = {
  // Or : action principale (texte marine, contraste 5,7:1).
  primary: 'bg-gold text-marine shadow-sm hover:bg-gold-hover hover:shadow-md',
  // Contour : s'adapte au fond via `onDark`.
  secondary: 'border border-marine text-marine hover:bg-marine hover:text-white',
  ghost: 'text-marine hover:text-gold-hover',
  dark: 'bg-marine text-white shadow-sm hover:bg-marine-dark hover:shadow-md',
  whatsapp: 'bg-gn-green text-white shadow-sm hover:bg-gn-green-hover hover:shadow-md',
};

const ON_DARK: Partial<Record<ButtonVariant, string>> = {
  secondary: 'border border-white/50 text-white hover:border-gold hover:bg-transparent hover:text-gold',
  ghost: 'text-white hover:text-gold',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'px-4 py-2.5 text-[11px]',
  md: 'px-5 py-3 text-xs',
  lg: 'px-7 py-4 text-xs sm:text-[13px]',
};

type StyleProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Bouton posé sur un fond sombre (marine, image). */
  onDark?: boolean;
  fullWidth?: boolean;
  className?: string;
};

/** Classes d'un bouton, pour les rares cas où le composant ne convient pas. */
export function buttonClasses({ variant = 'primary', size = 'md', onDark, fullWidth, className = '' }: StyleProps = {}) {
  const look = (onDark && ON_DARK[variant]) || VARIANTS[variant];
  const padding = variant === 'ghost' ? 'px-0 py-1 text-xs' : SIZES[size];
  return `${BASE} ${look} ${padding} ${fullWidth ? 'w-full' : ''} ${className}`;
}

type CommonProps = StyleProps & {
  children: ReactNode;
  /** Icône avant le libellé. */
  icon?: ReactNode;
  /** Icône après le libellé. */
  iconRight?: ReactNode;
};

type AsButton = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { to?: never; href?: never };
type AsLink = CommonProps & { to: string; href?: never; onClick?: () => void };
type AsAnchor = CommonProps & { href: string; to?: never; external?: boolean; onClick?: () => void };

export type ButtonProps = AsButton | AsLink | AsAnchor;

/**
 * Bouton de la charte. Rend un <Link> avec `to`, un <a> avec `href`, sinon un <button>.
 */
export function Button({ variant, size, onDark, fullWidth, className, children, icon, iconRight, ...rest }: ButtonProps) {
  const classes = buttonClasses({ variant, size, onDark, fullWidth, className });
  const content = (
    <>
      {icon}
      {children}
      {iconRight}
    </>
  );

  if (rest.to !== undefined) {
    return (
      <Link to={rest.to} onClick={rest.onClick} className={classes}>
        {content}
      </Link>
    );
  }
  if (rest.href !== undefined) {
    const external = ('external' in rest ? rest.external : undefined) ?? /^https?:/i.test(rest.href);
    return (
      <a
        href={rest.href}
        onClick={rest.onClick}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {content}
      </a>
    );
  }
  // Ici, `to` et `href` sont absents : le reste est un jeu d'attributs de <button>.
  const buttonProps = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button {...buttonProps} type={buttonProps.type ?? 'button'} className={classes}>
      {content}
    </button>
  );
}
