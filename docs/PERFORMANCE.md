# Performance budget — mobile first

## Performance goals (not measured yet)
- Warm load: prompt text and a flower art fallback visible without waiting for main 3D scene.
- Aim for 60fps on capable phones, stable lower-fidelity mode on constrained phones; avoid drops, jank and input delay.
- Initial mobile WebGL DPR cap around 1.5, subject to device testing; high tier at most 2.
- Design for 320–430px portrait, safe areas and `100dvh`. Native touch scroll works in iOS Safari.
- Hero should not import multi-MB assets before useful DOM paint. Do not set made-up LCP/INP claims.

## Progressive quality tier (starter in `src/lib/performance.ts`)
| Tier | Trigger | Visual fallback |
|---|---|---|
| static | reduced motion / no WebGL | complete 2D content |
| low | save-data / small device memory | minimal petals, 1 DPR, no post FX |
| medium | default phone | reduced instancing, <=1.5 DPR, no costly bloom |
| high | desktop / strong GPU if measured | extra depth, capped 2 DPR |

These tiers are *heuristics*; benchmark, observe FPS over time and adapt. DeviceMemory is non-standard and absent on some browsers. Avoid treating UA or OS as a definitive hardware benchmark.

## QA
Use DevTools performance profiles, Lighthouse, real phone if available. Test WebGL context unavailable, touch, focus, reduced motion, scroll, layout, browser address bar resizing. Explain what was actually measured vs planned.
