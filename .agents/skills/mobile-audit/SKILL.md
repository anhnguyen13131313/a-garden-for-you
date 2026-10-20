---
name: mobile-audit
description: Audit the romantic website on mobile layouts for smooth scrolling, responsive text, accessibility, performance and broken interactions.
---
# Mobile audit sequence
1. Build and serve the app locally.
2. Check viewport sizes 320×568, 375×812, 390×844, 430×932, 768×1024 and desktop 1440×900.
3. Verify all six scenes, each of five flower messages, replay behavior, keyboard use, contrast and reduced motion.
4. Inspect runtime errors, oversized network assets, scroll jank and WebGL context restoration/failure.
5. If actual hardware is unavailable, clearly label results as emulator/viewport simulation, not on-device FPS.
6. Log findings with severity in `docs/QA_REPORT.md`; fix regressions without rewriting story copy.
