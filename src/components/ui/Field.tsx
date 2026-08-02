import type { QuestionField } from '../../types';

interface FieldProps {
  field: QuestionField;
  value: string;
  onChange: (v: string) => void;
  className?: string;
}

/** Renders one backend-defined question as a text input or a select. */
export function Field({ field, value, onChange, className = 'text-input' }: FieldProps) {
  if (field.kind === 'select') {
    return (
      <select className={className} value={value} onChange={(e) => onChange(e.target.value)}>
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
      value={value}
      placeholder={field.ph}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
