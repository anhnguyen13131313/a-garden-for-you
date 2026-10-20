---
trigger: always_on
description: WebGL performance budget and user experience guardrails.
---
# Performance guardrails
- Goal, not guarantee: smooth 60 FPS on strong mobile; avoid unstable FPS on weaker phones; fall back to 30 FPS or static where necessary.
- Above-the-fold text/first flower must render before large 3D chunks.
- Default mobile DPR <=1.5; adapt by measured performance and features.
- Avoid costly multiple bloom passes, large transparent overdraw, huge shadow maps and 1000s of separate draw calls.
- Prefer instancing, pre-baked lighting, LOD, GPU shaders and compressed textures when beneficial.
- No React state updates per animation frame; clean up Three.js resources, GSAP contexts and event handlers.
- Do not impose arbitrary FPS claims without on-device test evidence.
