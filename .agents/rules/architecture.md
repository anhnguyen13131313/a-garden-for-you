---
trigger: model_decision
description: Apply when implementing React TS, R3F, GSAP, Lenis or updating project structure.
---
# Architecture
- Composition: `src/scenes` story and DOM structure; `src/components` shared UI; `src/three` optional render layer; `src/content` copy; `src/lib` quality/performance.
- Prefer code-split expensive 3D, with CSS/DOM static fallback.
- Use CSS variables for color/timing, keep animation constants in a centralized module once real timelines are added.
- Single scroll owner. If Lenis + GSAP are both used, use one ticker and clean up correctly; avoid nested smooth-scroll loops, touch scroll lock and racing scroll controllers.
- Make minimal diffs to existing working functionality, avoid dependency bloat.
