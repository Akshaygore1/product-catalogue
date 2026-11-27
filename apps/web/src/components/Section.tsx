import type { ReactNode } from 'react';

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-10 first:mt-0">
      <div className="mb-4">
        <h2 className="text-lg font-medium text-strong">{title}</h2>
        {description && <p className="mt-0.5 text-base text-subtle">{description}</p>}
      </div>
      {children}
    </section>
  );
}
