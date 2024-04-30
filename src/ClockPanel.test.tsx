import { ClockPanel } from 'ClockPanel';
import { act, render } from '@testing-library/react';
import { FieldConfigSource, ScopedVars, LoadingState, getDefaultTimeRange } from '@grafana/data';
import {
  ClockMode,
  ClockRefresh,
  ClockSource,
  ClockType,
  CountdownQueryCalculation,
  CountupQueryCalculation,
  FontWeight,
  ZoneFormat,
} from 'types';
import React from 'react';

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
});

const getDefaultProps = () => {
  const props = {
    data: {
      state: LoadingState.Done,
      series: [],
      timeRange: getDefaultTimeRange(),
    },
    timeRange: getDefaultTimeRange(),
    timeZone: 'UTC',
    options: {
      clockType: ClockType.H24,
      mode: ClockMode.time,
      refresh: ClockRefresh.sec,
      countdownSettings: {
        source: ClockSource.input,
        queryCalculation: CountdownQueryCalculation.lastNotNull,
        queryField: '',
        endCountdownTime: undefined,
        endText: '00:00:00',
        invalidValueText: 'invalid value',
        noValueText: 'no value',
      },
      countupSettings: {
        source: ClockSource.input,
        queryCalculation: CountupQueryCalculation.lastNotNull,
        queryField: '',
        beginCountupTime: undefined,
        beginText: '00:00:00',
        invalidValueText: 'invalid value',
        noValueText: 'no value',
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
