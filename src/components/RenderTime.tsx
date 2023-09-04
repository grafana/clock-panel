import { css } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import moment, { Moment } from 'moment-timezone';
import React, { useMemo } from 'react';
import { ClockMode, ClockOptions, ClockType, TimeSettings } from 'types';
import { getMoment } from 'utils';

function getCountdownText({
  countdownSettings,
  timezone,
  replaceVariables,
  now,
}: {
  countdownSettings: ClockOptions['countdownSettings'];
  timezone: ClockOptions['timezone'];
  replaceVariables: PanelProps['replaceVariables'];
  now: Moment;
}): string {
  if (!countdownSettings.endCountdownTime) {
    return countdownSettings.endText;
  }

  const timeLeft = moment.duration(
    moment(replaceVariables(countdownSettings.endCountdownTime))
      .utcOffset(getMoment(timezone).format('Z'), true)
      .diff(now)
  );
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
  replaceVariables,
  now,
}: {
  countupSettings: ClockOptions['countupSettings'];
  timezone: ClockOptions['timezone'];
  replaceVariables: PanelProps['replaceVariables'];
  now: Moment;
}): string {
  if (!countupSettings.beginCountupTime) {
    return countupSettings.beginText;
  }

  const timePassed = moment.duration(
    moment(now).diff(
      moment(replaceVariables(countupSettings.beginCountupTime)).utcOffset(getMoment(timezone).format('Z'), true)
    )
  );

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
  options,
}: {
  now: Moment;
  replaceVariables: PanelProps['replaceVariables'];
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
        timezone: options.timezone,
        replaceVariables,
        now,
      });
      break;
    case ClockMode.countup:
      display = getCountupText({
        countupSettings: options.countupSettings,
        timezone: options.timezone,
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
