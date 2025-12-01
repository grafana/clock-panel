import { css } from '@emotion/css';
import { Moment } from 'moment-timezone';
import React, { useMemo } from 'react';
import { ClockOptions, ClockStyle, ZoneFormat } from '../types';
import { getMoment } from '../utils';
import { useTheme2 } from '@grafana/ui';
import { DigitalTime } from './digital/DigitalTime';
import { getHeights } from './digital/utils';

export function RenderZone({
  options,
  now,
  timezone,
  width,
  height,
}: {
  options: ClockOptions;
  now: Moment;
  timezone: string;
  width: number;
  height: number;
}) {
  const { timezoneSettings } = options;
  const { zoneFormat } = timezoneSettings;

  const theme = useTheme2();
  const fill =
    options.style === ClockStyle.digital && options.digitalSettings?.fillColor
      ? theme.visualization.getColorByName(options.digitalSettings.fillColor)
      : '';
  const className = useMemo(() => {
    return css`
      font-size: ${timezoneSettings.fontSize};
      font-weight: ${timezoneSettings.fontWeight};
      font-family: ${options.fontMono ? 'monospace' : ''};
      line-height: 1.4;
      margin: 0;
      color: ${fill};
    `;
  }, [options.fontMono, timezoneSettings.fontSize, timezoneSettings.fontWeight, fill]);

  let zone = timezone;

  switch (zoneFormat) {
    case ZoneFormat.offsetAbbv:
      zone = now.format('Z z');
      break;
    case ZoneFormat.offset:
      zone = now.format('Z');
      break;
    case ZoneFormat.abbv:
      zone = now.format('z');
      break;
    default:
      try {
        zone = (getMoment(zone) as any)._z.name;
      } catch (e) {
        console.error('Error getting timezone', e);
      }
  }

  if (options.style === ClockStyle.digital) {
    const text = zoneFormat === ZoneFormat.nameOffset ? `${zone}\n${now.format('Z z')}` : zone;
    return <DigitalTime width={width} height={getHeights(height, options).zone} options={options} text={text} />;
  }

  return (
    <h4 className={className} data-testid="time-zone">
      {zone}
      {zoneFormat === ZoneFormat.nameOffset && (
        <>
          <br />({now.format('Z z')})
        </>
      )}
    </h4>
  );
}
