import type { RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  closeMemoryFlower,
  gardenState,
  markCanvasReady,
  openMemoryFlower,
  registerFinaleBloomTrigger,
  registerHeroBloomTrigger,
  registerReplayHandler,
  replayExperience,
  requestFinaleBloom,
  requestHeroBloom,
  setFinaleStage,
  setHeroBloomStage,
  subscribeCanvasReady,
  subscribeFinaleStage,
  subscribeGardenFlowerTouch,
  subscribeHeroBloomStage,
  subscribeMemoryState,
  triggerGardenTouchRipple,
  type FinaleBloomStage,
  type HeroBloomStage,
  type InteractiveFlowerNode,
  type MemoryDiscoverySnapshot,
  type MemoryFlowerId,
} from './gardenStore';

export {
  requestHeroBloom,
  subscribeHeroBloomStage,
  triggerGardenTouchRipple,
  subscribeGardenFlowerTouch,
  openMemoryFlower,
  closeMemoryFlower,
  subscribeMemoryState,
  requestFinaleBloom,
  subscribeFinaleStage,
  replayExperience,
  markCanvasReady,
  subscribeCanvasReady,
  type HeroBloomStage,
  type FinaleBloomStage,
  type InteractiveFlowerNode,
  type MemoryFlowerId,
  type MemoryDiscoverySnapshot,
};

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Boosts all 5 signature flowers in unison when the Scene 06 Grand Finale is triggered.
 */
function boostAllSignatureFlowersForFinale(): void {
  for (let i = 0; i < gardenState.interactiveFlowers.length; i++) {
    const flower = gardenState.interactiveFlowers[i];
    flower.touchImpulse = Math.max(flower.touchImpulse, 0.85);
    flower.bloomBoost = 0.35;
    flower.highlight = 0.9;
  }
}

/**
 * Choreographs the complete 6-scene interactive sequence:
 * Scene 01 (#invitation) -> Scene 02 (#first-bloom) -> Scene 03 (#garden)
 * -> Scene 04 (#memories) -> Scene 05 (#wish sunset) -> Scene 06 (#finale heart & replay)
 * using a single GSAP context, ScrollTrigger, quickTo parallax, and touch ripples.
 *
 * Updates `gardenState` mutably so the R3F canvas reads values in `useFrame`
 * with zero per-frame React state updates.
 */
export function useHeroBloomTimeline(containerRef: RefObject<HTMLElement | null>): void {
  useGSAP(
    (_context, contextSafe) => {
      const root = containerRef.current ?? document.documentElement;
      const invitationEl =
        root.querySelector<HTMLElement>('#invitation') ?? document.getElementById('invitation');
      const firstBloomEl =
        root.querySelector<HTMLElement>('#first-bloom') ?? document.getElementById('first-bloom');
      const gardenEl =
        root.querySelector<HTMLElement>('#garden') ?? document.getElementById('garden');
      const memoriesEl =
        root.querySelector<HTMLElement>('#memories') ?? document.getElementById('memories');
      const wishEl =
        root.querySelector<HTMLElement>('#wish') ?? document.getElementById('wish');
      const finaleEl =
        root.querySelector<HTMLElement>('#finale') ?? document.getElementById('finale');

      const mm = gsap.matchMedia();

      // -----------------------------------------------------------------------
      // Accessibility: Reduced Motion Mode
      // -----------------------------------------------------------------------
      mm.add('(prefers-reduced-motion: reduce)', () => {
        gardenState.bloomProgress = 1.0;
        gardenState.gardenRevealProgress = 1.0;
        gardenState.memoriesFocusProgress = 0;
        gardenState.postGardenProgress = 0;
        gardenState.sunsetProgress = 0;
        gardenState.finaleProgress = 0;
        gardenState.lightWarmth = 1.0;
        gardenState.particleBurst = 0;
        gardenState.pointerX = 0;
        gardenState.pointerY = 0;
        setHeroBloomStage('bloomed');

        const handleReducedTrigger = () => {
          gardenState.userTriggeredBloom = true;
          gardenState.bloomProgress = 1.0;
          gardenState.lightWarmth = 1.0;
          setHeroBloomStage('bloomed');
          firstBloomEl?.scrollIntoView({ behavior: 'auto', block: 'start' });
        };

        const handleReducedFinale = () => {
          gardenState.finaleBloomActive = true;
          gardenState.particleBurst = 1.0;
          boostAllSignatureFlowersForFinale();
          gardenState.finaleHeartProgress = 1.0;
          gardenState.lightWarmth = 1.0;
          setFinaleStage('heart');
        };

        const handleReducedReplay = () => {
          gardenState.finaleBloomActive = false;
          gardenState.finaleHeartProgress = 0;
          gardenState.particleBurst = 0.6;
          setFinaleStage('calm');
          if (invitationEl) {
            invitationEl.scrollIntoView({ behavior: 'auto', block: 'start' });
          } else {
            window.scrollTo({ top: 0, behavior: 'auto' });
          }
        };

        registerHeroBloomTrigger(handleReducedTrigger);
        registerFinaleBloomTrigger(handleReducedFinale);
        registerReplayHandler(handleReducedReplay);

        // Scene 01 (#invitation) -> Scene 02 (#first-bloom)
        if (invitationEl && firstBloomEl) {
          ScrollTrigger.create({
            trigger: invitationEl,
            endTrigger: firstBloomEl,
            start: 'top top',
            end: 'top top',
            scrub: true,
            onUpdate: (self) => {
              gardenState.sceneTransition = self.progress;
            },
          });
        }

        // Scene 02 (#first-bloom) -> Scene 03 (#garden)
        if (firstBloomEl && gardenEl) {
          ScrollTrigger.create({
            trigger: firstBloomEl,
            endTrigger: gardenEl,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            onUpdate: (self) => {
              gardenState.gardenRevealProgress = self.progress;
            },
          });
        }

        // Scene 03 (#garden) -> Scene 04 (#memories): Constellation focus on the 5 signature flowers
        if (gardenEl && memoriesEl) {
          ScrollTrigger.create({
            trigger: gardenEl,
            endTrigger: memoriesEl,
            start: 'bottom 88%',
            end: 'top 25%',
            scrub: true,
            onUpdate: (self) => {
              gardenState.memoriesFocusProgress = self.progress;
              if (self.progress > 0.02) {
                gardenState.gardenRevealProgress = 1.0;
                gardenState.postGardenProgress = 0;
              }
            },
          });
        }

        // Scene 05 (#wish): Through Every Season sunset choreography
        if (wishEl) {
          ScrollTrigger.create({
            trigger: wishEl,
            start: 'top 88%',
            end: 'center center',
            scrub: true,
            onUpdate: (self) => {
              const p = self.progress;
              gardenState.postGardenProgress = p;
              gardenState.sunsetProgress = p;
              gardenState.lightWarmth = Math.max(gardenState.lightWarmth, 0.48 + p * 0.44);
            },
          });
        }

        // Scene 06 (#finale): Twilight calm & finale progress
        if (finaleEl) {
          ScrollTrigger.create({
            trigger: finaleEl,
            start: 'top 85%',
            end: 'center center',
            scrub: true,
            onUpdate: (self) => {
              gardenState.finaleProgress = self.progress;
            },
          });
        }

        if (invitationEl && finaleEl) {
          ScrollTrigger.create({
            trigger: invitationEl,
            endTrigger: finaleEl,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            onUpdate: (self) => {
              gardenState.scrollProgress = self.progress;
            },
          });
        }

        return () => {
          registerHeroBloomTrigger(null);
          registerFinaleBloomTrigger(null);
          registerReplayHandler(null);
        };
      });

      // -----------------------------------------------------------------------
      // Full Choreographed Motion (Scenes 01–06 + Sunset + Finale Heart + Replay)
      // -----------------------------------------------------------------------
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // Beats 1–3: Arrival & Closed Bud initial state
        gardenState.bloomProgress = 0.08;
        gardenState.gardenRevealProgress = 0;
        gardenState.memoriesFocusProgress = 0;
        gardenState.postGardenProgress = 0;
        gardenState.sunsetProgress = 0;
        gardenState.finaleProgress = 0;
        gardenState.lightWarmth = 0.12;
        gardenState.particleBurst = 0;
        gardenState.userTriggeredBloom = false;
        setHeroBloomStage('bud');

        // Gentle entrance for Scene 01 intro elements ([data-hero-intro])
        const introElements = invitationEl
          ? Array.from(invitationEl.querySelectorAll<HTMLElement>('[data-hero-intro]'))
          : [];

        if (introElements.length > 0) {
          gsap.fromTo(
            introElements,
            { autoAlpha: 0, y: 18 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.15,
              stagger: 0.1,
              ease: 'expo.out',
              clearProps: 'transform,opacity,visibility',
            },
          );
        }

        // Gentle scroll-triggered entrance for Scene 03 intro elements ([data-garden-intro])
        const gardenIntroElements = gardenEl
          ? Array.from(gardenEl.querySelectorAll<HTMLElement>('[data-garden-intro]'))
          : [];

        if (gardenEl && gardenIntroElements.length > 0) {
          gsap.fromTo(
            gardenIntroElements,
            { autoAlpha: 0, y: 16 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.05,
              stagger: 0.1,
              ease: 'expo.out',
              clearProps: 'transform,opacity,visibility',
              scrollTrigger: {
                trigger: gardenEl,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        }

        // Gentle scroll-triggered entrance for Scene 04 intro elements ([data-memories-intro])
        const memoriesIntroElements = memoriesEl
          ? Array.from(memoriesEl.querySelectorAll<HTMLElement>('[data-memories-intro]'))
          : [];

        if (memoriesEl && memoriesIntroElements.length > 0) {
          gsap.fromTo(
            memoriesIntroElements,
            { autoAlpha: 0, y: 16 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.05,
              stagger: 0.09,
              ease: 'expo.out',
              clearProps: 'transform,opacity,visibility',
              scrollTrigger: {
                trigger: memoriesEl,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        }

        // Gentle scroll-triggered entrance for Scene 05 (#wish) elements ([data-wish-intro])
        const wishIntroElements = wishEl
          ? Array.from(
              wishEl.querySelectorAll<HTMLElement>(
                '[data-wish-intro="ornament"], [data-wish-intro="card"], [data-wish-intro="cta"], [data-wish-intro]',
              ),
            )
          : [];

        if (wishEl && wishIntroElements.length > 0) {
          gsap.fromTo(
            wishIntroElements,
            { autoAlpha: 0, y: 18 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.1,
              stagger: 0.14,
              ease: 'power3.out',
              clearProps: 'transform,opacity,visibility',
              scrollTrigger: {
                trigger: wishEl,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        }

        // Gentle scroll-triggered entrance for Scene 06 (#finale) Beat 01 & Beat 02 ([data-finale-intro])
        const finaleIntroElements = finaleEl
          ? Array.from(
              finaleEl.querySelectorAll<HTMLElement>(
                '[data-finale-intro="pause"], [data-finale-intro="trigger"], [data-finale-intro]',
              ),
            )
          : [];

        if (finaleEl && finaleIntroElements.length > 0) {
          gsap.fromTo(
            finaleIntroElements,
            { autoAlpha: 0, y: 18 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 1.1,
              stagger: 0.14,
              ease: 'power3.out',
              clearProps: 'transform,opacity,visibility',
              scrollTrigger: {
                trigger: finaleEl,
                start: 'top 82%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        }

        let isTapTweenActive = false;
        let bloomTimeline: gsap.core.Timeline | null = null;
        let finaleTl: gsap.core.Timeline | null = null;

        // Beats 4–8: Touch-triggered blooming sequence & transition to Scene 02
        const handleTriggerBloom = contextSafe
          ? contextSafe(() => {
              bloomTimeline?.kill();
              isTapTweenActive = true;
              gardenState.userTriggeredBloom = true;
              setHeroBloomStage('blooming');

              bloomTimeline = gsap.timeline({
                onComplete: () => {
                  isTapTweenActive = false;
                  setHeroBloomStage('bloomed');
                },
              });

              // Particle burst impulse: 0 -> 1 then settles to 0.25
              bloomTimeline.fromTo(
                gardenState,
                { particleBurst: 0 },
                {
                  particleBurst: 1,
                  duration: 0.45,
                  ease: 'power2.out',
                },
                0,
              );
              bloomTimeline.to(
                gardenState,
                {
                  particleBurst: 0.25,
                  duration: 1.4,
                  ease: 'sine.inOut',
                },
                0.45,
              );

              // Unfold flower petals progressively
              bloomTimeline.to(
                gardenState,
                {
                  bloomProgress: 1.0,
                  duration: 2.1,
                  ease: 'power3.inOut',
                },
                0,
              );

              // Warm the lighting
              bloomTimeline.to(
                gardenState,
                {
                  lightWarmth: 1.0,
                  duration: 1.9,
                  ease: 'power2.out',
                },
                0,
              );

              // At ~1.15s into the bloom, mark stage bloomed & smoothly scroll to Scene 02
              bloomTimeline.call(
                () => {
                  setHeroBloomStage('bloomed');
                  if (firstBloomEl && window.scrollY < window.innerHeight * 0.35) {
                    firstBloomEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                },
                [],
                1.15,
              );
            })
          : () => {};

        // Scene 06 (#finale): Beat 03–06 Grand Finale Bloom & Swirling Petal Heart Sequence
        const triggerFinaleSequence = contextSafe
          ? contextSafe(() => {
              finaleTl?.kill();
              gardenState.finaleBloomActive = true;
              gardenState.particleBurst = 1.0;
              setFinaleStage('blooming');
              boostAllSignatureFlowersForFinale();

              finaleTl = gsap.timeline();

              finaleTl.to(
                gardenState,
                {
                  finaleHeartProgress: 1.0,
                  duration: 2.5,
                  ease: 'power2.inOut',
                },
                0,
              );

              finaleTl.to(
                gardenState,
                {
                  lightWarmth: 1.0,
                  duration: 1.8,
                  ease: 'power2.out',
                },
                0,
              );

              finaleTl.to(
                gardenState,
                {
                  particleBurst: 0.35,
                  duration: 1.8,
                  ease: 'sine.inOut',
                },
                0.6,
              );

              finaleTl.call(
                () => {
                  setFinaleStage('heart');
                },
                [],
                1.25,
              );
            })
          : () => {};

        // Scene 06 (#finale): Beat 06 Replay handler — resets finale & scrolls smoothly to #invitation
        const handleReplay = contextSafe
          ? contextSafe(() => {
              finaleTl?.kill();
              bloomTimeline?.kill();
              isTapTweenActive = false;
              gardenState.finaleBloomActive = false;
              gardenState.finaleHeartProgress = 0;
              gardenState.particleBurst = 0.6;
              setFinaleStage('calm');

              if (invitationEl) {
                invitationEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            })
          : () => {};

        registerHeroBloomTrigger(handleTriggerBloom);
        registerFinaleBloomTrigger(triggerFinaleSequence);
        registerReplayHandler(handleReplay);

        // Scroll-driven synchronization between #invitation (Scene 01) and #first-bloom (Scene 02)
        if (invitationEl && firstBloomEl) {
          ScrollTrigger.create({
            trigger: invitationEl,
            endTrigger: firstBloomEl,
            start: 'top top',
            end: 'top top',
            scrub: true,
            onUpdate: (self) => {
              const p = self.progress;
              gardenState.sceneTransition = p;

              if (!isTapTweenActive) {
                const scrollBloom = Math.max(0.08, gsap.utils.clamp(0.08, 1.0, 0.08 + p * 0.92));
                const scrollWarmth = gsap.utils.interpolate(0.12, 1.0, p);

                if (!gardenState.userTriggeredBloom) {
                  gardenState.bloomProgress = scrollBloom;
                  gardenState.lightWarmth = scrollWarmth;
                } else {
                  gardenState.bloomProgress = Math.max(gardenState.bloomProgress, scrollBloom);
                  gardenState.lightWarmth = Math.max(gardenState.lightWarmth, scrollWarmth);
                }

                if (gardenState.bloomProgress > 0.75) {
                  setHeroBloomStage('bloomed');
                } else if (p < 0.2 && !isTapTweenActive && gardenState.gardenRevealProgress < 0.05) {
                  gardenState.userTriggeredBloom = false;
                  gardenState.bloomProgress = scrollBloom;
                  gardenState.lightWarmth = scrollWarmth;
                  setHeroBloomStage('bud');
                }
              }
            },
          });
        }

        // Scene 02 (#first-bloom) -> Scene 03 (#garden): Part 1 — Main camera pullback & garden reveal (0 -> 0.82)
        if (firstBloomEl && gardenEl) {
          ScrollTrigger.create({
            trigger: firstBloomEl,
            endTrigger: gardenEl,
            start: 'top top',
            end: 'top top',
            scrub: true,
            onUpdate: (self) => {
              const reveal = self.progress * 0.82;
              gardenState.gardenRevealProgress = reveal;

              if (!isTapTweenActive) {
                gardenState.bloomProgress = Math.max(gardenState.bloomProgress, 1.0);
                gardenState.lightWarmth = Math.max(gardenState.lightWarmth, 1.0);
              }
              if (reveal > 0.1) {
                setHeroBloomStage('bloomed');
              }
            },
          });

          // Scene 03 (#garden) top -> bottom: Part 2 — Gentle camera drift through the floral landscape (0.82 -> 1.0)
          ScrollTrigger.create({
            trigger: gardenEl,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            onUpdate: (self) => {
              const reveal = gsap.utils.interpolate(0.82, 1.0, self.progress);
              gardenState.gardenRevealProgress = reveal;
              gardenState.bloomProgress = 1.0;
              gardenState.lightWarmth = 1.0;
              setHeroBloomStage('bloomed');
            },
          });
        }

        // Scene 03 (#garden) -> Scene 04 (#memories): Focus on the 5 signature flowers while keeping garden alive
        if (gardenEl && memoriesEl) {
          ScrollTrigger.create({
            trigger: gardenEl,
            endTrigger: memoriesEl,
            start: 'bottom 88%',
            end: 'top 25%',
            scrub: true,
            onUpdate: (self) => {
              gardenState.memoriesFocusProgress = self.progress;
              if (self.progress > 0.02) {
                gardenState.gardenRevealProgress = 1.0;
                gardenState.bloomProgress = 1.0;
                gardenState.lightWarmth = 1.0;
                if (gardenState.postGardenProgress < 0.05) {
                  gardenState.postGardenProgress = 0;
                }
              }
            },
          });
        }

        // Scene 05 (#wish): Through Every Season sunset choreography & soft garden recession
        if (wishEl) {
          ScrollTrigger.create({
            trigger: wishEl,
            start: 'top 88%',
            end: 'center center',
            scrub: 0.7,
            onUpdate: (self) => {
              const p = self.progress;
              gardenState.postGardenProgress = p;
              gardenState.sunsetProgress = p;
              gardenState.lightWarmth = Math.max(gardenState.lightWarmth, 0.48 + p * 0.44);
            },
          });
        }

        // Scene 06 (#finale): The Grand Finale twilight framing scrub
        if (finaleEl) {
          ScrollTrigger.create({
            trigger: finaleEl,
            start: 'top 85%',
            end: 'center center',
            scrub: 0.7,
            onUpdate: (self) => {
              gardenState.finaleProgress = self.progress;
            },
          });
        }

        // Overall page scroll progress (#invitation -> #finale) for 3D camera rig fade
        if (invitationEl && finaleEl) {
          ScrollTrigger.create({
            trigger: invitationEl,
            endTrigger: finaleEl,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            onUpdate: (self) => {
              gardenState.scrollProgress = self.progress;
            },
          });
        }

        // Subtle touch / pointer parallax via reusable quickTo tweens
        const quickPointerX = gsap.quickTo(gardenState, 'pointerX', {
          duration: 0.6,
          ease: 'power3.out',
        });
        const quickPointerY = gsap.quickTo(gardenState, 'pointerY', {
          duration: 0.6,
          ease: 'power3.out',
        });

        const updatePointer = (clientX: number, clientY: number) => {
          const vw = Math.max(window.innerWidth, 1);
          const vh = Math.max(window.innerHeight, 1);
          const nx = gsap.utils.clamp(-1, 1, (clientX / vw) * 2 - 1);
          const ny = gsap.utils.clamp(-1, 1, (clientY / vh) * 2 - 1);
          quickPointerX(nx);
          quickPointerY(ny);
        };

        const onPointerMove = (e: PointerEvent) => {
          updatePointer(e.clientX, e.clientY);
        };

        const onTouchMove = (e: TouchEvent) => {
          const touch = e.touches[0];
          if (touch) {
            updatePointer(touch.clientX, touch.clientY);
          }
        };

        // Touch-reactive flowers in Scene 03 (#garden), strictly isolated from Scene 04 (#memories) & UI controls
        const onPointerDown = (e: PointerEvent) => {
          if (
            gardenState.isReadingMemory ||
            gardenState.memoriesFocusProgress > 0.45 ||
            gardenState.gardenRevealProgress <= 0.18 ||
            gardenState.postGardenProgress >= 0.7
          ) {
            return;
          }
          if (
            e.target instanceof Element &&
            e.target.closest(
              'button, a, input, summary, details, [role="button"], [role="dialog"], [data-memory-flower], .memory-letter-sheet, #memories',
            )
          ) {
            return;
          }
          const vw = Math.max(window.innerWidth, 1);
          const vh = Math.max(window.innerHeight, 1);
          const ndcX = (e.clientX / vw) * 2 - 1;
          const ndcY = -(e.clientY / vh) * 2 + 1;
          triggerGardenTouchRipple(ndcX, ndcY);
        };

        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('pointerdown', onPointerDown, { passive: true });

        return () => {
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('touchmove', onTouchMove);
          window.removeEventListener('pointerdown', onPointerDown);
          bloomTimeline?.kill();
          finaleTl?.kill();
          registerHeroBloomTrigger(null);
          registerFinaleBloomTrigger(null);
          registerReplayHandler(null);
        };
      });

      return () => {
        mm.revert();
        registerHeroBloomTrigger(null);
        registerFinaleBloomTrigger(null);
        registerReplayHandler(null);
      };
    },
    { scope: containerRef },
  );
}
