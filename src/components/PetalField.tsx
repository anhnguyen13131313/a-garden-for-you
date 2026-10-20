import { useMemo } from 'react';
import type { CSSProperties } from 'react';

/** CSS fallback: intentionally small, deterministic and not driven by React state per frame. */
export function PetalField({ count = 8 }: { count?: number }) {
  const petals = useMemo(() => Array.from({ length: count }, (_, index) => {
    const seed = (index * 37 + 11) % 97;
    return { left: `${(seed * 13) % 100}%`, delay: `${-((index * 2.7) % 17)}s`, duration: `${11 + (index % 7) * 2}s`, size: `${7 + (index % 4) * 3}px` };
  }), [count]);
  return <div aria-hidden="true" className="petal-field">{petals.map((p, i) => <span key={i} className="falling-petal" style={{ '--x': p.left, '--delay': p.delay, '--duration': p.duration, '--size': p.size } as CSSProperties} />)}</div>;
}
