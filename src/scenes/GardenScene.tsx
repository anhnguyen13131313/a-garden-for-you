import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { FlowerArt } from '../components/FlowerArt';
import { SceneShell } from '../components/SceneShell';
import { gardenContent as copy, memoryFlowers } from '../content/gardenContent';
import {
  INITIAL_INTERACTIVE_FLOWERS,
  subscribeGardenFlowerTouch,
  triggerGardenTouchRipple,
  type InteractiveFlowerNode,
} from '../motion/gardenStore';

const DEFAULT_WHISPER = 'Chạm nhẹ vào khu vườn để đánh thức những đóa hoa';
const ACTIVE_WHISPER = 'Những cánh hoa đang khẽ nghiêng mình chào bé iu ✨';

export function GardenScene() {
  const [whisper, setWhisper] = useState<string>(DEFAULT_WHISPER);
  const [hasTouched, setHasTouched] = useState<boolean>(false);
  const cycleIndexRef = useRef<number>(0);

  useEffect(() => {
    return subscribeGardenFlowerTouch((flower: InteractiveFlowerNode) => {
      setHasTouched(true);
      const matchedMemory = flower.memoryId
        ? memoryFlowers.find((item) => item.id === flower.memoryId)
        : undefined;

      if (matchedMemory) {
        setWhisper(
          `Những cánh hoa đang khẽ nghiêng mình chào bé iu ✨ (${matchedMemory.emoji} ${matchedMemory.label})`,
        );
      } else {
        setWhisper(ACTIVE_WHISPER);
      }
    });
  }, []);

  function triggerFromCoordinates(clientX: number, clientY: number) {
    const vw = Math.max(window.innerWidth, 1);
    const vh = Math.max(window.innerHeight, 1);
    const ndcX = Math.max(-1, Math.min(1, (clientX / vw) * 2 - 1));
    const ndcY = Math.max(-1, Math.min(1, -((clientY / vh) * 2 - 1)));
    const touched = triggerGardenTouchRipple(ndcX, ndcY);
    setHasTouched(true);
    if (!touched) {
      setWhisper(ACTIVE_WHISPER);
    }
  }

  function handlePanoramicStageClick(event: MouseEvent<HTMLDivElement>) {
    // Avoid double-triggering when clicking the pill button itself
    if ((event.target as HTMLElement).closest('button')) return;
    triggerFromCoordinates(event.clientX, event.clientY);
  }

  function handlePillTrigger(event: MouseEvent<HTMLButtonElement>) {
    // Keyboard activation (Enter / Space) dispatches click with clientX === 0 && clientY === 0
    if (event.clientX === 0 && event.clientY === 0) {
      const targetNode =
        INITIAL_INTERACTIVE_FLOWERS[
          cycleIndexRef.current % INITIAL_INTERACTIVE_FLOWERS.length
        ];
      cycleIndexRef.current += 1;
      const ndcX = Math.max(-1, Math.min(1, targetNode.position[0] / 1.65));
      const ndcY = Math.max(-1, Math.min(1, targetNode.position[1] / 1.15));
      const touched = triggerGardenTouchRipple(ndcX, ndcY);
      setHasTouched(true);
      if (!touched) {
        setWhisper(ACTIVE_WHISPER);
      }
      return;
    }

    triggerFromCoordinates(event.clientX, event.clientY);
  }

  return (
    <SceneShell
      id="garden"
      eyebrow={copy.garden.eyebrow}
      className="scene--garden"
      ornament={<div className="garden-orb" aria-hidden="true" />}
    >
      <div className="garden-layout">
        <div
          className="garden-panoramic-stage"
          data-garden-intro="stage"
          onClick={handlePanoramicStageClick}
        >
          <div className="garden-cluster" aria-hidden="true">
            <FlowerArt
              size="small"
              variant="bud"
              className="flower-art--garden-fallback"
            />
            <FlowerArt
              variant="bloom"
              className="flower-art--garden-fallback"
            />
            <FlowerArt
              size="small"
              variant="bloom"
              className="flower-art--garden-fallback"
            />
          </div>

          <button
            type="button"
            className="garden-touch-pill"
            data-touched={hasTouched ? 'true' : 'false'}
            onClick={handlePillTrigger}
            aria-label="Chạm nhẹ vào khu vườn để đánh thức những đóa hoa"
          >
            <span className="garden-touch-pill__dot" aria-hidden="true" />
            <span className="garden-touch-pill__text" aria-live="polite">
              {whisper}
            </span>
          </button>
        </div>

        <div className="garden-reading-card" data-garden-intro="card">
          <h2 className="scene__heading">{copy.garden.title}</h2>
          <p className="scene__copy">{copy.garden.message}</p>
          <a className="scene__next-link" href="#memories">
            <span>Khám phá 5 bông hoa đặc biệt</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </SceneShell>
  );
}
