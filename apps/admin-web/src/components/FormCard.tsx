import { FormEvent, ReactNode } from 'react';

type FormCardProps = {
  title: string;
  description: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting?: boolean;
  children: ReactNode;
};

export function FormCard({ title, description, onSubmit, submitting, children }: FormCardProps) {
  return (
    <form onSubmit={onSubmit} style={{ background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e5e7eb', marginBottom: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 18 }}>{title}</h3>
        <p style={{ margin: '8px 0 0', color: '#6b7280' }}>{description}</p>
      </div>
      <div style={{ display: 'grid', gap: 12 }}>{children}</div>
      <div style={{ marginTop: 16 }}>
        <button
          type="submit"
          disabled={submitting}
          style={{
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 10,
            cursor: 'pointer'
          }}
        >
          {submitting ? '提交中...' : '提交'}
        </button>
      </div>
    </form>
  );
}
