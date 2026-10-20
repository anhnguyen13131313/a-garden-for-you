import { IconNextChapter } from '../components/BotanicalIcons';
import { FlowerArt } from '../components/FlowerArt';
import { SceneShell } from '../components/SceneShell';
import { gardenContent as copy } from '../content/gardenContent';

export function WishScene() {
  return (
    <SceneShell
      id="wish"
      eyebrow={copy.wish.eyebrow}
      className="scene--wish"
      ornament={<div className="wish-sunset-halo" aria-hidden="true" />}
    >
      <div className="wish-layout">
        <div
          className="wish-ornament-stage"
          data-wish-intro="ornament"
          aria-hidden="true"
        >
          <div className="wish-emblem">
            <svg
              className="wish-emblem__rays"
              viewBox="0 0 180 180"
              fill="none"
            >
              <circle
                cx="90"
                cy="90"
                r="76"
                stroke="rgba(226, 152, 72, 0.36)"
                strokeWidth="1.2"
                strokeDasharray="4 5"
              />
              <circle
                cx="90"
                cy="90"
                r="58"
                fill="rgba(255, 226, 172, 0.28)"
              />
            </svg>
            <FlowerArt
              size="small"
              variant="bloom"
              className="flower-art--wish-fallback"
            />
          </div>
        </div>

        <div className="wish-card" data-wish-intro="card">
          <h2 className="scene__heading scene__heading--wish">
            {copy.wish.title}
          </h2>
          <p className="scene__copy wish-card__message">{copy.wish.message}</p>
          <p className="wish-card__season-note">
            Qua bao mùa nắng mưa, anh vẫn luôn ở đây thương bé iu.
          </p>
        </div>

        <div className="wish-cta" data-wish-intro="cta">
          <a className="scene__next-link" href="#finale">
            <span>Đến chương cuối của khu vườn</span>
            <IconNextChapter size={17} />
          </a>
        </div>
      </div>
    </SceneShell>
  );
}
