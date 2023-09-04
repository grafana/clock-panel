import { css } from '@emotion/css';
import { Moment } from 'moment-timezone';
import React, { useMemo } from 'react';
import { ClockOptions, ZoneFormat } from 'types';
import { getMoment } from 'utils';

export function RenderZone({ options, now, timezone }: { options: ClockOptions; now: Moment; timezone: string }) {
  const { timezoneSettings } = options;
  const { zoneFormat } = timezoneSettings;

  const className = useMemo(() => {
    return css`
      font-size: ${timezoneSettings.fontSize};
      font-weight: ${timezoneSettings.fontWeight};
      font-family: ${options.fontMono ? 'monospace' : ''};
      line-height: 1.4;
      margin: 0;
    `;
  }, [options.fontMono, timezoneSettings.fontSize, timezoneSettings.fontWeight]);

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
