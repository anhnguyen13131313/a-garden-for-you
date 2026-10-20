# Paste this prompt into Antigravity after `npm install`

You are the **lead creative engineer/orchestrator** implementing a private mobile-first romantic website gift called **A Garden That Blooms For You** for Vietnamese Women's Day (20/10/2026). Model for this run is chosen by the human in Antigravity (Argon). Do not assume a particular model ID.

Read, in order: `AGENTS.md`, `docs/MASTER_SPEC.md`, `docs/STORYBOARD.md`, `docs/ANIMATION_BRIEF.md`, `docs/PERFORMANCE.md`, `src/content/gardenContent.ts`. Keep all five intimate messages exact, in author voice. There is already a functional React+TS 2D fallback. Do not replace with static screenshots or erase working content.

**Mission:** Transform the starter into a breathtaking, high-end, premium, cinematic, delightful interactive flower garden designed primarily for a 390×844 phone, responsive down to 320px and great on iPhone Safari and Android Chrome. The flower visuals should be excellent, scrolling buttery-smooth, scenes choreographed delicately and touch interactions delightful. Strong visual design is more important than maximal shader complexity. Beautiful at first paint.

**Use roles if supported:** delegate separately to `.agents/agents/floral-3d.md`, `motion-director.md`, `mobile-ux.md`, `performance-qa.md`, preferably isolated worktrees. If custom subagent invocation is unavailable in the current surface, assume these roles sequentially; do not pretend you spawned agents. Lead agent resolves integration and owns final polish. Never have two agents overwrite the same files without coordination.

**Execution stages:**
1. Inspect starter, install deps only if needed, run `npm run typecheck && npm run build`. Make a short implementation plan and visual art direction before editing.
2. Upgrade hero first: a single premium quality blooming rose/tulip, gentle glow and intuitive touch reveal; keep light DOM fallback.
3. Create a lush portrait garden with responsive camera framing, GPU-efficient petals/flower instance layers and subtle scroll-driven motion.
4. Make the five personal flowers tactile with user messages in accessible DOM panels; include an emotional six-years moment and polished 20/10 finale.
5. Profile mobile, fix input/scroll and heavy assets, support WebGL failure and reduced motion, and run a real browser check. Provide screenshots and truthful QA evidence when tools permit.

**Non-negotiables:**
- No horizontal overflow at 320/375/390/430px. Use safe-area and dynamic viewport handling.
- No unlicensed images/audio, auto-playing music, hover-only UX, blank WebGL fallback or per-frame React setState.
- Keep author content from `gardenContent.ts`; no fabricated names or memories.
- GSAP/Lenis scroll pipeline must have a single ticker and cleanup; don't hijack native touch scroll.
- Efficient R3F + shaders as appropriate, capped DPR + adaptive quality tiers; prefer stable frame pacing over excess particles.
- Don't announce "60fps" without device measurement. Document remaining performance limitations.

**Definition of done:** functioning and buildable React/TS project, obvious romantic impact on mobile, tap-to-open all 5 messages, cinematic but controllable scroll, fully readable under reduced motion/no WebGL, and concise `docs/QA_REPORT.md` with test evidence. Prioritize implemented polish over generic explanation.
