import { useEffect, useState } from 'react';
import {
  gardenState,
  markCanvasReady,
  subscribeCanvasReady,
} from '../motion/gardenStore';
import { IconFlower } from './BotanicalIcons';

/**
 * Lightweight, non-blocking romantic botanical loading veil.
 * Subscribes to `subscribeCanvasReady` and includes a 450ms safety timeout
 * so it never blocks or delays reading if WebGL is slow or disabled.
 */
export function GardenLoadingVeil() {
  const [isReady, setIsReady] = useState<boolean>(gardenState.canvasReady);

  useEffect(() => {
    if (gardenState.canvasReady) {
      setIsReady(true);
      return;
    }

    const unsubscribe = subscribeCanvasReady((ready) => {
      if (ready) {
        setIsReady(true);
      }
    });

    const safetyTimer = window.setTimeout(() => {
      markCanvasReady();
      setIsReady(true);
    }, 450);

    return () => {
      unsubscribe();
      window.clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <div
      className="garden-loading-veil"
      data-ready={isReady ? 'true' : 'false'}
      role="status"
      aria-live="polite"
      aria-hidden={isReady ? 'true' : 'false'}
    >
      <div className="garden-loading-veil__pill">
        <span className="garden-loading-veil__emblem" aria-hidden="true">
          <IconFlower size={20} />
        </span>
        <span className="garden-loading-veil__text">
          Đang đánh thức khu vườn nhỏ cho bé iu...
        </span>
      </div>
    </div>
  );
}

