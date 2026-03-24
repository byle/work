import { ReactNode } from 'react';

type PageSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function PageSection({ title, description, children }: PageSectionProps) {
  return (
    <section>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 22 }}>{title}</h2>
        <p style={{ margin: '8px 0 0', color: '#6b7280' }}>{description}</p>
      </div>
      {children}
    </section>
  );
}
