# WebGL integration contract (reserved)

The functioning site is currently DOM/CSS, as a stable fallback. The 3D agent may add components to this folder.

Rules:
1. Never remove `src/content/gardenContent.ts` or change the copy without user approval.
2. Lazy-load heavy 3D with `React.lazy` or dynamic import after meaningful text paints.
3. Add an ErrorBoundary and feature detection; no WebGL must still show the entire gift.
4. Canvas should be a decorative layer unless each object has an accessible equivalent DOM control.
5. The 3D renderer must not capture vertical scroll or prevent taps on memory cards.
6. `lib/performance.ts` provides initial caps; measure real FPS and downgrade when necessary.
7. Avoid React state setters in useFrame; use refs/uniforms for per-frame animation.
8. Mobile art direction first; portrait camera, safe areas and reduced motion.
