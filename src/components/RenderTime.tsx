import { css } from '@emotion/css';
import moment, { Moment } from 'moment-timezone';
import React, { useMemo } from 'react';
import { ClockMode, ClockOptions, ClockType, TimeSettings } from 'types';

function getCountdownText({
  countdownSettings,
  time,
  now,
}: {
  countdownSettings: ClockOptions['countdownSettings'];
  time: Moment;
  now: Moment;
}): string {
  let timeDiff = moment.duration(time.diff(now));
  if (timeDiff.asSeconds() <= 0) {
    return countdownSettings.endText;
  }

  if (countdownSettings.customFormat === 'auto') {
    return (timeDiff as any).format();
  }

  if (countdownSettings.customFormat) {
    return (timeDiff as any).format(countdownSettings.customFormat);
  }

  let formattedTimeLeft = '';
  let previous = '';

  if (timeDiff.years() > 0) {
    formattedTimeLeft = timeDiff.years() === 1 ? '1 year, ' : timeDiff.years() + ' years, ';
    previous = 'years';
  }
  if (timeDiff.months() > 0 || previous === 'years') {
    formattedTimeLeft += timeDiff.months() === 1 ? '1 month, ' : timeDiff.months() + ' months, ';
    previous = 'months';
  }
  if (timeDiff.days() > 0 || previous === 'months') {
    formattedTimeLeft += timeDiff.days() === 1 ? '1 day, ' : timeDiff.days() + ' days, ';
    previous = 'days';
  }
  if (timeDiff.hours() > 0 || previous === 'days') {
    formattedTimeLeft += timeDiff.hours() === 1 ? '1 hour, ' : timeDiff.hours() + ' hours, ';
    previous = 'hours';
  }

  if (timeDiff.minutes() > 0 || previous === 'hours') {
    formattedTimeLeft += timeDiff.minutes() === 1 ? '1 minute, ' : timeDiff.minutes() + ' minutes, ';
  }

  formattedTimeLeft += timeDiff.seconds() === 1 ? '1 second ' : timeDiff.seconds() + ' seconds';
  return formattedTimeLeft;
}

function getCountupText({
  countupSettings,
  time,
  now,
}: {
  countupSettings: ClockOptions['countupSettings'];
  time: Moment;
  now: Moment;
}): string {
  let timeDiff = moment.duration(now.diff(time));
  if (timeDiff.asSeconds() <= 0) {
    return countupSettings.beginText;
  }

  if (countupSettings.customFormat === 'auto') {
    return (timeDiff as any).format();
  }

  if (countupSettings.customFormat) {
    return (timeDiff as any).format(countupSettings.customFormat);
  }

  let formattedTimePassed = '';
  let previous = '';

  if (timeDiff.years() > 0) {
    formattedTimePassed = timeDiff.years() === 1 ? '1 year, ' : timeDiff.years() + ' years, ';
    previous = 'years';
  }
  if (timeDiff.months() > 0 || previous === 'years') {
    formattedTimePassed += timeDiff.months() === 1 ? '1 month, ' : timeDiff.months() + ' months, ';
    previous = 'months';
  }
  if (timeDiff.days() > 0 || previous === 'months') {
    formattedTimePassed += timeDiff.days() === 1 ? '1 day, ' : timeDiff.days() + ' days, ';
    previous = 'days';
  }
  if (timeDiff.hours() > 0 || previous === 'days') {
    formattedTimePassed += timeDiff.hours() === 1 ? '1 hour, ' : timeDiff.hours() + ' hours, ';
    previous = 'hours';
  }

  if (timeDiff.minutes() > 0 || previous === 'hours') {
    formattedTimePassed += timeDiff.minutes() === 1 ? '1 minute, ' : timeDiff.minutes() + ' minutes, ';
  }

  formattedTimePassed += timeDiff.seconds() === 1 ? '1 second ' : timeDiff.seconds() + ' seconds';
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
  options,
  time,
  err,
}: {
  now: moment.Moment;
  options: ClockOptions;
  time: moment.Moment;
  err: string | undefined;
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
  if (err !== undefined) {
    return <h2 className={className}>{err}</h2>;
  }

  switch (mode) {
    case ClockMode.countdown:
      display = getCountdownText({
        countdownSettings: options.countdownSettings,
        time: time,
        now: now,
      });
      break;
    case ClockMode.countup:
      display = getCountupText({
        countupSettings: options.countupSettings,
        time: time,
        now: now,
      });
      break;
    default:
      display = time.format(getTimeFormat(clockType, timeSettings));
      break;
  }

  return <h2 className={className}>{display}</h2>;
}
