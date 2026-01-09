import { useTheme2 } from '@grafana/ui';
import React, { useId } from 'react';
import { ClockOptions } from 'types';
import { Digit } from './Digit';
import { Colon } from './Colon';
import { Text } from './Text';
import {
  DEFAULT_FILL_COLOR,
  DEFAULT_STROKE_COLOR,
  SVG_DIGITIZED,
  SVG_VIEW_BOX_HEIGHT,
  SVG_VIEW_BOX_WIDTH,
} from '../../constants';
import { Dash } from './Dash';
import { getFragmentKey, getWidth } from './utils';

interface RenderDigitalTimeProps {
  text: string;
  width: number;
  height: number;
  options: ClockOptions;
}

export function DigitalTime({ text, width: panelWidth, height: panelHeight, options }: RenderDigitalTimeProps) {
  const key = useId();
  const theme = useTheme2();
  const { digitalSettings } = options;

  const chars = Array.from(text.trim());
  const totalViewBoxWidth = chars.reduce((acc, curr, index) => {
    acc += getWidth(curr, chars[index - 1]);
    return acc;
  }, 0);

  const fill = digitalSettings?.fillColor
    ? theme.visualization.getColorByName(digitalSettings.fillColor)
    : DEFAULT_FILL_COLOR;
  const stroke = digitalSettings?.strokeColor
    ? theme.visualization.getColorByName(digitalSettings.strokeColor)
    : DEFAULT_STROKE_COLOR;
  const strokeValue = isNaN(Number(digitalSettings?.strokeWidth)) ? 0 : digitalSettings!.strokeWidth;
  const strokeWidth = strokeValue!;
  const glowValue = isNaN(Number(digitalSettings?.glowSize)) ? 0 : digitalSettings!.glowSize;
  const glow = glowValue;
  const padding = 10;
  const width = panelWidth - 4 * padding;
  const filterId = `glow-${key}`;
  let x = -SVG_VIEW_BOX_WIDTH;

  if (panelHeight <= 10) {
    return null;
  }

  return (
    <svg
      width={width}
      height={panelHeight}
      viewBox={`-10 -10 ${totalViewBoxWidth} ${SVG_VIEW_BOX_HEIGHT}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id={filterId} filterUnits="userSpaceOnUse">
          <feGaussianBlur stdDeviation={glow} />
          <feComponentTransfer>
            <feFuncA type="linear" slope="1" />
          </feComponentTransfer>
          <feBlend in2="SourceGraphic" />
        </filter>
      </defs>
      {chars.map((char, charIndex) => {
        x += getWidth(char, chars[charIndex - 1]);
        const digit = parseInt(char, 10);
        const isDigit = !isNaN(digit);
        const fragmentKey = getFragmentKey(key, char, charIndex);

        return (
          <React.Fragment key={fragmentKey}>
            {isDigit && (
              <Digit
                x={x}
                char={char}
                fill={fill}
                filter={`url(#${filterId})`}
                fragmentKey={fragmentKey}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
            )}
            {char === ':' && (
              <Colon
                x={x}
                char={char}
                fill={fill}
                filter={`url(#${filterId})`}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
            )}
            {char === '-' && (
              <Dash
                x={x}
                char={char}
                fill={fill}
                filter={`url(#${filterId})`}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
            )}
            {!SVG_DIGITIZED.includes(char) && (
              <Text
                x={x}
                char={char}
                fill={fill}
                filter={`url(#${filterId})`}
                stroke={stroke}
                strokeWidth={strokeWidth}
              />
            )}
          </React.Fragment>
        );
      })}
    </svg>
  );
}
