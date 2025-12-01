import { css } from '@emotion/css';
import { useTheme2 } from '@grafana/ui';
import React, { useMemo } from 'react';
import { ClockOptions, ClockStyle } from 'types';
import { DigitalTime } from './digital/DigitalTime';
import { getHeights } from './digital/utils';

export function RenderDescription({
  options,
  descriptionText,
  width,
  height,
}: {
  options: ClockOptions;
  descriptionText: string;
  width: number;
  height: number;
}) {
  const { descriptionSettings } = options;
  const theme = useTheme2();
  const fill =
    options.style === ClockStyle.digital && options.digitalSettings?.fillColor
      ? theme.visualization.getColorByName(options.digitalSettings.fillColor)
      : '';

  const className = useMemo(() => {
    return css`
      font-size: ${descriptionSettings.fontSize};
      font-weight: ${descriptionSettings.fontWeight};
      font-family: ${options.fontMono ? 'monospace' : ''};
      margin: 0;
      color: ${fill};
    `;
  }, [descriptionSettings.fontSize, descriptionSettings.fontWeight, options.fontMono, fill]);

  if (options.style === ClockStyle.digital) {
    return (
      <DigitalTime
        width={width}
        height={getHeights(height, options).description}
        options={options}
        text={descriptionText}
      />
    );
  }

  return (
    <span>
      <h3 className={className}>{descriptionText}</h3>
    </span>
  );
}
