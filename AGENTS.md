# PROJECT ROOT — A Garden That Blooms For You

This is a private romantic mobile-first website gift for Vietnamese Women's Day, 20 October 2026. Recipient is the user's girlfriend of six years. The author affectionately calls her "bé iu". The primary experience is on her phone. **Optimize emotion, beauty, touch UX, load speed and animation smoothness in that order.**

## Mandatory context
- Read `docs/MASTER_SPEC.md`, `docs/STORYBOARD.md`, `docs/PERFORMANCE.md` and `src/content/gardenContent.ts` before changing UI.
- Story copy is user-specific, not filler. **Do not rewrite personal messages or invent personal events, names or photos.**
- Preserve the 6-scene story order: invitation, first bloom, garden, five flowers, wish, finale.
- Keep fully working 2D DOM fallback. The site must be readable without WebGL, sound, motion, JavaScript-heavy transitions or high-end GPU.
- Build mobile-first (320–430px portrait), touch-first, then tablet & desktop. Maintain 44px+ tap targets, safe areas and contrast.
- React 19, strict TypeScript, Vite; Three.js + R3F + Drei; GSAP + Lenis only when useful. Avoid additional packages without a documented reason.
- **No massive monolithic scene**, no per-frame React `setState`, no scroll hijacking, no unlicensed assets, no surprise audio autoplay.
- Every visual change: `npm run typecheck`, `npm run build`, and verify in mobile viewport on device/browser if available. Report tests actually executed; do not claim simulated screenshots if not taken.

## Agent coordination
Use `.agents/agents/` role definitions for parallel tasks, and `.agents/skills/` for executable procedures. Prefer isolated branches/worktrees for parallel edits. A subagent owns only its assigned files; integration edits happen in the coordinator after conflicts are resolved.

## Current stage
The project is a complete functional DOM/CSS starter. **Do not replace it with a screenshot**. Phase 2 adds beautiful performant 3D and a cinematic scroll narrative incrementally.
