import { PanelModel } from '@grafana/data';
import { cloneDeep } from 'lodash';
import { config } from '@grafana/runtime';
import { clockMigrationHandler, findGrafanaDataSource } from './migrations';

describe('Clock migrations', () => {
  it('Non-Query config with datasource included', () => {
    const panel = {
      clockType: '12 hour',
      countdownSettings: {
        endCountdownTime: '2019-05-28T03:30:00.000Z',
        endText: '00:00:00',
      },
      datasource: {
        type: 'influxdb',
        uid: '000000001',
      },
      dateSettings: {
        dateFormat: 'YYYY-MM-DD',
        fontSize: '20px',
        fontWeight: 'normal',
        showDate: true,
      },
      gridPos: {
        h: 5,
        w: 9,
        x: 0,
        y: 0,
      },
      id: 1,
      mode: 'time',
      options: {
        bgColor: 'rgb(27, 29, 33)',
        clockType: '12 hour',
        countdownSettings: {
          endCountdownTime: '2020-05-23T14:12:03-05:00',
          endText: '00:00:00',
        },
        countupSettings: {
          beginCountupTime: '2022-04-03T14:43:46-04:00',
          beginText: '00:00:00',
        },
        dateSettings: {
          dateFormat: 'YYYY-MM-DD',
          fontSize: '32px',
          fontWeight: 'normal',
          locale: '',
          showDate: true,
        },
        fontMono: true,
        mode: 'time',
        refresh: 'sec',
        timeSettings: {
          fontSize: '52px',
          fontWeight: 'bold',
        },
        timezone: 'America/New_York',
        timezoneSettings: {
          fontSize: '24px',
          fontWeight: 'normal',
          showTimezone: true,
          zoneFormat: 'offsetAbbv',
        },
      },
      pluginVersion: '2.1.3',
      refreshSettings: {
        syncWithDashboard: false,
      },
      targets: [
        {
          datasource: {
            type: 'influxdb',
            uid: '000000001',
          },
          groupBy: [
            {
              params: ['$__interval'],
              type: 'time',
            },
            {
              params: ['null'],
              type: 'fill',
            },
          ],
          orderByTime: 'ASC',
          policy: 'default',
          refId: 'A',
          resultFormat: 'time_series',
          select: [
            [
              {
                params: ['value'],
                type: 'field',
              },
              {
                params: [],
                type: 'mean',
              },
            ],
          ],
          tags: [],
        },
      ],
      timeSettings: {
        customFormat: 'HH:mm:ss',
        fontSize: '60px',
        fontWeight: 'normal',
      },
      timezone: 'America/Chicago',
      timezoneSettings: {
        fontSize: '12px',
        fontWeight: 'normal',
        showTimezone: true,
        zoneFormat: 'offsetAbbv',
      },
      type: 'grafana-clock-panel',
    } as unknown as PanelModel;
    const options = clockMigrationHandler(panel);
    expect(options).toMatchSnapshot();
    expect(panel).toMatchSnapshot();
  });

  it('Query config with datasource', () => {
    const panel = {
      clockType: '12 hour',
      countdownSettings: {
        endCountdownTime: '2019-05-28T03:30:00.000Z',
        endText: '00:00:00',
      },
      datasource: {
        type: 'influxdb',
        uid: '000000001',
      },
      dateSettings: {
        dateFormat: 'YYYY-MM-DD',
        fontSize: '20px',
        fontWeight: 'normal',
        showDate: true,
      },
      gridPos: {
        h: 5,
        w: 9,
        x: 0,
        y: 0,
      },
      id: 1,
      mode: 'time',
      options: {
        bgColor: 'rgb(27, 29, 33)',
        clockType: '12 hour',
        countdownSettings: {
          endCountdownTime: '2020-05-23T14:12:03-05:00',
          endText: '00:00:00',
          invalidValueText: 'invalid value',
          noValueText: 'no value found',
          queryCalculation: 'last',
          source: 'query',
        },
        countupSettings: {
          beginCountupTime: '2022-04-03T14:43:46-04:00',
          beginText: '00:00:00',
          invalidValueText: 'invalid value',
          noValueText: 'no value found',
          queryCalculation: 'last',
          source: 'query',
        },
        dateSettings: {
          dateFormat: 'YYYY-MM-DD',
          fontSize: '32px',
          fontWeight: 'normal',
          locale: '',
          showDate: true,
        },
        descriptionSettings: {
          descriptionText: '',
          fontSize: '12px',
          fontWeight: 'normal',
          noValueText: 'no description found',
          source: 'none',
        },
        fontMono: true,
        mode: 'time',
        refresh: 'sec',
        timeSettings: {
          fontSize: '52px',
          fontWeight: 'bold',
        },
        timezone: 'America/New_York',
        timezoneSettings: {
          fontSize: '24px',
          fontWeight: 'normal',
          showTimezone: true,
          zoneFormat: 'offsetAbbv',
        },
      },
      pluginVersion: '2.1.6',
      refreshSettings: {
        syncWithDashboard: false,
      },
      targets: [
        {
          datasource: {
            type: 'influxdb',
            uid: '000000001',
          },
          groupBy: [
            {
              params: ['$__interval'],
              type: 'time',
            },
            {
              params: ['null'],
              type: 'fill',
            },
          ],
          orderByTime: 'ASC',
          policy: 'default',
          refId: 'A',
          resultFormat: 'time_series',
          select: [
            [
              {
                params: ['value'],
                type: 'field',
              },
              {
                params: [],
                type: 'mean',
              },
            ],
          ],
          tags: [],
        },
      ],
      timeSettings: {
        customFormat: 'HH:mm:ss',
        fontSize: '60px',
        fontWeight: 'normal',
      },
      timezone: 'America/Chicago',
      timezoneSettings: {
        fontSize: '12px',
        fontWeight: 'normal',
        showTimezone: true,
        zoneFormat: 'offsetAbbv',
      },
      type: 'grafana-clock-panel',
    } as unknown as PanelModel;
    const options = clockMigrationHandler(panel);
    expect(options).toMatchSnapshot();
    expect(panel).toMatchSnapshot();
  });

  describe('support readonly targets in G12', () => {
    it('should not try to mutate targets when migrating panel', () => {
      const panel = createPanelWithReadonlyTargets({
        options: {
          countdownSettings: { source: 'input' },
        },
        datasource: { type: 'test', uid: '123' },
        targets: [],
      } as unknown as PanelModel);

      expect(() => clockMigrationHandler(panel)).not.toThrow();
    });

    describe('with Grafana built-in datasource available', () => {
      const grafanaDs = { id: 1, uid: 'grafana', type: 'datasource', name: '-- Grafana --' };

      beforeEach(() => {
        (config as any).datasources = { grafana: grafanaDs };
      });

      afterEach(() => {
        (config as any).datasources = {};
      });

      it('sets panel datasource to Grafana built-in when targets are readonly and panel is input-only', () => {
        const panel = createPanelWithReadonlyTargets({
          options: {
            countdownSettings: { source: 'input' },
            countupSettings: { source: 'input' },
            descriptionSettings: { source: 'none' },
          },
          datasource: { type: 'influxdb', uid: 'xxx' },
          targets: [{ refId: 'A' }],
        } as unknown as PanelModel);

        expect(() => clockMigrationHandler(panel)).not.toThrow();
        expect(panel.datasource).toEqual({ type: grafanaDs.type, uid: grafanaDs.uid });
      });

      it('mutates bare target elements to use Grafana built-in datasource with randomWalk', () => {
        const panel = createPanelWithReadonlyTargets({
          options: {
            countdownSettings: { source: 'input' },
            countupSettings: { source: 'input' },
            descriptionSettings: { source: 'none' },
          },
          datasource: { type: 'influxdb', uid: 'xxx' },
          targets: [{ refId: 'A' }],
        } as unknown as PanelModel);

        clockMigrationHandler(panel);

        // The readonly getter returns a mutable clone; mutations to elements are observable.
        expect(panel.targets[0].datasource).toEqual({ type: grafanaDs.type, uid: grafanaDs.uid });
        expect(panel.targets[0].queryType).toBe('randomWalk');
      });

      it('does not touch query-mode panels that have readonly targets', () => {
        const panel = createPanelWithReadonlyTargets({
          options: {
            countdownSettings: { source: 'query' },
          },
          datasource: { type: 'influxdb', uid: 'yyy' },
          targets: [{ refId: 'A', datasource: { type: 'influxdb', uid: 'yyy' } }],
        } as unknown as PanelModel);

        clockMigrationHandler(panel);

        // detectInputOnlyPluginConfig returns false for source='query',
        // so Fix 2 block must not be entered — original datasource preserved.
        expect(panel.targets[0].datasource).toEqual({ type: 'influxdb', uid: 'yyy' });
        expect(panel.targets[0].queryType).toBeUndefined();
      });

      it('does not redirect targets or change datasource when readonly targets are already empty', () => {
        // Path E: the targets.length > 0 guard — no stale targets means nothing to redirect.
        // panel.datasource must NOT be changed to the Grafana built-in even when it is available.
        const panel = createPanelWithReadonlyTargets({
          options: {
            countdownSettings: { source: 'input' },
            countupSettings: { source: 'input' },
            descriptionSettings: { source: 'none' },
          },
          datasource: { type: 'influxdb', uid: 'xxx' },
          targets: [],
        } as unknown as PanelModel);

        clockMigrationHandler(panel);

        expect(panel.datasource).toEqual({ type: 'influxdb', uid: 'xxx' });
        expect(panel.targets).toEqual([]);
      });
    });

    describe('without Grafana built-in datasource', () => {
      it('does not throw when no Grafana DS is registered', () => {
        // config.datasources defaults to {} in test environment
        const panel = createPanelWithReadonlyTargets({
          options: {
            countdownSettings: { source: 'input' },
            countupSettings: { source: 'input' },
            descriptionSettings: { source: 'none' },
          },
          datasource: { type: 'influxdb', uid: 'xxx' },
          targets: [{ refId: 'A' }],
        } as unknown as PanelModel);

        expect(() => clockMigrationHandler(panel)).not.toThrow();
        // Without a Grafana DS, the panel datasource cannot be fixed — that is acceptable.
        // The important guarantee is no crash.
      });

      it('leaves stale target elements untouched when no Grafana DS is registered', () => {
        // Path D: cannot redirect — assert elements are not silently mutated.
        const panel = createPanelWithReadonlyTargets({
          options: {
            countdownSettings: { source: 'input' },
            countupSettings: { source: 'input' },
            descriptionSettings: { source: 'none' },
          },
          datasource: { type: 'influxdb', uid: 'xxx' },
          targets: [{ refId: 'A' }],
        } as unknown as PanelModel);

        clockMigrationHandler(panel);

        expect(panel.targets[0].queryType).toBeUndefined();
        expect(panel.targets[0].datasource).toBeUndefined();
        expect(panel.datasource).toEqual({ type: 'influxdb', uid: 'xxx' });
      });
    });
  });

  describe('cleanupConfig', () => {
    it('does not delete panel.datasource (responsibility moved to migrateInputOnlyPluginConfig)', () => {
      // A query-mode panel should retain its panel-level datasource through cleanupConfig.
      const panel = {
        datasource: { type: 'influxdb', uid: 'xxx' },
        options: {
          countdownSettings: { source: 'query' },
          countupSettings: { source: 'query' },
          descriptionSettings: { source: 'none' },
        },
        targets: [{ refId: 'A', datasource: { type: 'influxdb', uid: 'xxx' } }],
        type: 'grafana-clock-panel',
      } as unknown as PanelModel;

      clockMigrationHandler(panel);

      expect(panel.datasource).toEqual({ type: 'influxdb', uid: 'xxx' });
    });
  });

  describe('bare target re-added after previous migration (mutable targets)', () => {
    it('clears bare targets on a panel that is input-only', () => {
      // Simulates Path B: user or editor re-added a bare { refId: 'A' } target
      // after a previous migration correctly cleared them. Since targets are mutable
      // (non-Grafana-12), migrateInputOnlyPluginConfig runs and clears them again.
      const panel = {
        options: {
          countdownSettings: { source: 'input' },
          countupSettings: { source: 'input' },
          descriptionSettings: { source: 'none' },
        },
        targets: [{ refId: 'A' }],
        pluginVersion: '2.1.8',
        type: 'grafana-clock-panel',
      } as unknown as PanelModel;

      clockMigrationHandler(panel);

      // migrateInputOnlyPluginConfig always clears to [] regardless of Grafana DS presence.
      expect(panel.targets).toEqual([]);
    });
  });

  describe('mutable targets with Grafana built-in datasource available', () => {
    const grafanaDs = { id: 1, uid: 'grafana', type: 'datasource', name: '-- Grafana --' };

    beforeEach(() => {
      (config as any).datasources = { grafana: grafanaDs };
    });

    afterEach(() => {
      (config as any).datasources = {};
    });

    it('clears targets and datasource without inserting a randomWalk query', () => {
      // Path A₂: migrateInputOnlyPluginConfig must not re-add a randomWalk target even
      // when the Grafana built-in DS is registered — the panel does not need a query.
      const panel = {
        options: {
          countdownSettings: { source: 'input' },
          countupSettings: { source: 'input' },
          descriptionSettings: { source: 'none' },
        },
        datasource: { type: 'influxdb', uid: 'xxx' },
        targets: [{ refId: 'A' }],
        type: 'grafana-clock-panel',
      } as unknown as PanelModel;

      clockMigrationHandler(panel);

      expect(panel.targets).toEqual([]);
      expect(panel.datasource).toBeUndefined();
    });
  });

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
});

describe('Real-world: barn-thermals-imperial v13 clock panel', () => {
  // Exact panel JSON from dashboard version 13 — no targets, no datasource,
  // pluginVersion 2.1.3, all sources set to input/none.
  // This is the clean pre-bug state that should NOT have a query inserted.
  const v13Panel = {
    gridPos: { h: 4, w: 24, x: 0, y: 0 },
    id: 10,
    options: {
      bgColor: 'rgb(27, 29, 33)',
      clockType: '12 hour',
      countdownSettings: {
        endCountdownTime: '2020-05-23T14:12:03-05:00',
        endText: '00:00:00',
        invalidValueText: 'invalid value',
        noValueText: 'no value found',
        queryCalculation: 'last',
        source: 'input',
      },
      countupSettings: {
        beginCountupTime: '2022-04-03T14:43:46-04:00',
        beginText: '00:00:00',
        invalidValueText: 'invalid value',
        noValueText: 'no value found',
        queryCalculation: 'last',
        source: 'input',
      },
      dateSettings: {
        dateFormat: 'YYYY-MM-DD',
        fontSize: '35px',
        fontWeight: 'bold',
        locale: '',
        showDate: true,
      },
      descriptionSettings: {
        descriptionText: '',
        fontSize: '12px',
        fontWeight: 'normal',
        noValueText: 'no description found',
        source: 'none',
      },
      fontMono: true,
      mode: 'time',
      refresh: 'sec',
      timeSettings: { fontSize: '56px', fontWeight: 'bold' },
      timezone: 'America/New_York',
      timezoneSettings: {
        fontSize: '28px',
        fontWeight: 'bold',
        showTimezone: false,
        zoneFormat: 'offsetAbbv',
      },
    },
    pluginVersion: '2.1.3',
    type: 'grafana-clock-panel',
  };

  it('produces empty targets — no query inserted (no Grafana DS in env)', () => {
    const panel = { ...v13Panel } as unknown as PanelModel;
    clockMigrationHandler(panel);
    expect(panel.targets).toEqual([]);
    expect(panel.datasource).toBeUndefined();
  });

  it('does not insert a query target even when Grafana built-in DS is available', () => {
    (config as any).datasources = {
      grafana: { uid: 'grafana', type: 'datasource', name: '-- Grafana --' },
    };
    try {
      const panel = { ...v13Panel } as unknown as PanelModel;
      clockMigrationHandler(panel);
      // Input-only panels need no datasource or query — targets must be empty
      // and datasource must be absent even when the Grafana built-in DS is registered.
      expect(panel.targets).toEqual([]);
      expect(panel.datasource).toBeUndefined();
    } finally {
      (config as any).datasources = {};
    }
  });
});

function createPanelWithReadonlyTargets(panel: Partial<PanelModel>): PanelModel {
  // https://github.com/grafana/grafana/blob/2bbba880cd2a8269e262e4ea7138fcd43f4d5c66/public/app/features/dashboard-scene/serialization/angularMigration.ts#L18
  const targetClone = cloneDeep(panel.targets);
  Object.defineProperty(panel, 'targets', {
    get: function () {
      console.warn(
        'Accessing the targets property when migrating a panel plugin is deprecated. Changes to this property will be ignored.'
      );
      return targetClone;
    },
  });

  return panel as unknown as PanelModel;
}
