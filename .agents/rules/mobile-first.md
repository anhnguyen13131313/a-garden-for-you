---
trigger: always_on
description: Mobile-first, accessibility and touch interaction invariants.
---
# Mobile-first invariant
- Primary devices: iPhone and Android in portrait. 320, 375, 390, 430px must not overflow.
- No hover-only interactions; all flower memories must open by tap and keyboard.
- Respect `safe-area-inset-*`, notch, dynamic browser chrome and `100dvh` fallback.
- Use 44px minimum touch targets; no scroll-jacking, no forced landscape.
- Respect reduced-motion, saving-data and disabled WebGL, with graceful fallback.
- Use attractive 2D fallback rather than blank Canvas on weak devices.
