import { ReactNode } from 'react';

type InfoCardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function InfoCard({ title, description, children }: InfoCardProps) {
  return (
    <section style={{ background: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
      <h2 style={{ margin: 0, fontSize: 18 }}>{title}</h2>
      {description ? <p style={{ margin: '8px 0 0', color: '#6b7280', fontSize: 14 }}>{description}</p> : null}
      {children ? <div style={{ marginTop: 12 }}>{children}</div> : null}
    </section>
  );
}
