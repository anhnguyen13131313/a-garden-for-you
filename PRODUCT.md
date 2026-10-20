# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
- **Primary user (Inferred from brief):** The author's girlfriend of six years, affectionately called "bé iu", opening the gift link on her smartphone in portrait orientation on Vietnamese Women's Day (20 October 2026).
- **Secondary user / presenter (Inferred from brief):** The author sharing the private link or experiencing it alongside her on a phone or desktop browser.

## Product Purpose
- **Core purpose (Inferred from brief):** A private, interactive romantic website gift — *A Garden That Blooms For You* — that unfolds across six scrollable chapters (`#invitation`, `#first-bloom`, `#garden`, `#memories`, `#wish`, `#finale`) and lets her tap five special flowers to read personal Vietnamese love notes celebrating six years together and 20/10.
- **Definition of success (Inferred from brief):** Immediate emotional warmth, effortless one-handed portrait touch interaction on her phone (`320px–430px` viewports), zero horizontal overflow, full legibility of every personal message, and smooth adaptive performance with an always-working 2D fallback.

## Positioning
- **Distinct mechanism (Inferred from brief):** Rather than a generic stock greeting card or heavy desktop-only WebGL tech demo, the product pairs a resilient, accessible HTML/CSS story spine with progressive 3D botanical staging where every flower and chapter directly serves five real, personal Vietnamese messages written in the author's own voice.

## Operating Context
- **Usage environment (Inferred from brief):** Primarily opened on a portrait smartphone (iOS Safari or Android Chrome) via a shared URL, potentially over mobile data or varying device GPU tiers, with dynamic browser address bars, notches (`safe-area-inset-*`), and one-handed thumb scrolling/tapping.
- **Evaluation environment (Inferred from brief):** Local Vite development/preview server and production static build (`npm run typecheck && npm run build`), tested across `320×568`, `375×812`, `390×844`, `430×932`, `768×1024`, and `1440×900` viewports.

## Capabilities and Constraints
- **Confirmed capabilities (Inferred from brief):**
  - Six ordered narrative scenes: Invitation (`#invitation`), First Bloom (`#first-bloom`), Your Own Garden (`#garden`), Five Little Flowers (`#memories`), My Wish For You (`#wish`), and Forever Blooming (`#finale`).
  - Five interactive memory flowers (`little-things`, `funny-moment`, `six-years`, `wishes`, `one-more-thing`) accessible by both tap and keyboard (`aria-expanded`, `aria-controls`).
  - Progressive quality tiers (`static`, `low`, `medium`, `high`) in `src/lib/performance.ts` that adapt to `prefers-reduced-motion`, `saveData`, low memory, and WebGL availability.
- **Confirmed constraints (Inferred from brief):**
  - Mobile-first (`320px–430px` portrait priority); minimum `44px` tap targets; no hover-only interactions; no scroll-jacking.
  - Complete 2D DOM/CSS fallback when WebGL is unavailable or reduced motion is preferred.
  - No per-frame React `setState` updates; single scroll/animation ticker; mobile DPR capped (`<= 1.5` default mobile).
  - No unlicensed third-party assets, no fabricated memories/names/photos, and no surprise auto-playing audio.
- **Undecided product facts:**
  - Final production hosting provider (Vercel or Netlify static deployment not yet configured).
  - Whether optional user-initiated synthesized audio chimes should be enabled or omitted (currently silent by default).

## Brand Commitments
- **Identity & Naming (Inferred from brief):** *A Garden That Blooms For You* — occasion `20/10/2026`, recipient `"bé iu"`, signature `"Forever, your boy. ♥"`.
- **Voice & Copy Invariant (Inferred from brief):** Sincere, gentle, lightly playful Vietnamese coupled with short English chapter eyebrows, including the author's natural conversational phrasing and `=)))` expressions. All copy in `src/content/gardenContent.ts` is canonical and must never be rewritten or replaced with generic quotes.

## Evidence on Hand
- **Canonical copy:** `src/content/gardenContent.ts` (all 6 scene texts and all 5 personal flower messages).
- **Specifications & architecture contracts:** `AGENTS.md`, `docs/MASTER_SPEC.md`, `docs/STORYBOARD.md`, `docs/ANIMATION_BRIEF.md`, `docs/PERFORMANCE.md`, and `src/three/README.md`.
- **Explicit absences (must not be fabricated):** No personal couple photographs and no licensed external audio files are included in `public/assets/`.

## Product Principles
1. **Emotion and intimacy over spectacle:** Technology and 3D visuals exist to frame the author's words for "bé iu", never to obscure or delay them.
2. **Portrait smartphone first:** Every interaction, composition, and performance budget is engineered for one-handed mobile touch (`320px–430px`) before tablet or desktop.
3. **Graceful progressive enhancement:** Useful, heartfelt content and 2D botanical art paint immediately and remain fully complete without WebGL, high-end GPUs, or motion.
4. **Canonical story integrity:** The six-chapter narrative order and the five verbatim Vietnamese love messages are sacrosanct.

## Accessibility & Inclusion
- **Required standards (Inferred from brief):**
  - Full keyboard accessibility (`Tab`, `Enter`, `Space`, visible `:focus-visible` outlines, and skip-link `#memories`).
  - Strict adherence to `prefers-reduced-motion: reduce` and `Save-Data` / low-memory device hints.
  - High-contrast, legible Vietnamese typography with intact diacritics over any background or canvas layer.
  - Minimum `44×44px` touch targets and `safe-area-inset-*` clearance.

