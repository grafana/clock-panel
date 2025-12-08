import React from 'react';
import { SVG_VIEW_BOX_HEIGHT, SVG_VIEW_BOX_WIDTH } from '../../constants';

interface TextProps {
  char: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
  filter: string;
  x?: number;
}

export function Text({ char, fill, filter, stroke, strokeWidth, x = 0 }: TextProps) {
  const fontSize = SVG_VIEW_BOX_HEIGHT * 0.85;

  return (
    <text
      x={x + SVG_VIEW_BOX_WIDTH / 2}
      y={SVG_VIEW_BOX_HEIGHT / 2 + 10}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={fontSize}
      fill={fill}
      filter={filter}
      stroke={stroke}
      strokeWidth={strokeWidth}
      xmlSpace="preserve"
    >
      {char}
    </text>
  );
}
