# 🌷 A Garden That Blooms For You

A mobile-first romantic interactive website gift for 20 October 2026. Six scrollable chapters, five personal flower messages, a graceful fallback, and a ready-to-delegate Antigravity agent architecture.

## Quick start — Windows / Antigravity
1. Unzip this folder.
2. In Antigravity, **File → Open Folder** and select `a-garden-for-you` (this root, not `src`).
3. Open terminal and run:

   ```powershell
   npm install
   npm run dev
   ```

4. Open the localhost URL printed by Vite. To access from a phone on the same Wi-Fi, run the dev server with `--host` (already configured), then open `http://YOUR-LAN-IP:5173` with the Windows firewall/network configured to allow it.
5. For production validation:

   ```powershell
   npm run typecheck
   npm run build
   ```

6. Open `docs/ARGON_KICKOFF_PROMPT.md`, copy its entire prompt to the Antigravity agent with **Argon** chosen, and ask it to follow the named agents/skills. The workspace already contains instructions.

## What is already functional?
- Vite / React 19 / strict TypeScript project structure
- Six fully readable mobile-responsive DOM/CSS scenes
- Five flower messages, tap to open/close with accessible buttons
- Decorative SVG/CSS flower and a lightweight petal field
- Reduced-motion and no-WebGL 2D fallback path
- `.agents/agents/` custom agent role definitions; `.agents/rules/` persistent instructions; `.agents/skills/` repeatable runbooks
- `docs/` story, motion, performance and kickoff plan

## What is intentionally **not** finished?
- High-end 3D flowers/GLSL, cinematic camera, particle GPU effects, postprocessing, professionally tuned animation, production deployment, licensed photos/audio, real device profiling.
- No `node_modules` or lockfile included: run `npm install` locally. Save the generated `package-lock.json` and commit it to your repository.
- The authoring environment could not reach npm registry to install deps; therefore the initial build is **not verified**. Agents should run typecheck/build after `npm install`.

## Editing personalized text
Edit `src/content/gardenContent.ts` only. The five messages were adapted from the user's own provided content in the conversation. **No AI agent may overwrite them without approval.**

## Layout
```
.agents/agents/          four custom subagents
.agents/rules/           always-on project invariants + architecture
.agents/skills/          kickoff, cinematics and mobile QA procedures
src/app/                 app shell + global CSS
src/scenes/              six chapter components
src/components/          2D flower, petals and shell
src/content/             one canonical source for all writing
src/lib/                 quality tier logic
src/three/               reserved WebGL integration space
docs/                    creative/technical spec + Argon handoff prompt
public/assets/           future licensed models/textures/audio
```

## Current Antigravity compatibility
As of 20 Oct 2026, official Antigravity docs specify workspace rules `.agents/rules`, skills `.agents/skills`, and custom subagents `.agents/agents`. The previous `.agents/workflows` scheme is deprecated; this starter intentionally uses skills instead. Subagent capability depends on Antigravity surface and plan. Use `model: inherit` so you can select Argon in the host UI.

## Notes
If Google Fonts is blocked, system fallback fonts load. No backend or sign-in is required. Before publishing publicly, decide whether the personal messages and photos are intended to be accessible to anyone with the link. A private unguessable URL is not true authentication.
