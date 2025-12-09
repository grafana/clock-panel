import { Moment } from 'moment-timezone';
import React from 'react';
import { ClockOptions, ClockStyle } from '../types';
import { DigitalTime } from './digital/DigitalTime';
import { getHeights } from './digital/utils';
import { useClockStyles } from 'hooks/useClockStyles';

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
  const { date } = useClockStyles(options);
  const { dateSettings } = options;

  const display = now.locale(dateSettings.locale || '').format(dateSettings.dateFormat);

  if (options.style === ClockStyle.digital) {
    return <DigitalTime width={width} height={getHeights(height, options).date} options={options} text={display} />;
  }

  return (
    <span>
      <h3 className={date}>{display}</h3>
    </span>
  );
}
