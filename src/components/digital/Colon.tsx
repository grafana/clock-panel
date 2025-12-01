import React from 'react';

interface ColonProps {
  char: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
  filter: string;
  x?: number;
}

export function Colon({ char, fill, filter, stroke, strokeWidth, x = 0 }: ColonProps) {
  if (char !== ':') {
    return null;
  }

  const transform = `translate(${x}, 0)`;

  return (
    <>
      <path
        d="M 73.5,47.317565 L 89,55.991045 L 89,76.508955 L 73.5,85.182435 L 58,76.508955 L 58,55.991045 L 73.5,47.317565 z "
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
        filter={filter}
        transform={transform}
      />
      <path
        d="M 73.5,129.375003 L 89,138.048483 L 89,158.566393 L 73.5,167.239873 L 58,158.566393 L 58,138.048483 L 73.5,129.375003 z "
        stroke={stroke}
        strokeWidth={strokeWidth}
        fill={fill}
        filter={filter}
        transform={transform}
      />
    </>
  );
}
