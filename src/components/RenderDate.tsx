import { css } from '@emotion/css';
import { Moment } from 'moment-timezone';
import React, { useMemo } from 'react';
import { ClockOptions, ClockStyle } from '../types';
import { useTheme2 } from '@grafana/ui';
import { DigitalTime } from './digital/DigitalTime';
import { getHeights } from './digital/utils';

export function RenderDate({
  options,
  now,
  width,
  height,
}: {
  options: ClockOptions;
  now: Moment;
  width: number;
  height: number;
}) {
  const theme = useTheme2();
  const fill =
    options.style === ClockStyle.digital && options.digitalSettings?.fillColor
      ? theme.visualization.getColorByName(options.digitalSettings.fillColor)
      : '';

  const { dateSettings } = options;

  const className = useMemo(() => {
    return css`
      font-size: ${dateSettings.fontSize};
      font-weight: ${dateSettings.fontWeight};
      font-family: ${options.fontMono ? 'monospace' : ''};
      margin: 0;
      color: ${fill};
    `;
  }, [dateSettings.fontSize, dateSettings.fontWeight, options.fontMono, fill]);

  const display = now.locale(dateSettings.locale || '').format(dateSettings.dateFormat);

  if (options.style === ClockStyle.digital) {
    return <DigitalTime width={width} height={getHeights(height, options).date} options={options} text={display} />;
  }

  return (
    <span>
      <h3 className={className}>{display}</h3>
    </span>
  );
}
