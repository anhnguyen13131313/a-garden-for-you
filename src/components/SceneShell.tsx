import type { PropsWithChildren, ReactNode } from 'react';

export function SceneShell({ id, eyebrow, children, className = '', ornament }: PropsWithChildren<{ id: string; eyebrow?: string; className?: string; ornament?: ReactNode }>) {
  return (
    <section className={`scene ${className}`} id={id} aria-label={eyebrow}>
      {ornament}
      <div className="scene__body">
        {eyebrow && <p className="scene__eyebrow">{eyebrow}</p>}
        {children}
      </div>
    </section>
  );
}
