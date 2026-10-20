import { useId, type CSSProperties } from 'react';

export type FlowerArtProps = {
  size?: 'large' | 'small';
  animate?: boolean;
  className?: string;
  variant?: 'bud' | 'bloom';
  stage?: 'bud' | 'blooming' | 'bloomed';
};

/**
 * Dependency-free artisanal 2D botanical rose fallback.
 * Renders sculpted concentric SVG petals, calyx sepals, golden stamen heart,
 * and a delicate curved stem when WebGL is disabled (`data-quality="static"`),
 * while remaining compatible with all existing scene usages.
 */
export function FlowerArt({
  size = 'large',
  animate = true,
  className = '',
  variant = 'bloom',
  stage,
}: FlowerArtProps) {
  const uid = useId().replace(/:/g, '');
  const resolvedStage = stage ?? (variant === 'bud' ? 'bud' : 'bloomed');
  const style = { '--petal-count': 8 } as CSSProperties;

  const outerGradientId = `rose-outer-${uid}`;
  const midGradientId = `rose-mid-${uid}`;
  const innerGradientId = `rose-inner-${uid}`;
  const coreGradientId = `rose-core-${uid}`;
  const stemGradientId = `rose-stem-${uid}`;

  return (
    <span
      className={`flower-art flower-art--${size} flower-art--${variant} ${
        animate ? 'flower-art--animated' : ''
      } ${className}`.trim()}
      data-stage={resolvedStage}
      aria-hidden="true"
      style={style}
    >
      <span className="flower-art__halo" />
      {Array.from({ length: 8 }, (_, i) => (
        <span
          key={i}
          className="flower-art__petal"
          style={
            {
              '--petal-index': i,
              '--petal-angle': `${i * 45}deg`,
            } as CSSProperties
          }
        />
      ))}

      <svg
        className="flower-art__svg"
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={outerGradientId} cx="50%" cy="28%" r="72%">
            <stop offset="0%" stopColor="#fff9fb" />
            <stop offset="52%" stopColor="#f6c4d4" />
            <stop offset="100%" stopColor="#de82a1" />
          </radialGradient>
          <radialGradient id={midGradientId} cx="50%" cy="24%" r="70%">
            <stop offset="0%" stopColor="#fff5f8" />
            <stop offset="48%" stopColor="#f2aec4" />
            <stop offset="100%" stopColor="#cf6a8c" />
          </radialGradient>
          <radialGradient id={innerGradientId} cx="48%" cy="30%" r="68%">
            <stop offset="0%" stopColor="#ffecef" />
            <stop offset="55%" stopColor="#e88aa8" />
            <stop offset="100%" stopColor="#b84e79" />
          </radialGradient>
          <radialGradient id={coreGradientId} cx="42%" cy="38%" r="58%">
            <stop offset="0%" stopColor="#fff5cc" />
            <stop offset="62%" stopColor="#f3c678" />
            <stop offset="100%" stopColor="#c97d60" />
          </radialGradient>
          <linearGradient id={stemGradientId} x1="100" y1="128" x2="100" y2="214" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6f9369" />
            <stop offset="100%" stopColor="#486b45" />
          </linearGradient>
        </defs>

        {/* Stem & paired botanical leaves */}
        <path
          className="flower-art__stem"
          d="M100 132 C99 158, 95 184, 101 212"
          stroke={`url(#${stemGradientId})`}
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <path
          className="flower-art__leaf flower-art__leaf--left"
          d="M97 166 C76 162, 62 149, 58 136 C74 137, 90 148, 98 162 Z"
          fill="#6d9067"
          opacity="0.88"
        />
        <path
          className="flower-art__leaf flower-art__leaf--right"
          d="M100 176 C121 171, 136 158, 141 144 C124 146, 108 156, 100 172 Z"
          fill="#5c7f57"
          opacity="0.85"
        />

        {/* Calyx sepals */}
        <path
          className="flower-art__calyx"
          d="M74 126 C84 136, 116 136, 126 126 C118 118, 82 118, 74 126 Z"
          fill="#62865d"
        />

        {/* Outer sculpted rose petals (unfurled in bloom, gathered in bud) */}
        <g className="flower-art__layer flower-art__layer--outer">
          <path
            d="M100 24 C64 28, 38 62, 54 98 C66 122, 134 122, 146 98 C162 62, 136 28, 100 24 Z"
            fill={`url(#${outerGradientId})`}
          />
          <path
            d="M52 68 C34 86, 46 122, 82 128 C96 130, 102 112, 88 94 C74 76, 62 60, 52 68 Z"
            fill={`url(#${outerGradientId})`}
            opacity="0.94"
          />
          <path
            d="M148 68 C166 86, 154 122, 118 128 C104 130, 98 112, 112 94 C126 76, 138 60, 148 68 Z"
            fill={`url(#${outerGradientId})`}
            opacity="0.94"
          />
        </g>

        {/* Mid whorled petals */}
        <g className="flower-art__layer flower-art__layer--mid">
          <path
            d="M100 36 C72 40, 56 68, 68 96 C78 116, 122 116, 132 96 C144 68, 128 40, 100 36 Z"
            fill={`url(#${midGradientId})`}
          />
          <path
            d="M68 62 C58 82, 70 112, 100 116 C118 112, 126 88, 112 70 C98 54, 76 48, 68 62 Z"
            fill={`url(#${midGradientId})`}
            opacity="0.92"
          />
        </g>

        {/* Inner spiral bud / heart */}
        <g className="flower-art__layer flower-art__layer--inner">
          <path
            d="M100 48 C80 50, 70 72, 78 92 C86 108, 114 108, 122 92 C130 72, 120 50, 100 48 Z"
            fill={`url(#${innerGradientId})`}
          />
          <path
            d="M84 74 C84 58, 116 58, 116 74 C116 92, 84 92, 84 74 Z"
            fill="#fff4f7"
            opacity="0.45"
          />
        </g>

        {/* Golden stamen heart */}
        <circle
          className="flower-art__stamen"
          cx="100"
          cy="78"
          r="11"
          fill={`url(#${coreGradientId})`}
        />
      </svg>

      <span className="flower-art__center" />
      <span className="flower-art__glint" />
    </span>
  );
}
