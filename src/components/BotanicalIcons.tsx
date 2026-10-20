import type { SVGProps } from 'react';

export type BotanicalIconProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

function baseProps(size = 18, props?: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    'aria-hidden': 'true',
    ...props,
  };
}

export function IconFlower({ size = 18, ...props }: BotanicalIconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <circle cx="12" cy="7.2" r="3.2" fill="currentColor" opacity="0.28" />
      <circle cx="16.5" cy="10.5" r="3.2" fill="currentColor" opacity="0.28" />
      <circle cx="14.8" cy="15.8" r="3.2" fill="currentColor" opacity="0.28" />
      <circle cx="9.2" cy="15.8" r="3.2" fill="currentColor" opacity="0.28" />
      <circle cx="7.5" cy="10.5" r="3.2" fill="currentColor" opacity="0.28" />
      <path
        d="M12 4.5a3 3 0 0 1 2.7 1.7 3 3 0 0 1 3.1 4.4 3 3 0 0 1-1.2 4.9 3 3 0 0 1-4.6 1.5 3 3 0 0 1-4.6-1.5 3 3 0 0 1-1.2-4.9 3 3 0 0 1 3.1-4.4A3 3 0 0 1 12 4.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11.5" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function IconHeart({ size = 18, ...props }: BotanicalIconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path
        d="M12 20.2s-7-4.35-8.5-8.65C2.3 8.1 4.7 4.8 8.1 4.8c2 0 3.2 1.1 3.9 2.2.7-1.1 1.9-2.2 3.9-2.2 3.4 0 5.8 3.3 4.6 6.75-1.5 4.3-8.5 8.65-8.5 8.65Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconMusicOn({ size = 18, ...props }: BotanicalIconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path
        d="M9 17.5V6.8l9-2v10.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.8" cy="17.5" r="2.3" fill="currentColor" />
      <circle cx="15.8" cy="15.5" r="2.3" fill="currentColor" />
      <path
        d="M20.5 7.2c.9.9.9 2.5 0 3.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMusicOff({ size = 18, ...props }: BotanicalIconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path
        d="M9 17.5V6.8l9-2v6.7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="6.8" cy="17.5" r="2.3" fill="currentColor" opacity="0.65" />
      <circle cx="15.8" cy="15.5" r="2.3" fill="currentColor" opacity="0.65" />
      <path
        d="M4.5 4.5l15 15"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconScrollDown({ size = 18, ...props }: BotanicalIconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path
        d="M12 5v14m0 0-5-5m5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconClose({ size = 18, ...props }: BotanicalIconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path
        d="M7 7l10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconReplay({ size = 18, ...props }: BotanicalIconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path
        d="M4.8 11a7.2 7.2 0 1 1 2.1 5.1M4.8 11V6.5m0 4.5h4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconSparkleCheck({ size = 18, ...props }: BotanicalIconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path
        d="M12 3.5 13.7 8l4.5 1.7-4.5 1.7-1.7 4.5-1.7-4.5-4.5-1.7L10.3 8 12 3.5Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m9.6 10.2 1.7 1.7 3.3-3.4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconNextChapter({ size = 18, ...props }: BotanicalIconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path
        d="M12 4.5v14m0 0-4.5-4.5M12 18.5l4.5-4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPrevArrow({ size = 18, ...props }: BotanicalIconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path
        d="M18.5 12h-13m0 0 4.5-4.5M5.5 12l4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconNextArrow({ size = 18, ...props }: BotanicalIconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path
        d="M5.5 12h13m0 0-4.5-4.5M18.5 12 14 16.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

