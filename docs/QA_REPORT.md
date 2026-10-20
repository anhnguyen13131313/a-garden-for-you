# Phase 2–5 QA & Mobile Verification Report

**Date**: 20 October 2026  
**Scope**:
- **Phase 2**: Scene 01 (`#invitation`) & Scene 02 (`#first-bloom`) Procedural 3D Hero Flower & Bloom Sequence
- **Phase 3**: Targeted Hero Flower Polish + Scene 03 (`#garden`) Multi-Layered Living Garden, Camera Pullback & Touch-Reactive Flowers
- **Phase 4**: Targeted Garden Depth Polish + Scene 04 (`#memories`) Five Interactive Memory Flowers, Botanical Letter Bottom Sheet & Special Six-Year Moment
- **Phase 5**: Scene 05 (`#wish` — Golden-Hour Sunset), Scene 06 (`#finale` — 6-Beat Grand Finale & 3D Swirling Petal Heart Formation), Replay Experience, Lightweight Botanical Loading Veil & Optional Web Audio Music-Box Toggle

---

## 1. Automated Build & Type Verification

| Check | Command | Result | Details |
| :--- | :--- | :--- | :--- |
| TypeScript Strict Mode | `npm run typecheck` (`tsc --noEmit`) | **PASS (0 errors)** | Strict typing across R3F custom shader uniforms, instanced botanical geometries, Web Audio synthesis, and GSAP timelines. |
| Production Bundle Build | `npm run build` (`tsc --noEmit && vite build`) | **PASS (709ms)** | `index.html` (`0.49 kB` gzip), `index.css` (`7.33 kB` gzip), `index.js` (`78.60 kB` gzip), `vendor-gsap.js` (`47.48 kB` gzip), lazy-loaded `GardenCanvas.js` (`15.64 kB` gzip), `vendor-three.js` (`233.09 kB` gzip). |
| WebGL Shader & Console Audit | Headless Chrome 147 CDP (`Runtime.exceptionThrown` / `console.error`) | **PASS (0 errors)** | Zero GLSL compilation warnings, zero runtime exceptions across all 6 scenes and all 4 mobile viewports. |

---

## 2. Phase 4 & Phase 5 Feature Verification

1. **Five Interactive Memory Flowers & Six-Year Moment (`src/scenes/MemoryFlowersScene.tsx`, `src/three/LivingGardenField.tsx`)**:
   - All 5 canonical Vietnamese love notes from `src/content/gardenContent.ts` open individually via 3D raycast or tactile constellation nodes (`>= 141×143px` on `320×568`, `>= 169×148px` on `390×844`).
   - Tapping Flower 03 (`six-years`) triggers the **6 Years Together** golden keepsake crest (`2020 – 2026 · Sáu năm bên bé iu`), warm golden light boost (`sixYearMomentActive`), and staggered typography reveal.
   - Discovering all 5 flowers updates the pill to `"Đã khám phá 5/5 bông hoa"` and reveals the completion banner (`"Đã mở trọn vẹn 5 điều anh gửi gắm ✨ Cùng ngắm hoàng hôn phía dưới nhé"`).
2. **Scene 05 — Through Every Season (`src/scenes/WishScene.tsx`, `src/three/HeroCameraRig.tsx`)**:
   - Scrolling into `#wish` transitions the 3D botanical garden into a warm golden-hour sunset (`sunsetProgress: 0 -> 1`, key light `#ffbe8f`, fill light `#ff9e7d`), slows wind motion (`windScale: 0.45`), and presents the canonical wish card (`"Anh mong em luôn hạnh phúc."`).
3. **Scene 06 — The Grand Finale (`src/scenes/FinaleScene.tsx`, `src/three/HeroDewParticles.tsx`)**:
   - **Beat 01 & Beat 02**: Twilight pause whisper (`"Khu vườn khẽ lắng lại trong ánh chiều dịu..."`) and tactile trigger button (`"Anh còn một điều muốn nói..."`, `52px` height).
   - **Beat 03 & Beat 04**: Tapping triggers `requestFinaleBloom()`, blooming all garden flowers warmly while the instanced 3D petals in `HeroDewParticles.tsx` swirl into a parametric **3D Heart-Shaped Formation** (`finaleHeartProgress: 0 -> 1`) paired with the synchronized `.finale-heart-svg` garland.
   - **Beat 05 & Beat 06**: Reveals `"Happy 20/10, bé iu! 💗"`, `"Happy Women's Day, My Love."`, `"Anh yêu em nhiều lắm. ❤️"`, `"Cảm ơn em vì 6 năm qua. Anh yêu em nhiều lắm."`, `"Forever, your boy. ♥"`, and the `"Ngắm khu vườn một lần nữa 🌷"` replay button (`48px` height), which resets finale state (`finaleStage: "calm"`) and smoothly scrolls back to `#invitation` (`scrollY: 0`) without reloading the page.
4. **Premium UI Polish (`src/components/GardenLoadingVeil.tsx`, `src/components/AmbientMusicToggle.tsx`, `src/components/BotanicalIcons.tsx`)**:
   - Non-blocking loading veil (`GardenLoadingVeil`) fades out automatically upon WebGL `<Canvas onCreated>` (or 450ms safety timeout) with no fake percentage bar.
   - Floating top-right ambient music toggle (`AmbientMusicToggle`, `94–103px × 44px`) is OFF by default (`aria-pressed="false"`) and synthesizes a soft celesta music-box lullaby (`Fmaj7 -> Em7 -> Dm7 -> Cmaj7`) via Web Audio API only when explicitly tapped.

---

## 3. Mobile Portrait Viewport Audit (`320px` – `430px`)

Measured via Headless Chrome CDP (`Emulation.setDeviceMetricsOverride`, `deviceScaleFactor: 2`, `mobile: true`):

| Viewport | `scrollWidth <= innerWidth` | Quality Tier | WebGL Canvas Buffer (`dpr <= 1.5`) | Music Toggle Size | Memory Node Min Size | Finale Trigger Height | Replay Button Height |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`320×568`** | `320 === 320` (**No overflow**) | `medium` | `480×852` | `94×44px` | `141×143px` | `52px` | `48px` |
| **`375×812`** | `375 === 375` (**No overflow**) | `medium` | `562×1218` | `94×44px` | `169×143px` | `52px` | `48px` |
| **`390×844`** | `390 === 390` (**No overflow**) | `medium` | `585×1266` | `103×44px` | `169×148px` | `52px` | `48px` |
| **`430×932`** | `430 === 430` (**No overflow**) | `medium` | `645×1398` | `103×44px` | `189×148px` | `52px` | `48px` |

### Measured Frame Timing (Headless Chrome ANGLE D3D11 @ `390×844`)
- **Scene 01 → Scene 02 Bloom Sequence (88 RAF samples)**: Average frame delta `6.06 ms` (`~165 FPS` uncapped headless ticker).
- **Scene 03 Living Garden Pullback (88 RAF samples)**: Average frame delta `6.06 ms` (`~165 FPS` uncapped headless ticker).
- **Scene 04 Five Memory Flowers & Six-Year Moment (88 RAF samples)**: Average frame delta `6.06 ms` (`~165 FPS` uncapped headless ticker).
- **Scene 06 Grand Finale 3D Swirling Petal Heart Formation (88 RAF samples)**: Average frame delta `7.44 ms` (`~134.5 FPS` uncapped headless ticker; well within the `16.67 ms` 60 FPS budget).
