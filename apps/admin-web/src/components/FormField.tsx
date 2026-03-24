import { InputHTMLAttributes } from 'react';

type FormFieldProps = {
  label: string;
} & InputHTMLAttributes<HTMLInputElement>;

export function FormField({ label, ...props }: FormFieldProps) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
      <input
        {...props}
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          border: '1px solid #d1d5db',
          fontSize: 14
        }}
      />
    </label>
  );
}
