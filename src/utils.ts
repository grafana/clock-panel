import { getTemplateSrv } from '@grafana/runtime';
import moment, { Moment } from 'moment-timezone';
import { ClockMode, ClockOptions, ClockSource, DescriptionSource } from './types';

export const findGrafanaDataSource = (datasources: Record<string, any>) => {
  for (const ds of Object.values(datasources || {})) {
    if (ds.uid === 'grafana' || (ds.name === '-- Grafana --' && ds.type === 'datasource')) {
      return ds;
    }
  }
  return undefined;
};

// ClockSource is a two-value enum; absent/input both mean no query needed
const isQuerySource = (src: ClockSource | undefined) => src === ClockSource.query;

// Only the source that matches the active mode is actually consumed by CalculateClockOptions.
// A stale source='query' on an inactive mode must not cause the panel to be treated as query-driven.
export const isQueryDrivenOptions = (options: Partial<ClockOptions>): boolean => {
  if (options.descriptionSettings?.source === DescriptionSource.query) {
    return true;
  }
  if (options.mode === ClockMode.time) {
    // time mode has no configurable source field — nothing to check
  } else if (options.mode === ClockMode.countdown) {
    if (isQuerySource(options.countdownSettings?.source)) {
      return true;
    }
  } else if (options.mode === ClockMode.countup) {
    if (isQuerySource(options.countupSettings?.source)) {
      return true;
    }
  } else {
    // mode absent (old config / unknown): check both sources conservatively
    if (isQuerySource(options.countdownSettings?.source) || isQuerySource(options.countupSettings?.source)) {
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
