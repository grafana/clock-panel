import { css } from '@emotion/css';
import { Field, PanelData, PanelProps } from '@grafana/data';
import moment, { Moment } from 'moment-timezone';
import React, { useMemo } from 'react';
import {
  ClockMode,
  ClockOptions,
  ClockSource,
  ClockType,
  CountdownQueryCalculation,
  CountupQueryCalculation,
  TimeSettings,
} from 'types';
import { getMoment } from 'utils';

function getCountdownText({
  countdownSettings,
  timezone,
  data,
  replaceVariables,
  now,
}: {
  countdownSettings: ClockOptions['countdownSettings'];
  timezone: ClockOptions['timezone'];
  data: PanelData;
  replaceVariables: PanelProps['replaceVariables'];
  now: Moment;
}): string {
  let timeLeft = moment.duration(0);

  switch (countdownSettings.source) {
    case ClockSource.input:
      if (!countdownSettings.endCountdownTime) {
        return countdownSettings.endText;
      }

      timeLeft = moment.duration(
        moment(replaceVariables(countdownSettings.endCountdownTime))
          .utcOffset(getMoment(timezone).format('Z'), true)
          .diff(now)
      );
      break;
    case ClockSource.query:
      if (data.state === 'Done' && data.series.length > 0) {
        let field_name = countdownSettings.queryField;
        if (
          !field_name ||
          field_name.length === 0 ||
          !data.series ||
          data.series.length === 0 ||
          !data.series[0].fields
        ) {
          return countdownSettings.endText;
        }

        let field: Field | undefined =
          data.series[0].fields.find((field: Field) => field.name === field_name) ?? undefined;
        if (!field) {
          return countdownSettings.endText;
        }

        let field_values = field.values;
        if (!field_values || field_values.length === 0) {
          return countdownSettings.endText;
        }

        let value: Moment | undefined = moment();
        switch (countdownSettings.queryCalculation) {
          case CountdownQueryCalculation.lastNotNull:
            value = moment(field_values.filter((v: any) => v !== null && !Number.isNaN(v)).at(-1));
            break;
          case CountdownQueryCalculation.last:
            value = moment(field_values.at(-1));
            break;
          case CountdownQueryCalculation.firstNotNull:
            value = moment(field_values.filter((v: any) => v !== null && !Number.isNaN(v))[0]);
            break;
          case CountdownQueryCalculation.first:
            value = moment(field_values[0]);
            break;
          case CountdownQueryCalculation.min:
            value = field_values.map((v: any) => moment(v)).sort()[0];
            break;
          case CountdownQueryCalculation.minFuture:
            value = field_values
              .map((v: any) => moment(v))
              .filter((v: any) => v.isAfter(now))
              .sort()[0];
            break;
          case CountdownQueryCalculation.max:
            value = field_values
              .map((v: any) => moment(v))
              .sort()
              .at(-1);
            break;
        }

        if (!value || value.isValid() === false) {
          return countdownSettings.endText;
        }

        timeLeft = moment.duration(value.diff(now));
      }
      break;
  }

  let formattedTimeLeft = '';

  if (timeLeft.asSeconds() <= 0) {
    return countdownSettings.endText;
  }

  if (countdownSettings.customFormat === 'auto') {
    return (timeLeft as any).format();
  }

  if (countdownSettings.customFormat) {
    return (timeLeft as any).format(countdownSettings.customFormat);
  }

  let previous = '';

  if (timeLeft.years() > 0) {
    formattedTimeLeft = timeLeft.years() === 1 ? '1 year, ' : timeLeft.years() + ' years, ';
    previous = 'years';
  }
  if (timeLeft.months() > 0 || previous === 'years') {
    formattedTimeLeft += timeLeft.months() === 1 ? '1 month, ' : timeLeft.months() + ' months, ';
    previous = 'months';
  }
  if (timeLeft.days() > 0 || previous === 'months') {
    formattedTimeLeft += timeLeft.days() === 1 ? '1 day, ' : timeLeft.days() + ' days, ';
    previous = 'days';
  }
  if (timeLeft.hours() > 0 || previous === 'days') {
    formattedTimeLeft += timeLeft.hours() === 1 ? '1 hour, ' : timeLeft.hours() + ' hours, ';
    previous = 'hours';
  }

  if (timeLeft.minutes() > 0 || previous === 'hours') {
    formattedTimeLeft += timeLeft.minutes() === 1 ? '1 minute, ' : timeLeft.minutes() + ' minutes, ';
  }

  formattedTimeLeft += timeLeft.seconds() === 1 ? '1 second ' : timeLeft.seconds() + ' seconds';
  return formattedTimeLeft;
}

function getCountupText({
  countupSettings,
  timezone,
  data,
  replaceVariables,
  now,
}: {
  countupSettings: ClockOptions['countupSettings'];
  timezone: ClockOptions['timezone'];
  replaceVariables: PanelProps['replaceVariables'];
  data: PanelData;
  now: Moment;
}): string {
  let timePassed = moment.duration(0);

  switch (countupSettings.source) {
    case ClockSource.input:
      if (!countupSettings.beginCountupTime) {
        return countupSettings.beginText;
      }

      timePassed = moment.duration(
        moment(now).diff(
          moment(replaceVariables(countupSettings.beginCountupTime)).utcOffset(getMoment(timezone).format('Z'), true)
        )
      );
      break;
    case ClockSource.query:
      if (data.state === 'Done' && data.series.length > 0) {
        let field_name = countupSettings.queryField;
        if (
          !field_name ||
          field_name.length === 0 ||
          !data.series ||
          data.series.length === 0 ||
          !data.series[0].fields
        ) {
          return countupSettings.beginText;
        }

        let field: Field | undefined =
          data.series[0].fields.find((field: Field) => field.name === field_name) ?? undefined;
        if (!field) {
          return countupSettings.beginText;
        }

        let field_values = field.values;
        if (!field_values || field_values.length === 0) {
          return countupSettings.beginText;
        }

        let value: Moment | undefined = moment();
        switch (countupSettings.queryCalculation) {
          case CountupQueryCalculation.lastNotNull:
            value = moment(field_values.filter((v: any) => v !== null && !Number.isNaN(v)).at(-1));
            break;
          case CountupQueryCalculation.last:
            value = moment(field_values.at(-1));
            break;
          case CountupQueryCalculation.firstNotNull:
            value = moment(field_values.filter((v: any) => v !== null && !Number.isNaN(v))[0]);
            break;
          case CountupQueryCalculation.first:
            value = moment(field_values[0]);
            break;
          case CountupQueryCalculation.min:
            value = field_values.map((v: any) => moment(v)).sort()[0];
            break;
          case CountupQueryCalculation.max:
            value = field_values
              .map((v: any) => moment(v))
              .sort()
              .at(-1);
            break;
          case CountupQueryCalculation.maxPast:
            value = field_values
              .map((v: any) => moment(v))
              .filter((v: any) => v.isBefore(now))
              .sort()
              .at(-1);
            break;
        }

        if (!value || value.isValid() === false) {
          return countupSettings.beginText;
        }

        timePassed = moment.duration(now.diff(value));
      }
      break;
  }

  let formattedTimePassed = '';

  if (timePassed.asSeconds() <= 0) {
    return countupSettings.beginText;
  }

  if (countupSettings.customFormat === 'auto') {
    return (timePassed as any).format();
  }

  if (countupSettings.customFormat) {
    return (timePassed as any).format(countupSettings.customFormat);
  }

  let previous = '';

  if (timePassed.years() > 0) {
    formattedTimePassed = timePassed.years() === 1 ? '1 year, ' : timePassed.years() + ' years, ';
    previous = 'years';
  }
  if (timePassed.months() > 0 || previous === 'years') {
    formattedTimePassed += timePassed.months() === 1 ? '1 month, ' : timePassed.months() + ' months, ';
    previous = 'months';
  }
  if (timePassed.days() > 0 || previous === 'months') {
    formattedTimePassed += timePassed.days() === 1 ? '1 day, ' : timePassed.days() + ' days, ';
    previous = 'days';
  }
  if (timePassed.hours() > 0 || previous === 'days') {
    formattedTimePassed += timePassed.hours() === 1 ? '1 hour, ' : timePassed.hours() + ' hours, ';
    previous = 'hours';
  }

  if (timePassed.minutes() > 0 || previous === 'hours') {
    formattedTimePassed += timePassed.minutes() === 1 ? '1 minute, ' : timePassed.minutes() + ' minutes, ';
  }

  formattedTimePassed += timePassed.seconds() === 1 ? '1 second ' : timePassed.seconds() + ' seconds';
  return formattedTimePassed;
}

function getTimeFormat(clockType: ClockType, timeSettings: TimeSettings): string {
  if (clockType === ClockType.Custom && timeSettings.customFormat) {
    return timeSettings.customFormat;
  }

  if (clockType === ClockType.H12) {
    return 'h:mm:ss A';
  }

  return 'HH:mm:ss';
}

export function RenderTime({
  now,
  replaceVariables,
  timezone,
  data,
  options,
}: {
  now: Moment;
  timezone: ClockOptions['timezone'];
  replaceVariables: PanelProps['replaceVariables'];
  data: PanelData;
  options: ClockOptions;
}) {
  const { clockType, timeSettings, mode } = options;
  const className = useMemo(() => {
    return css`
      font-size: ${timeSettings.fontSize};
      font-family: ${options.fontMono ? 'monospace' : ''};
      font-weight: ${timeSettings.fontWeight};
      margin: 0;
    `;
  }, [options.fontMono, timeSettings.fontSize, timeSettings.fontWeight]);

  let display = '';
  switch (mode) {
    case ClockMode.countdown:
      display = getCountdownText({
        countdownSettings: options.countdownSettings,
        data: data,
        timezone: timezone,
        replaceVariables,
        now,
      });
      break;
    case ClockMode.countup:
      display = getCountupText({
        countupSettings: options.countupSettings,
        data: data,
        timezone: timezone,
        replaceVariables,
        now,
      });
      break;
    default:
      display = now.format(getTimeFormat(clockType, timeSettings));
      break;
  }

  return <h2 className={className}>{display}</h2>;
}
