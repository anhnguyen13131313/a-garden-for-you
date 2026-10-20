import { FlowerArt } from '../components/FlowerArt';
import { SceneShell } from '../components/SceneShell';
import { gardenContent as copy } from '../content/gardenContent';

export function FirstBloomScene() {
  return (
    <SceneShell id="first-bloom" eyebrow={copy.firstBloom.eyebrow} className="scene--bloom">
      <div className="bloom-layout">
        <div className="scene__art bloom-botanical-stage" aria-hidden="true">
          <FlowerArt
            variant="bloom"
            stage="bloomed"
            className="flower-art--hero-fallback"
          />
        </div>

        <div className="bloom-reading-card">
          <h2 className="scene__heading">{copy.firstBloom.title}</h2>
          <p className="scene__copy">{copy.firstBloom.message}</p>
          <a className="scene__next-link" href="#garden">
            <span>Bước vào khu vườn của em</span>
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>
    </SceneShell>
  );
}
