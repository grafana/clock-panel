import { getTemplateSrv } from '@grafana/runtime';
import moment, { Moment } from 'moment-timezone';

export function getTimeZoneNames(): string[] {
  return (moment as any).tz.names();
}

export function getMoment(tz?: string): Moment {
  if (!tz) {
    tz = (moment as any).tz.guess();
  } else {
    tz = getTemplateSrv().replace(tz);
  }
  return (moment() as any).tz(tz);
}
