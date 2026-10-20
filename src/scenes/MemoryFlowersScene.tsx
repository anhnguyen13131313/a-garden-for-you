import { useEffect, useState, type MouseEvent } from 'react';
import {
  IconClose,
  IconNextArrow,
  IconNextChapter,
  IconPrevArrow,
  IconSparkleCheck,
} from '../components/BotanicalIcons';
import { SceneShell } from '../components/SceneShell';
import {
  gardenContent as copy,
  memoryFlowers,
  type MemoryFlower,
} from '../content/gardenContent';
import {
  closeMemoryFlower,
  gardenState,
  openMemoryFlower,
  subscribeMemoryState,
  type MemoryFlowerId,
} from '../motion/gardenStore';

function SignatureBlossomIcon({ id }: { id: MemoryFlowerId }) {
  switch (id) {
    case 'little-things':
      // Cupped tulip-rose (#e46088)
      return (
        <svg
          className="memory-flower-node__svg"
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="32" cy="32" r="26" fill="rgba(228, 96, 136, 0.14)" />
          <path
            d="M32 42 C32 49, 31 54, 32 58"
            stroke="#5d8357"
            strokeWidth="2.6"
            strokeLinecap="round"
          />
          <path
            d="M32 14 C21 16, 16 26, 21 36 C25 43, 39 43, 43 36 C48 26, 43 16, 32 14 Z"
            fill="#e46088"
          />
          <path
            d="M22 22 C17 28, 20 39, 32 41 C28 33, 26 25, 22 22 Z"
            fill="#f59ab5"
          />
          <path
            d="M42 22 C47 28, 44 39, 32 41 C36 33, 38 25, 42 22 Z"
            fill="#f59ab5"
          />
          <circle cx="32" cy="27" r="4.5" fill="#ffe9a6" />
        </svg>
      );

    case 'funny-moment':
      // Ruffled sakura peony (#f398b4)
      return (
        <svg
          className="memory-flower-node__svg"
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="32" cy="32" r="26" fill="rgba(243, 152, 180, 0.18)" />
          <g fill="#f398b4">
            <circle cx="32" cy="18" r="9" />
            <circle cx="44" cy="26" r="9" />
            <circle cx="40" cy="40" r="9" />
            <circle cx="24" cy="40" r="9" />
            <circle cx="20" cy="26" r="9" />
          </g>
          <g fill="#ffdbe7">
            <circle cx="32" cy="22" r="6.5" />
            <circle cx="39" cy="28" r="6.5" />
            <circle cx="36" cy="36" r="6.5" />
            <circle cx="28" cy="36" r="6.5" />
            <circle cx="25" cy="28" r="6.5" />
          </g>
          <circle cx="32" cy="30" r="5" fill="#ffdf85" />
        </svg>
      );

    case 'six-years':
      // Golden-heart heritage rose (#c43662 + #ffcf70)
      return (
        <svg
          className="memory-flower-node__svg memory-flower-node__svg--six-years"
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="32" cy="32" r="28" fill="rgba(255, 207, 112, 0.24)" />
          <circle
            cx="32"
            cy="32"
            r="24"
            stroke="rgba(218, 152, 52, 0.55)"
            strokeWidth="1.2"
            strokeDasharray="3 3"
          />
          <path
            d="M32 12 C19 14, 13 26, 18 38 C23 47, 41 47, 46 38 C51 26, 45 14, 32 12 Z"
            fill="#c43662"
          />
          <path
            d="M32 17 C22 19, 18 28, 22 36 C26 43, 38 43, 42 36 C46 28, 42 19, 32 17 Z"
            fill="#df5683"
          />
          <path
            d="M32 22 C25 23, 23 29, 26 34 C29 38, 35 38, 38 34 C41 29, 39 23, 32 22 Z"
            fill="#f79bb8"
          />
          <circle cx="32" cy="30" r="6" fill="#ffcf70" />
          <circle cx="32" cy="30" r="3" fill="#fff6d6" />
        </svg>
      );

    case 'wishes':
      // 6-petal golden star blossom (#f6c358)
      return (
        <svg
          className="memory-flower-node__svg"
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="32" cy="32" r="26" fill="rgba(246, 195, 88, 0.18)" />
          <g fill="#f6c358">
            <ellipse cx="32" cy="17" rx="5.5" ry="9.5" />
            <ellipse cx="32" cy="47" rx="5.5" ry="9.5" />
            <ellipse
              cx="19"
              cy="24.5"
              rx="5.5"
              ry="9.5"
              transform="rotate(-60 19 24.5)"
            />
            <ellipse
              cx="45"
              cy="39.5"
              rx="5.5"
              ry="9.5"
              transform="rotate(-60 45 39.5)"
            />
            <ellipse
              cx="45"
              cy="24.5"
              rx="5.5"
              ry="9.5"
              transform="rotate(60 45 24.5)"
            />
            <ellipse
              cx="19"
              cy="39.5"
              rx="5.5"
              ry="9.5"
              transform="rotate(60 19 39.5)"
            />
          </g>
          <circle cx="32" cy="32" r="7.5" fill="#fff3d1" />
          <circle cx="32" cy="32" r="4" fill="#e08b3e" />
        </svg>
      );

    case 'one-more-thing':
      // Velvet damask bouquet (#d95882)
      return (
        <svg
          className="memory-flower-node__svg"
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="32" cy="32" r="26" fill="rgba(217, 88, 130, 0.16)" />
          <path
            d="M27 38 L32 52 L37 38"
            stroke="#5b8256"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="24" cy="28" r="9.5" fill="#e67399" />
          <circle cx="40" cy="28" r="9.5" fill="#e67399" />
          <circle cx="32" cy="22" r="10.5" fill="#d95882" />
          <circle cx="24" cy="28" r="3.5" fill="#ffea9f" />
          <circle cx="40" cy="28" r="3.5" fill="#ffea9f" />
          <circle cx="32" cy="22" r="4.2" fill="#ffdf80" />
        </svg>
      );
  }
}

export function MemoryFlowersScene() {
  const [activeMemoryId, setActiveMemoryId] = useState<MemoryFlowerId | null>(
    gardenState.activeMemoryId,
  );
  const [discoveredIds, setDiscoveredIds] = useState<readonly MemoryFlowerId[]>(
    gardenState.discoveredMemoryIds,
  );

  useEffect(() => {
    setActiveMemoryId(gardenState.activeMemoryId);
    setDiscoveredIds([...gardenState.discoveredMemoryIds]);
    return subscribeMemoryState((snapshot) => {
      setActiveMemoryId(snapshot.activeMemoryId);
      setDiscoveredIds(snapshot.discoveredMemoryIds);
    });
  }, []);

  useEffect(() => {
    if (!activeMemoryId) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMemoryFlower();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeMemoryId]);

  const activeIndex = activeMemoryId
    ? memoryFlowers.findIndex((item) => item.id === activeMemoryId)
    : -1;
  const activeFlower: MemoryFlower | null =
    activeIndex >= 0 ? memoryFlowers[activeIndex] : null;
  const allDiscovered = discoveredIds.length === memoryFlowers.length;

  function handleSelectFlower(
    event: MouseEvent<HTMLButtonElement>,
    flowerId: MemoryFlowerId,
  ) {
    event.stopPropagation();
    openMemoryFlower(flowerId);
  }

  function handleStepFlower(delta: number) {
    if (activeIndex < 0) return;
    const nextIndex =
      (activeIndex + delta + memoryFlowers.length) % memoryFlowers.length;
    openMemoryFlower(memoryFlowers[nextIndex].id);
  }

  return (
    <SceneShell
      id="memories"
      eyebrow={copy.memories.eyebrow}
      className="scene--memories"
    >
      <div className="memories-layout">
        <header className="memories-header" data-memories-intro="header">
          <h2 className="scene__heading scene__heading--memories">
            {copy.memories.title}
          </h2>
          <p className="scene__copy">{copy.memories.message}</p>

          <div className="memory-discovery-pill" aria-live="polite">
            <span className="memory-discovery-pill__label">
              {`Đã khám phá ${discoveredIds.length}/5 bông hoa`}
            </span>
            <span className="memory-discovery-pill__dots" aria-hidden="true">
              {memoryFlowers.map((flower) => {
                const isDiscovered = discoveredIds.includes(flower.id);
                return (
                  <span
                    key={flower.id}
                    className={`memory-discovery-pill__dot ${
                      isDiscovered ? 'memory-discovery-pill__dot--lit' : ''
                    }`.trim()}
                  />
                );
              })}
            </span>
          </div>

          {allDiscovered ? (
            <p className="memory-complete-banner" role="status">
              <IconSparkleCheck size={17} />
              <span>
                Đã mở trọn vẹn 5 điều anh gửi gắm ✨ Cùng ngắm hoàng hôn phía dưới nhé
              </span>
            </p>
          ) : null}
        </header>

        <div
          className="memory-constellation"
          data-memories-intro="constellation"
          role="group"
          aria-label="5 bông hoa kỷ niệm trong khu vườn"
        >
          {memoryFlowers.map((flower, index) => {
            const isDiscovered = discoveredIds.includes(flower.id);
            const isActive = activeMemoryId === flower.id;
            const isSixYears = flower.id === 'six-years';
            const slotNumber = index + 1;

            return (
              <button
                key={flower.id}
                type="button"
                className={[
                  'memory-flower-node',
                  `memory-flower-node--slot-${slotNumber}`,
                  isSixYears ? 'memory-flower-node--six-years' : '',
                  isActive ? 'memory-flower-node--active' : '',
                  isDiscovered ? 'memory-flower-node--discovered' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                data-memory-flower={flower.id}
                data-discovered={isDiscovered ? 'true' : 'false'}
                data-active={isActive ? 'true' : 'false'}
                aria-expanded={isActive}
                aria-controls="memory-letter-sheet"
                onClick={(event) => handleSelectFlower(event, flower.id)}
              >
                <span className="memory-flower-node__blossom">
                  <span
                    className="memory-flower-node__halo"
                    aria-hidden="true"
                  />
                  <SignatureBlossomIcon id={flower.id} />
                  {isSixYears ? (
                    <span className="memory-flower-node__crest">6 Years</span>
                  ) : null}
                </span>

                <span className="memory-flower-node__meta">
                  <span className="memory-flower-node__index">
                    {`0${slotNumber} · ${flower.emoji}`}
                  </span>
                  <span className="memory-flower-node__label">
                    {flower.label}
                  </span>
                  <span className="memory-flower-node__status">
                    {isDiscovered ? 'Đã mở ✨' : 'Chạm để mở'}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <details
          className="memory-accessible-drawer"
          data-memories-intro="drawer"
        >
          <summary className="memory-accessible-drawer__summary">
            Đọc toàn bộ 5 lời nhắn trên trang (dành cho chế độ đơn giản)
          </summary>
          <div className="memory-accessible-list">
            {memoryFlowers.map((flower, i) => {
              const isOpen = activeMemoryId === flower.id;
              return (
                <article
                  key={flower.id}
                  className={`memory-card ${isOpen ? 'memory-card--open' : ''}`.trim()}
                >
                  <div className="memory-card__header">
                    <span className="memory-card__emoji" aria-hidden="true">
                      {flower.emoji}
                    </span>
                    <div className="memory-card__labels">
                      <h3 className="memory-card__title">{flower.label}</h3>
                      <span className="memory-card__overline">
                        {`0${i + 1} · ${flower.englishLabel}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="memory-card__open-btn"
                      onClick={(event) => handleSelectFlower(event, flower.id)}
                    >
                      Xem hoa
                    </button>
                  </div>
                  <div className="memory-card__panel">
                    <p>{flower.message}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </details>

        <div className="memories-footer">
          <a className="scene__next-link" href="#wish">
            <span>Gửi điều ước 20/10 cho bé iu</span>
            <IconNextChapter size={17} />
          </a>
        </div>
      </div>

      {activeFlower ? (
        <div className="memory-sheet-layer">
          <div
            className="memory-sheet-backdrop"
            aria-hidden="true"
            onClick={() => closeMemoryFlower()}
          />
          <aside
            id="memory-letter-sheet"
            role="dialog"
            aria-modal="false"
            aria-labelledby="memory-sheet-title"
            className={`memory-letter-sheet ${
              activeFlower.id === 'six-years'
                ? 'memory-letter-sheet--six-years'
                : ''
            }`.trim()}
            data-memory-sheet={activeFlower.id}
          >
            <div className="memory-letter-sheet__handle" aria-hidden="true" />

            <div
              key={activeFlower.id}
              className="memory-letter-sheet__body"
            >
              <h3
                id="memory-sheet-title"
                className="memory-letter-sheet__title"
              >
                <span>{activeFlower.emoji}</span>{' '}
                <span>{activeFlower.label}</span>
              </h3>
              <p className="memory-letter-sheet__overline">
                {`0${activeIndex + 1} · ${activeFlower.englishLabel}`}
              </p>

              {activeFlower.id === 'six-years' ? (
                <div className="memory-keepsake-header">
                  <div className="memory-keepsake-badge">
                    <span className="memory-keepsake-badge__crest">
                      6 Years Together
                    </span>
                    <span className="memory-keepsake-badge__sub">
                      2020 – 2026 · Sáu năm bên bé iu
                    </span>
                  </div>
                  <div className="memory-keepsake-divider" aria-hidden="true">
                    <span className="memory-keepsake-divider__line" />
                    <span className="memory-keepsake-divider__gem">✦</span>
                    <span className="memory-keepsake-divider__line" />
                  </div>
                </div>
              ) : null}

              <p className="memory-letter-sheet__message">
                {activeFlower.message}
              </p>
            </div>

            <div className="memory-letter-sheet__actions">
              <div className="memory-letter-sheet__nav">
                <button
                  type="button"
                  className="memory-letter-sheet__nav-btn"
                  onClick={() => handleStepFlower(-1)}
                >
                  <IconPrevArrow size={16} />
                  <span>Bông trước</span>
                </button>
                <button
                  type="button"
                  className="memory-letter-sheet__nav-btn"
                  onClick={() => handleStepFlower(1)}
                >
                  <span>Bông tiếp</span>
                  <IconNextArrow size={16} />
                </button>
              </div>
              <button
                type="button"
                className="memory-letter-sheet__close-btn"
                onClick={() => closeMemoryFlower()}
              >
                <IconClose size={16} />
                <span>Đóng lại · Trở về khu vườn</span>
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </SceneShell>
  );
}
