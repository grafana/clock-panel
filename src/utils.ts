import { getTemplateSrv } from '@grafana/runtime';
import moment, { Moment } from 'moment-timezone';
import { ClockMode, ClockOptions, ClockSource, DescriptionSource } from './types';

export const findGrafanaDataSource = (datasources: Record<string, any>) => {
  for (const key of Object.keys(datasources || {})) {
    const ds = datasources[key];
    if (ds.uid === 'grafana' || (ds.name === '-- Grafana --' && ds.type === 'datasource')) {
      return ds;
    }
  }
  return undefined;
};

// Only the source that matches the active mode is actually consumed by CalculateClockOptions.
// A stale source='query' on an inactive mode must not cause the panel to be treated as query-driven.
export const isQueryDrivenOptions = (options: Partial<ClockOptions>): boolean => {
  if (options.descriptionSettings?.source === DescriptionSource.query) {
    return true;
  }
  if (options.mode === ClockMode.time) {
    // time mode never consumes countdown/countup sources — skip those checks
  } else if (options.mode === ClockMode.countdown) {
    const src = options.countdownSettings?.source;
    if (src && src !== ClockSource.input) {
      return true;
    }
  } else if (options.mode === ClockMode.countup) {
    const src = options.countupSettings?.source;
    if (src && src !== ClockSource.input) {
      return true;
    }
  } else {
    // mode absent (old config / unknown): check both sources conservatively
    if (options.countdownSettings?.source && options.countdownSettings.source !== ClockSource.input) {
      return true;
    }
    if (options.countupSettings?.source && options.countupSettings.source !== ClockSource.input) {
      return true;
    }
  }
  return false;
};

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
