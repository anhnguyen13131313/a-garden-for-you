# MASTER SPECIFICATION v1.0 — A Garden That Blooms For You

**Occasion:** Vietnamese Women's Day, 20 October 2026. **Recipient:** girlfriend, affectionately called "bé iu". **Relationship:** six years. **Primary screen:** portrait smartphone. **Theme:** premium dreamy pink garden; poetry with playful, real-life romantic details. **Deployment:** static Vite build on Vercel/Netlify (not configured yet).

## Product outcome
A girl opens a link on her phone and sees a blooming flower. A natural vertical-scroll journey opens a magical floral garden. She taps five special flowers to read genuine handwritten-style messages, then reaches a warm 20/10 finale. The initial DOM version is fully usable and must remain a fallback.

## Do not compromise
- Mobile UI wins over desktop spectacle, stable FPS over maximal particles, personal copy over generic quotes.
- Touch controls, safe areas, readable type and emotional pacing. Initial useful content appears without waiting for WebGL.
- Progressive enhancement: HTML/CSS fallback -> optimized R3F hero -> particles -> scroll camera -> finale.
- Music is optional and must require a user tap. No audio asset is included. Photos are optional and not supplied.
- No user-facing debug UI; scenes should flow naturally.

## Stack
Vite, React 19, TypeScript, Three.js, React Three Fiber, Drei, GSAP with React integration, Lenis only if it improves scroll; avoid heavy postprocessing on mobile. Future asset optimization: KTX2/AVIF/WebP, Draco if models warrant it.

## Roles
`floral-3d`, `motion-director`, `mobile-ux`, `performance-qa` custom agents. Main agent owns integration. Check current Antigravity support for custom subagents; these `.agents/agents/*.md` files describe roles but do **not** magically launch jobs without agent tool access.

## Delivery stages
- **Stage 0 (included):** working DOM/CSS mobile-first React site, 6 scenes, 5 interactive flowers, user copy, configs & agent roles.
- **Stage 1:** visually refined hero/flower asset and stronger creative direction, verified at 390×844.
- **Stage 2:** GPU-based living garden and GSAP camera/scroll sequences, tuned per quality tier.
- **Stage 3:** tap interactions and polished finale; graceful fallback.
- **Stage 4:** on-device QA, LCP/CLS/INP review, fixes, deployment (with user approval).

## Success criteria
Pass basic phone layout at 320px, 375px, 390px, 430px widths; all copy legible; all 5 flowers accessible by tap and keyboard; no sideways scroll; no blank screen after WebGL failure; `npm run typecheck` and `npm run build` pass. Performance targets are aspirational until verified on real devices.
