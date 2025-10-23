import { PanelModel } from '@grafana/data';
import { cloneDeep } from 'lodash';
import { clockMigrationHandler } from './migrations';

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
