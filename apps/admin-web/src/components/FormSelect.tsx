import { SelectHTMLAttributes } from 'react';

type Option = {
  label: string;
  value: string;
};

type FormSelectProps = {
  label: string;
  options: Option[];
} & SelectHTMLAttributes<HTMLSelectElement>;

export function FormSelect({ label, options, ...props }: FormSelectProps) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
      <select
        {...props}
        style={{
          padding: '10px 12px',
          borderRadius: 10,
          border: '1px solid #d1d5db',
          fontSize: 14,
          background: '#fff'
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
