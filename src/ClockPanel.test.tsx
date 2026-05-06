import { ClockPanel } from 'ClockPanel';
import { act, render, screen } from '@testing-library/react';
import { DataQueryRequest, FieldConfigSource, ScopedVars, LoadingState, getDefaultTimeRange, DataFrame, FieldType } from '@grafana/data';
import { DataQuery } from '@grafana/schema';
import {
  ClockMode,
  ClockRefresh,
  ClockSource,
  ClockStyle,
  ClockType,
  CountdownQueryCalculation,
  CountupQueryCalculation,
  DescriptionSource,
  FontWeight,
  ZoneFormat,
} from 'types';
import React from 'react';
import { TEST_IDS } from './constants';

describe('ClockPanel', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    jest.setSystemTime(new Date('20 Aug 2020 02:12:00 GMT').getTime());
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('renders with default settings without error (24H format)', () => {
    const props = getDefaultProps();
    const { container } = render(<ClockPanel {...props} />);

    expect(container).toHaveTextContent('02:12:00');
    // no timezone by default
    expect(container.querySelector('[data-testid="time-zone"]')).not.toBeInTheDocument();
  });

  test('renders properly in 12H format', () => {
    const props = getDefaultProps();
    props.options.clockType = ClockType.H12;
    const { container } = render(<ClockPanel {...props} />);

    expect(container).toHaveTextContent('2:12:00 AM');
    // no timezone by default
    expect(container.querySelector('[data-testid="time-zone"]')).not.toBeInTheDocument();
  });

  test('renders properly with date', () => {
    // ARRANGE
    const props = getDefaultProps();
    props.options.dateSettings.showDate = true;
    const { container } = render(<ClockPanel {...props} />);

    expect(container).toHaveTextContent('2020-08-2002:12:00');
    // no timezone by default
    expect(container.querySelector('[data-testid="time-zone"]')).not.toBeInTheDocument();
  });

  test('renders properly in DE locale', () => {
    const props = getDefaultProps();
    props.options.dateSettings.showDate = true;
    props.options.dateSettings.locale = 'de';
    props.options.dateSettings.dateFormat = 'L';
    const { container } = render(<ClockPanel {...props} />);

    expect(container).toHaveTextContent('20.08.202002:12:00');
    // no timezone by default
    expect(container.querySelector('[data-testid="time-zone"]')).not.toBeInTheDocument();
  });

  test('renders properly with timezone', () => {
    const props = getDefaultProps();
    props.options.timezoneSettings.showTimezone = true;
    const { container } = render(<ClockPanel {...props} />);

    expect(container).toHaveTextContent('02:12:00');
    expect(container.querySelector('[data-testid="time-zone"]')).toBeInTheDocument();
  });

  test('Updates the clock every second', () => {
    const props = getDefaultProps();
    props.options.refresh = ClockRefresh.sec;
    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('02:12:00');

    // should trigger an update
    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(container).toHaveTextContent('02:12:01');
  });

  test('Updates only when the dashboard refreshes manually', () => {
    const props = getDefaultProps();
    props.options.refresh = ClockRefresh.dashboard;
    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('02:12:00');

    // should not trigger an update
    act(() => {
      jest.runOnlyPendingTimers();
    });

    expect(container).toHaveTextContent('02:12:00');
  });

  test('countup from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countup;
    props.options.countupSettings.source = ClockSource.query;
    props.options.countupSettings.queryField = 'datetime';
    props.options.countupSettings.queryCalculation = CountupQueryCalculation.maxPast;

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('7 months, 18 days, 2 hours, 12 minutes, 0 seconds');
  });

  test('countdown from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countdown;
    props.options.countdownSettings.source = ClockSource.query;
    props.options.countdownSettings.queryField = 'datetime';
    props.options.countdownSettings.queryCalculation = CountdownQueryCalculation.minFuture;

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('4 months, 11 days, 21 hours, 48 minutes, 0 seconds');
  });

  test('before countup from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countup;
    props.options.countupSettings.source = ClockSource.query;
    props.options.countupSettings.queryField = 'datetime';
    props.options.countupSettings.queryCalculation = CountupQueryCalculation.max;

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('00:00:00');
  });

  test('after countdown from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countdown;
    props.options.countdownSettings.source = ClockSource.query;
    props.options.countdownSettings.queryField = 'datetime';
    props.options.countdownSettings.queryCalculation = CountdownQueryCalculation.min;

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('00:00:00');
  });

  test('no countup value from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countup;
    props.options.countupSettings.source = ClockSource.query;
    props.options.countupSettings.queryField = 'datetime';
    props.options.countupSettings.queryCalculation = CountupQueryCalculation.first;
    props.data.series[0].fields[0].values = [];

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('no value');
  });

  test('no countdown value from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countdown;
    props.options.countdownSettings.source = ClockSource.query;
    props.options.countdownSettings.queryField = 'datetime';
    props.options.countdownSettings.queryCalculation = CountdownQueryCalculation.first;
    props.data.series[0].fields[0].values = [];

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('no value');
  });

  test('invalid countup value from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countup;
    props.options.countupSettings.source = ClockSource.query;
    props.options.countupSettings.queryField = 'datetime';
    props.options.countupSettings.queryCalculation = CountupQueryCalculation.first;

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('invalid value');
  });

  test('invalid countdown value from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countdown;
    props.options.countdownSettings.source = ClockSource.query;
    props.options.countdownSettings.queryField = 'datetime';
    props.options.countdownSettings.queryCalculation = CountdownQueryCalculation.first;

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('invalid value');
  });

  test('undefined as input from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countdown;
    props.options.countdownSettings.source = ClockSource.query;
    props.options.countdownSettings.queryField = 'datetime';
    props.options.countdownSettings.queryCalculation = CountdownQueryCalculation.first;
    props.options.descriptionSettings.source = DescriptionSource.query;
    props.options.descriptionSettings.queryField = 'label';
    props.data.series[0].fields[0].values[0] = undefined;
    props.data.series[0].fields[1].values[0] = 'Undefined';

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('invalid value');
    expect(container).toHaveTextContent('Undefined');
  });

  test('null as input from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countdown;
    props.options.countdownSettings.source = ClockSource.query;
    props.options.countdownSettings.queryField = 'datetime';
    props.options.countdownSettings.queryCalculation = CountdownQueryCalculation.first;
    props.options.descriptionSettings.source = DescriptionSource.query;
    props.options.descriptionSettings.queryField = 'label';
    props.data.series[0].fields[0].values[0] = null;
    props.data.series[0].fields[1].values[0] = 'Null';

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('invalid value');
    expect(container).toHaveTextContent('Null');
  });

  test('NaN as input from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countdown;
    props.options.countdownSettings.source = ClockSource.query;
    props.options.countdownSettings.queryField = 'datetime';
    props.options.countdownSettings.queryCalculation = CountdownQueryCalculation.first;
    props.options.descriptionSettings.source = DescriptionSource.query;
    props.options.descriptionSettings.queryField = 'label';
    props.data.series[0].fields[0].values[0] = NaN;
    props.data.series[0].fields[1].values[0] = 'NaN';

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('invalid value');
    expect(container).toHaveTextContent('NaN');
  });

  test('first QueryCalculation from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countdown;
    props.options.countdownSettings.source = ClockSource.query;
    props.options.countdownSettings.queryField = 'datetime';
    props.options.countdownSettings.queryCalculation = CountdownQueryCalculation.first;
    props.options.descriptionSettings.source = DescriptionSource.query;
    props.options.descriptionSettings.queryField = 'label';

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('invalid value');
    expect(container).toHaveTextContent('Undefined');
  });

  test('firstNotNull QueryCalculation from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countdown;
    props.options.countdownSettings.source = ClockSource.query;
    props.options.countdownSettings.queryField = 'datetime';
    props.options.countdownSettings.queryCalculation = CountdownQueryCalculation.firstNotNull;
    props.options.descriptionSettings.source = DescriptionSource.query;
    props.options.descriptionSettings.queryField = 'label';

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('4 months, 11 days, 21 hours, 48 minutes, 0 seconds');
    expect(container).toHaveTextContent('Next New Year');
  });

  test('last QueryCalculation from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countup;
    props.options.countupSettings.source = ClockSource.query;
    props.options.countupSettings.queryField = 'datetime';
    props.options.countupSettings.queryCalculation = CountupQueryCalculation.last;
    props.options.descriptionSettings.source = DescriptionSource.query;
    props.options.descriptionSettings.queryField = 'label';

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('invalid value');
    expect(container).toHaveTextContent('NaN');
  });

  test('lastNotNull QueryCalculation from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countup;
    props.options.countupSettings.source = ClockSource.query;
    props.options.countupSettings.queryField = 'datetime';
    props.options.countupSettings.queryCalculation = CountupQueryCalculation.lastNotNull;
    props.options.descriptionSettings.source = DescriptionSource.query;
    props.options.descriptionSettings.queryField = 'label';

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('1 year, 7 months, 18 days, 2 hours, 12 minutes, 0 seconds');
    expect(container).toHaveTextContent('Penultimate New Year');
  });

  test('min QueryCalculation from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countup;
    props.options.countupSettings.source = ClockSource.query;
    props.options.countupSettings.queryField = 'datetime';
    props.options.countupSettings.queryCalculation = CountupQueryCalculation.min;
    props.options.descriptionSettings.source = DescriptionSource.query;
    props.options.descriptionSettings.queryField = 'label';

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('1 year, 7 months, 18 days, 2 hours, 12 minutes, 0 seconds');
    expect(container).toHaveTextContent('Penultimate New Year');
  });

  test('minFuture QueryCalculation from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countdown;
    props.options.countdownSettings.source = ClockSource.query;
    props.options.countdownSettings.queryField = 'datetime';
    props.options.countdownSettings.queryCalculation = CountdownQueryCalculation.minFuture;
    props.options.descriptionSettings.source = DescriptionSource.query;
    props.options.descriptionSettings.queryField = 'label';

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('4 months, 11 days, 21 hours, 48 minutes, 0 seconds');
    expect(container).toHaveTextContent('Next New Year');
  });

  test('max QueryCalculation from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countdown;
    props.options.countdownSettings.source = ClockSource.query;
    props.options.countdownSettings.queryField = 'datetime';
    props.options.countdownSettings.queryCalculation = CountupQueryCalculation.max;
    props.options.descriptionSettings.source = DescriptionSource.query;
    props.options.descriptionSettings.queryField = 'label';

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('1 year, 4 months, 11 days, 21 hours, 48 minutes, 0 seconds');
    expect(container).toHaveTextContent('New Year After Next');
  });

  test('maxPast QueryCalculation from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countup;
    props.options.countupSettings.source = ClockSource.query;
    props.options.countupSettings.queryField = 'datetime';
    props.options.countupSettings.queryCalculation = CountupQueryCalculation.maxPast;
    props.options.descriptionSettings.source = DescriptionSource.query;
    props.options.descriptionSettings.queryField = 'label';

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('7 months, 18 days, 2 hours, 12 minutes, 0 seconds');
    expect(container).toHaveTextContent('Last New Year');
  });

  test('time from different query series', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countdown;
    props.options.countdownSettings.source = ClockSource.query;
    props.options.countdownSettings.queryField = 'datetime series b';
    props.options.countdownSettings.queryCalculation = CountdownQueryCalculation.first;
    props.options.descriptionSettings.source = DescriptionSource.query;
    props.options.descriptionSettings.queryField = 'label';
    props.data.series.push({
      fields: [
        {
          name: 'datetime series b',
          values: [new Date('01-01-2021')],
          type: FieldType.time,
          config: {},
        },
      ],
      length: 1,
    });

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('4 months, 11 days, 21 hours, 48 minutes, 0 seconds');
    expect(container).toHaveTextContent('Undefined');
  });

  test('description with static text', () => {
    const props = getDefaultProps();
    props.options.descriptionSettings.source = DescriptionSource.input;
    props.options.descriptionSettings.descriptionText = 'Static description';

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('Static description');
  });

  test('description from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countdown;
    props.options.countdownSettings.source = ClockSource.query;
    props.options.countdownSettings.queryField = 'datetime';
    props.options.countdownSettings.queryCalculation = CountdownQueryCalculation.minFuture;
    props.options.descriptionSettings.source = DescriptionSource.query;
    props.options.descriptionSettings.queryField = 'label';

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('Next New Year');
  });

  test('no value for description from query field', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countdown;
    props.options.countdownSettings.source = ClockSource.query;
    props.options.countdownSettings.queryField = 'datetime';
    props.options.countdownSettings.queryCalculation = CountdownQueryCalculation.first;
    props.options.descriptionSettings.source = DescriptionSource.query;
    props.options.descriptionSettings.queryField = 'label';
    props.data.series[0].fields[1].values = [];

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('no description found');
  });

  test('description from different query series', () => {
    const props = getDefaultProps();
    props.options.mode = ClockMode.countdown;
    props.options.countdownSettings.source = ClockSource.query;
    props.options.countdownSettings.queryField = 'datetime';
    props.options.countdownSettings.queryCalculation = CountdownQueryCalculation.first;
    props.options.descriptionSettings.source = DescriptionSource.query;
    props.options.descriptionSettings.queryField = 'label series b';
    props.data.series.push({
      fields: [
        {
          name: 'label series b',
          values: ['Undefined from series b'],
          type: FieldType.string,
          config: {},
        },
      ],
      length: 1,
    });

    const { container } = render(<ClockPanel {...props} />);
    expect(container).toHaveTextContent('Undefined from series b');
  });
});

describe('stale query notice', () => {
  describe('trigger conditions', () => {
    it('does not render when no queries and no errors', () => {
      const props = getDefaultProps();
      render(<ClockPanel {...props} />);
      expect(screen.queryByTestId(TEST_IDS.staleQueryNotice)).toBeNull();
    });

    it('renders when data state is Error', () => {
      const props = getDefaultProps();
      render(<ClockPanel {...props} data={{ ...props.data, state: LoadingState.Error, errors: [{ message: 'failed' }] }} />);
      expect(screen.getByTestId(TEST_IDS.staleQueryNotice)).toBeInTheDocument();
    });

    it('renders when request has active targets', () => {
      const props = getDefaultProps();
      render(<ClockPanel {...props} data={{ ...props.data, request: mockRequest([{ refId: 'A' }]) }} />);
      expect(screen.getByTestId(TEST_IDS.staleQueryNotice)).toBeInTheDocument();
    });
  });

  describe('mode-aware source suppression', () => {
    // All cases below have an active request — we are testing whether the mode×source
    // combination correctly identifies the panel as query-driven (suppresses notice)
    // or input-only (shows notice). The trigger is always present so it can't interfere.
    it.each<[string, ClockMode, ClockSource, ClockSource, boolean]>([
      // description                              mode              countdownSource              countupSource              visible
      ['mode=time,     no stale sources',         ClockMode.time,     ClockSource.input, ClockSource.input, true ],
      ['mode=time,     stale countdown.query',    ClockMode.time,     ClockSource.query, ClockSource.input, true ],
      ['mode=countdown active countdown.query',   ClockMode.countdown,ClockSource.query, ClockSource.input, false],
      ['mode=countdown stale countup.query',      ClockMode.countdown,ClockSource.input, ClockSource.query, true ],
      ['mode=countup   active countup.query',     ClockMode.countup,  ClockSource.input, ClockSource.query, false],
      ['mode=countup   stale countdown.query',    ClockMode.countup,  ClockSource.query, ClockSource.input, true ],
    ])('%s', (_, mode, countdownSource, countupSource, visible) => {
      const props = getDefaultProps();
      render(
        <ClockPanel
          {...props}
          options={{
            ...props.options,
            mode,
            countdownSettings: { ...props.options.countdownSettings, source: countdownSource },
            countupSettings: { ...props.options.countupSettings, source: countupSource },
          }}
          data={{ ...props.data, request: mockRequest([{ refId: 'A' }]) }}
        />
      );
      visible
        ? expect(screen.getByTestId(TEST_IDS.staleQueryNotice)).toBeInTheDocument()
        : expect(screen.queryByTestId(TEST_IDS.staleQueryNotice)).toBeNull();
    });

    it('does not render when countdown.source=query and mode is absent (treated as query-driven)', () => {
      // Pre-2.1.4 panels have no mode field. The conservative else-branch in isQueryDrivenOptions
      // checks both sources — countdown.source='query' marks the panel as query-driven, so the
      // notice is suppressed just as it would be for an explicit mode=countdown panel.
      const props = getDefaultProps();
      const { mode: _mode, ...optionsWithoutMode } = props.options as any;
      render(
        <ClockPanel
          {...props}
          options={{ ...optionsWithoutMode, countdownSettings: { ...props.options.countdownSettings, source: ClockSource.query } }}
          data={{ ...props.data, request: mockRequest([{ refId: 'A' }]) }}
        />
      );
      expect(screen.queryByTestId(TEST_IDS.staleQueryNotice)).toBeNull();
    });
  });
});
const getDefaultProps = () => {
  const props = {
    data: {
      state: LoadingState.Done,
      series: [
        {
          fields: [
            {
              name: 'datetime',
              values: [
                undefined,
                null,
                new Date('01-01-2021'),
                new Date('01-01-2020'),
                new Date('01-01-2022'),
                new Date('01-01-2019'),
                NaN,
              ],
              type: FieldType.time,
              config: {},
            },
            {
              name: 'label',
              values: [
                'Undefined',
                'Null',
                'Next New Year',
                'Last New Year',
                'New Year After Next',
                'Penultimate New Year',
                'NaN',
              ],
              type: FieldType.string,
              config: {},
            },
          ],
          length: 6,
        },
      ] as DataFrame[],
      timeRange: getDefaultTimeRange(),
    },
    timeRange: getDefaultTimeRange(),
    timeZone: 'UTC',
    options: {
      clockType: ClockType.H24,
      mode: ClockMode.time,
      refresh: ClockRefresh.sec,
      style: ClockStyle.text,
      countdownSettings: {
        source: ClockSource.input,
        queryCalculation: CountdownQueryCalculation.lastNotNull,
        queryField: '',
        endCountdownTime: undefined,
        endText: '00:00:00',
        invalidValueText: 'invalid value',
        noValueText: 'no value found',
      },
      countupSettings: {
        source: ClockSource.input,
        queryCalculation: CountupQueryCalculation.lastNotNull,
        queryField: '',
        beginCountupTime: undefined,
        beginText: '00:00:00',
        invalidValueText: 'invalid value',
        noValueText: 'no value found',
      },
      descriptionSettings: {
        source: DescriptionSource.input,
        descriptionText: '',
        queryField: '',
        noValueText: 'no description found',
        fontSize: '20px',
        fontWeight: FontWeight.normal,
      },
      dateSettings: {
        showDate: false,
        dateFormat: 'YYYY-MM-DD',
        locale: 'en-US',
        fontSize: '20px',
        fontWeight: FontWeight.normal,
      },
      timeSettings: {
        fontSize: '20px',
        fontWeight: FontWeight.normal,
      },
      timezoneSettings: {
        showTimezone: false,
        zoneFormat: ZoneFormat.name,
        fontSize: '20px',
        fontWeight: FontWeight.normal,
      },
    },
    id: 1,
    transparent: false,
    width: 100,
    height: 100,
    renderCounter: 1,
    fieldConfig: {} as FieldConfigSource,
    scopedVars: {} as ScopedVars,
    title: 'Clock',
    eventBus: {} as any,
    replaceVariables: jest.fn(),
    onOptionsChange: jest.fn(),
    onFieldConfigChange: jest.fn(),
    onPanelConfigChange: jest.fn(),
    onChangeTimeRange: jest.fn(),
  };
  return props;
};

const mockRequest = (targets: Array<{ refId: string }>): DataQueryRequest<DataQuery> => ({
  requestId: 'test',
  interval: '1s',
  intervalMs: 1000,
  range: getDefaultTimeRange(),
  scopedVars: {},
  targets: targets as DataQuery[],
  timezone: 'browser',
  app: 'panel-editor',
  startTime: 0,
});
