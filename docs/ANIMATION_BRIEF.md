# Cinematic Animation Brief

## Artistic direction
Dreamy Pink blended with high-end editorial garden photography: ivory + blush + dusty rose + warm gold + delicate greenery. Cinematic yet graceful; avoid neon/purple gamer look, gaudy particles and exaggerated camera spins. Typography can evolve, but maintain Vietnamese diacritics.

## Sequence suggestions (creative flexibility retained)
- **Invitation:** show first meaningful content immediately. Flower turns and blooms on intentional tap, rather than blocking navigation with a loading cinematic.
- **First bloom:** layered petals open (1.0–1.8s), light warms; avoid camera jerks.
- **Garden reveal:** depth/parallax across 3 layers; subtle camera dolly over 1–2 viewports; scroll reverses naturally.
- **Memories:** each flower subtly breathes; tapped flower opens a readable DOM overlay/panel with no stolen touch gestures. Keep identity of opened card obvious.
- **Wish:** animations soften; maintain reading dwell time.
- **Finale:** progressive bloom, short petal flourish and heartfelt final line; offer replay.

## Motion rules
- On mobiles prefer opacity/transforms and shader uniforms; avoid layout animation each frame.
- No auto-scroll to force someone through reading; honor touch/swipe.
- No infinite aggressive camera motion that may induce dizziness.
- Honor `prefers-reduced-motion`; no essential info revealed only by movement.
- Music toggle only if user supplies legal asset; initial version silent.

## 3D integrations
- Use the DOM as canonical content and a WebGL layer behind/around it.
- Animate refs/uniforms, not React state each frame.
- Budget transparency; constrain DPR; optimize petals with InstancedMesh or GPU approaches.
- Never import GitHub code/assets without reviewing license and compatibility.
