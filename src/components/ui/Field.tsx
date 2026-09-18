import type { QuestionField } from '../../types';

interface FieldProps {
  field: QuestionField;
  value: string;
  onChange: (v: string) => void;
  className?: string;
  /** so the Label beside it can point at the control it names */
  id?: string;
}

/** Renders one backend-defined question as a text input or a select. */
export function Field({ field, value, onChange, className = 'input-text', id }: FieldProps) {
  if (field.kind === 'select') {
    return (
      <select className={className} id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {(field.options ?? []).map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    );
  }
  return (
    <input
      className={className}
      id={id}
      value={value}
      placeholder={field.ph}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
