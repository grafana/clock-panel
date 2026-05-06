import { findGrafanaDataSource, isQueryDrivenOptions } from './utils';
import { ClockMode, ClockOptions, ClockSource, DescriptionSource } from './types';

describe('findGrafanaDataSource', () => {
  it('finds datasource by uid', () => {
    const datasources = {
      grafana: { uid: 'grafana', type: 'datasource', name: '-- Grafana --' },
    };
    expect(findGrafanaDataSource(datasources)).toBe(datasources.grafana);
  });

  it('finds datasource by name and type when uid differs', () => {
    const datasources = {
      special: { uid: 'other-uid', type: 'datasource', name: '-- Grafana --' },
    };
    expect(findGrafanaDataSource(datasources)).toBe(datasources.special);
  });

  it('returns undefined when no Grafana datasource is present', () => {
    expect(findGrafanaDataSource({ influxdb: { uid: 'abc', type: 'influxdb', name: 'InfluxDB' } })).toBeUndefined();
  });

  it('returns undefined for empty datasources', () => {
    expect(findGrafanaDataSource({})).toBeUndefined();
  });
});

describe('isQueryDrivenOptions', () => {
  it('returns false for empty options', () => {
    expect(isQueryDrivenOptions({})).toBe(false);
  });

  it('returns true when descriptionSettings.source=query (any mode)', () => {
    expect(
      isQueryDrivenOptions({
        mode: ClockMode.time,
        descriptionSettings: { source: DescriptionSource.query } as any,
      })
    ).toBe(true);
  });

  describe('mode=time', () => {
    it.each<[string, ClockSource, ClockSource, boolean]>([
      ['all input',            ClockSource.input, ClockSource.input, false],
      ['stale countdown.query',ClockSource.query, ClockSource.input, false],
      ['stale countup.query',  ClockSource.input, ClockSource.query, false],
      ['both query',           ClockSource.query, ClockSource.query, false],
    ])('%s', (_, cdSrc, cuSrc, expected) => {
      expect(
        isQueryDrivenOptions({
          mode: ClockMode.time,
          countdownSettings: { source: cdSrc } as any,
          countupSettings: { source: cuSrc } as any,
        })
      ).toBe(expected);
    });
  });

  describe('mode=countdown', () => {
    it.each<[string, ClockSource, ClockSource, boolean]>([
      ['countdown.input, countup.input', ClockSource.input, ClockSource.input, false],
      ['countdown.query (active)',       ClockSource.query, ClockSource.input, true ],
      ['stale countup.query',            ClockSource.input, ClockSource.query, false],
    ])('%s', (_, cdSrc, cuSrc, expected) => {
      expect(
        isQueryDrivenOptions({
          mode: ClockMode.countdown,
          countdownSettings: { source: cdSrc } as any,
          countupSettings: { source: cuSrc } as any,
        })
      ).toBe(expected);
    });
  });

  describe('mode=countup', () => {
    it.each<[string, ClockSource, ClockSource, boolean]>([
      ['countup.input, countdown.input', ClockSource.input, ClockSource.input, false],
      ['countup.query (active)',         ClockSource.input, ClockSource.query, true ],
      ['stale countdown.query',          ClockSource.query, ClockSource.input, false],
    ])('%s', (_, cdSrc, cuSrc, expected) => {
      expect(
        isQueryDrivenOptions({
          mode: ClockMode.countup,
          countdownSettings: { source: cdSrc } as any,
          countupSettings: { source: cuSrc } as any,
        })
      ).toBe(expected);
    });
  });

  describe('mode absent (old config)', () => {
    it.each<[string, ClockSource | undefined, ClockSource | undefined, boolean]>([
      ['no sources set',       undefined,         undefined,         false],
      ['countdown.query',      ClockSource.query,  ClockSource.input, true ],
      ['countup.query',        ClockSource.input,  ClockSource.query, true ],
      ['both query',           ClockSource.query,  ClockSource.query, true ],
      ['both input',           ClockSource.input,  ClockSource.input, false],
    ])('%s', (_, cdSrc, cuSrc, expected) => {
      const options: Partial<ClockOptions> = {};
      if (cdSrc !== undefined) {
        options.countdownSettings = { source: cdSrc } as any;
      }
      if (cuSrc !== undefined) {
        options.countupSettings = { source: cuSrc } as any;
      }
      expect(isQueryDrivenOptions(options)).toBe(expected);
    });
  });
});
