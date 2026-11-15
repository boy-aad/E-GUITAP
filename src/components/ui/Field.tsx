import {
  cloneElement,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';

type FieldProps = {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  /** Un seul contrôle (Input, Select ou Textarea) : il reçoit id et attributs ARIA. */
  children: ReactElement<{
    id?: string;
    required?: boolean;
    'aria-invalid'?: boolean;
    'aria-describedby'?: string;
  }>;
};

/** Champ de formulaire accessible : label relié, aide et erreur annoncées. */
export function Field({ label, required, hint, error, className = '', children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block font-inter text-xs font-semibold text-marine">
        {label}
        {required && (
          <span className="text-gn-red" aria-hidden="true">
            {' '}
            *
          </span>
        )}
      </label>
      {cloneElement(children, {
        id,
        required,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
      })}
      {hint && (
        <p id={hintId} className="mt-1 text-[11px] text-slate-text">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-[11px] font-medium text-gn-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const controlClass =
  'w-full rounded border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-marine placeholder:text-slate-400 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold aria-[invalid=true]:border-gn-red aria-[invalid=true]:bg-red-50/40';

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`${controlClass} ${props.className ?? ''}`} />
);

export const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`${controlClass} ${props.className ?? ''}`} />
);

export const Textarea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={`${controlClass} resize-y ${props.className ?? ''}`} />
);
