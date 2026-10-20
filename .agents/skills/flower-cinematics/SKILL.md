---
name: flower-cinematics
description: Implement animated WebGL flowers, blooms, drifting petals, GPU instancing and portrait-camera staging for the romantic garden while respecting mobile performance.
---
# Flower cinematics pipeline
1. Read `docs/ANIMATION_BRIEF.md` and `docs/PERFORMANCE.md`; ensure visible artistic quality at portrait 390×844.
2. Start with one high-quality hero flower; profile on mobile before adding 100+ instances.
3. Animate flower petals with shader uniforms/instancing or GSAP refs; never `setState` each frame.
4. Layer depth with restrained particles; avoid transparency overdraw and giant fullscreen passes.
5. Keep DOM copy and interactive flower controls on top; touch and scroll remain native.
6. Gracefully disable WebGL or reduce fidelity when needed. Keep reduced-motion fallback.
7. Clean up geometries, materials, listeners and animation timelines.
8. Validate visually and report scope of verification.
