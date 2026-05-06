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

  it.each<[string, ClockMode, ClockSource, ClockSource, boolean]>([
    // description                              mode              countdownSource              countupSource              expected
    // mode=time: countdown/countup sources never consumed — always false
    ['mode=time,     all input',            ClockMode.time,     ClockSource.input, ClockSource.input, false],
    ['mode=time,     stale countdown.query',ClockMode.time,     ClockSource.query, ClockSource.input, false],
    ['mode=time,     stale countup.query',  ClockMode.time,     ClockSource.input, ClockSource.query, false],
    ['mode=time,     both query',           ClockMode.time,     ClockSource.query, ClockSource.query, false],
    // mode=countdown: only countdownSettings.source is active
    ['mode=countdown both input',           ClockMode.countdown,ClockSource.input, ClockSource.input, false],
    ['mode=countdown active countdown',     ClockMode.countdown,ClockSource.query, ClockSource.input, true ],
    ['mode=countdown stale countup.query',  ClockMode.countdown,ClockSource.input, ClockSource.query, false],
    // mode=countup: only countupSettings.source is active
    ['mode=countup   both input',           ClockMode.countup,  ClockSource.input, ClockSource.input, false],
    ['mode=countup   active countup',       ClockMode.countup,  ClockSource.input, ClockSource.query, true ],
    ['mode=countup   stale countdown.query',ClockMode.countup,  ClockSource.query, ClockSource.input, false],
  ])('%s', (_, mode, countdownSource, countupSource, expected) => {
    expect(
      isQueryDrivenOptions({
        mode,
        countdownSettings: { source: countdownSource } as any,
        countupSettings: { source: countupSource } as any,
      })
    ).toBe(expected);
  });

  describe('mode absent (old config)', () => {
    it.each<[string, ClockSource | undefined, ClockSource | undefined, boolean]>([
      ['no sources set',       undefined,         undefined,         false],
      ['countdown.query',      ClockSource.query,  ClockSource.input, true ],
      ['countup.query',        ClockSource.input,  ClockSource.query, true ],
      ['both query',           ClockSource.query,  ClockSource.query, true ],
      ['both input',           ClockSource.input,  ClockSource.input, false],
    ])('%s', (_, countdownSource, countupSource, expected) => {
      const options: Partial<ClockOptions> = {};
      if (countdownSource !== undefined) {
        options.countdownSettings = { source: countdownSource } as any;
      }
      if (countupSource !== undefined) {
        options.countupSettings = { source: countupSource } as any;
      }
      expect(isQueryDrivenOptions(options)).toBe(expected);
    });
  });
});
