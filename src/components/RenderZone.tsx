import { Moment } from 'moment-timezone';
import React from 'react';
import { ClockOptions, ClockStyle, ZoneFormat } from '../types';
import { getMoment } from '../utils';
import { DigitalTime } from './digital/DigitalTime';
import { getHeights } from './digital/utils';
import { useClockStyles } from 'hooks/useClockStyles';

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
  const styles = useClockStyles(options);
  const { timezoneSettings } = options;
  const { zoneFormat } = timezoneSettings;

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
    <h4 className={styles.zone} data-testid="time-zone">
      {zone}
      {zoneFormat === ZoneFormat.nameOffset && (
        <>
          <br />({now.format('Z z')})
        </>
      )}
    </h4>
  );
}
