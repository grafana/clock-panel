import { ClockPanel } from "ClockPanel";
import {render} from '@testing-library/react'
import '@testing-library/jest-dom'
import { FieldConfigSource, ScopedVars, LoadingState, getDefaultTimeRange } from "@grafana/data";
import { ClockMode, ClockRefresh, ClockType, FontWeight, ZoneFormat } from "types";
import React from "react";

describe('ClockPanel', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('20 Aug 2020 02:12:00 GMT').getTime())
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('renders with default settings without error', () => {
    // ARRANGE
    const props = getDefaultProps();
    const { container } = render(<ClockPanel {...props} />)
    // ACT

    // ASSERT
    expect(container).toHaveTextContent('02:12:00')
  });

  test('renders properly in 12H format', () => {
    // ARRANGE
    const props = getDefaultProps();
    props.options.clockType = ClockType.H12;
    const { container } = render(<ClockPanel {...props} />)
    // ACT

    // ASSERT
    expect(container).toHaveTextContent('2:12:00 AM')
  });

  test('renders properly with date', () => {
    // ARRANGE
    const props = getDefaultProps();
    props.options.dateSettings.showDate = true;
    const { container } = render(<ClockPanel {...props} />)
    // ACT

    // ASSERT
    expect(container).toHaveTextContent('2020-08-2002:12:00')
  });

  test('renders properly in DE locale', () => {
    // ARRANGE
    const props = getDefaultProps();
    props.options.dateSettings.showDate = true;    
    props.options.dateSettings.locale = 'de';
    props.options.dateSettings.dateFormat = 'L';
    const { container } = render(<ClockPanel {...props} />)
    // ACT

    // ASSERT
    expect(container).toHaveTextContent('20.08.202002:12:00')
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
    timeZone: 'utc',
    options: {
      clockType: ClockType.H24,
      mode: ClockMode.time,
      refresh: ClockRefresh.sec,
      countdownSettings: {
        endText: '00:00:00',
        endCountdownTime: undefined
      },
      countupSettings: {
        beginCountupTime: undefined,
        beginText: '00:00:00'
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
  }
  return props;
};
