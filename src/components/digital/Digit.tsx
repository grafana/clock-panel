import React from 'react';

type Placement = 'bottom' | 'bottom-left' | 'bottom-right' | 'middle' | 'top' | 'top-left' | 'top-right';

const paths: Record<Placement, string> = {
  top: `M 118.29731,25.5 L 103.08534,41 L 44.08535,41 L 28.56756,25.5 L 44.08535,10 L 103.08534,10 L 118.29731,25.5 z `,
  'top-right': `M 121.5,28.38513 L 137,43.59709 L 137,88.59708 L 121.5,104.11487 L 106,88.59708 L 106,43.59709 L 121.5,28.38513 z `,
  'bottom-right': `M 121.5,110.44257 L 137,125.65453 L 137,170.65452 L 121.5,186.1723 L 106,170.65452 L 106,125.65453 L 121.5,110.44257 z `,
  bottom: `M 118.29731,189.05743 L 103.08534,204.55743 L 44.08535,204.55743 L 28.56756,189.05743 L 44.08535,173.55743 L 103.08534,173.55743 L 118.29731,189.05743 z `,
  'bottom-left': `M 25.5,110.44257 L 41,125.65453 L 41,170.65452 L 25.5,186.1723 L 10,170.65452 L 10,125.65453 L 25.5,110.44257 z `,
  'top-left': `M 25.5,28.38513 L 41,43.59709 L 41,88.59708 L 25.5,104.11487 L 10,88.59708 L 10,43.59709 L 25.5,28.38513 z `,
  middle: `M 118.29731,107 L 103.08534,122.5 L 44.08535,122.5 L 28.56756,107 L 44.08535,91.5 L 103.08534,91.5 L 118.29731,107 z `,
};

const digits: Record<number, string[]> = {
  0: [paths.bottom, paths['bottom-left'], paths['bottom-right'], paths.top, paths['top-left'], paths['top-right']],
  1: [paths['bottom-right'], paths['top-right']],
  2: [paths.bottom, paths['bottom-left'], paths.middle, paths.top, paths['top-right']],
  3: [paths.bottom, paths['bottom-right'], paths.middle, paths.top, paths['top-right']],
  4: [paths['bottom-right'], paths.middle, paths['top-right'], paths['top-left']],
  5: [paths.bottom, paths['bottom-right'], paths.middle, paths.top, paths['top-left']],
  6: [paths.bottom, paths['bottom-left'], paths['bottom-right'], paths.middle, paths.top, paths['top-left']],
  7: [paths['bottom-right'], paths.top, paths['top-right']],
  8: [
    paths.bottom,
    paths['bottom-left'],
    paths['bottom-right'],
    paths.middle,
    paths.top,
    paths['top-left'],
    paths['top-right'],
  ],
  9: [paths['bottom'], paths['bottom-right'], paths.middle, paths.top, paths['top-left'], paths['top-right']],
};

interface DigitProps {
  fragmentKey: string;
  char: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
  filter: string;
  x?: number;
}

export function Digit({ fragmentKey, char, fill, filter, stroke, strokeWidth, x = 0 }: DigitProps) {
  const digit = parseInt(char, 10);

  if (!digits[digit]) {
    return null;
  }

  const transform = `translate(${x}, 0)`;

  return (
    <>
      {digits[digit].map((d, index) => (
        <path
          key={`${fragmentKey}-${index}-digit`}
          d={d}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill={fill}
          filter={filter}
          transform={transform}
        />
      ))}
    </>
  );
}
