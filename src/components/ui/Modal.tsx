import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  children: ReactNode;
  size?: 'md' | 'lg';
};

/**
 * Fenêtre modale accessible basée sur <dialog> :
 * focus piégé et arrière-plan inerte (showModal), fermeture par Échap,
 * clic sur le fond ou bouton, défilement de la page bloqué, focus rendu à l'ouverture.
 */
export function Modal({ open, onClose, title, eyebrow, children, size = 'lg' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = 'hidden';
    } else if (!open && dialog.open) {
      dialog.close();
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    // Le clic sur le fond est un raccourci souris : au clavier, Échap ferme déjà la fenêtre (onCancel).
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // Clic sur le fond (en dehors du contenu) : fermeture.
        if (e.target === e.currentTarget) onClose();
      }}
      className={`dialog-anim m-auto w-[calc(100%-1.5rem)] ${size === 'lg' ? 'max-w-2xl' : 'max-w-lg'} max-h-[92vh] p-0 rounded-lg border border-gold/30 bg-white shadow-2xl backdrop:bg-marine/80 backdrop:backdrop-blur-sm`}
    >
      <div className="flex max-h-[92vh] flex-col">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gold/40 bg-marine px-4 py-4 text-white sm:px-6">
          <div>
            {eyebrow && (
              <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.15em] text-gold">
                {eyebrow}
              </p>
            )}
            <h2 id={titleId} className="font-poppins text-lg font-bold sm:text-xl">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="press rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-gold"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </dialog>
  );
}
