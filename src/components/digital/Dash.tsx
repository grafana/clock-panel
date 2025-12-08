import React from 'react';

interface DashProps {
  char: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
  filter: string;
  x?: number;
}

export function Dash({ char, fill, filter, stroke, strokeWidth, x = 0 }: DashProps) {
  const transform = `translate(${x}, 0)`;

  return (
    <path
      d="M 118.29731,107 L 103.08534,122.5 L 44.08535,122.5 L 28.56756,107 L 44.08535,91.5 L 103.08534,91.5 L 118.29731,107 z "
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill={fill}
      filter={filter}
      transform={transform}
    />
  );
}
