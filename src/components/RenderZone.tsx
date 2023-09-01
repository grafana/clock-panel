import { css } from '@emotion/css';
import { Moment } from 'moment-timezone';
import React from 'react';
import { ClockOptions, ZoneFormat } from 'types';
import { getMoment } from 'utils';

export function RenderZone({ options, now }: { options: ClockOptions; now: Moment }) {
  const { timezoneSettings } = options;
  const { zoneFormat } = timezoneSettings;

  const className = css`
    font-size: ${timezoneSettings.fontSize};
    font-weight: ${timezoneSettings.fontWeight};
    line-height: 1.4;
    margin: 0;
  `;

  let zone = options.timezone || '';

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
    <h4 className={className}>
      {zone}
      {zoneFormat === ZoneFormat.nameOffset && (
        <>
          <br />({now.format('Z z')})
        </>
      )}
    </h4>
  );
}
