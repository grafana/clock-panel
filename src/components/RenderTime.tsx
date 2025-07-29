import { css } from '@emotion/css';
import { t } from '@grafana/i18n';
import moment, { Moment } from 'moment-timezone';
import React, { useMemo } from 'react';
import { ClockMode, ClockOptions, ClockType, TimeSettings } from 'types';

function getCountdownText({
  countdownSettings,
  targetTime,
  now,
}: {
  countdownSettings: ClockOptions['countdownSettings'];
  targetTime: Moment;
  now: Moment;
}): string {
  let timeDiff = moment.duration(targetTime.diff(now));
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
    formattedTimeLeft =
      timeDiff.years() === 1 ? t('renderTime.year', '1 year, ') : timeDiff.years() + t('renderTime.years', ' years, ');
    previous = 'years';
  }
  if (timeDiff.months() > 0 || previous === 'years') {
    formattedTimeLeft +=
      timeDiff.months() === 1
        ? t('renderTime.month', '1 month, ')
        : timeDiff.months() + t('renderTime.months', ' months, ');
    previous = 'months';
  }
  if (timeDiff.days() > 0 || previous === 'months') {
    formattedTimeLeft +=
      timeDiff.days() === 1 ? t('renderTime.day', '1 day, ') : timeDiff.days() + t('renderTime.days', ' days, ');
    previous = 'days';
  }
  if (timeDiff.hours() > 0 || previous === 'days') {
    formattedTimeLeft +=
      timeDiff.hours() === 1 ? t('renderTime.hour', '1 hour, ') : timeDiff.hours() + t('renderTime.hours', ' hours, ');
    previous = 'hours';
  }

  if (timeDiff.minutes() > 0 || previous === 'hours') {
    formattedTimeLeft +=
      timeDiff.minutes() === 1
        ? t('renderTime.minute', '1 minute, ')
        : timeDiff.minutes() + t('renderTime.minutes', ' minutes, ');
  }

  formattedTimeLeft +=
    timeDiff.seconds() === 1
      ? t('renderTime.second', '1 second ')
      : timeDiff.seconds() + t('renderTime.seconds', ' seconds');
  return formattedTimeLeft;
}

function getCountupText({
  countupSettings,
  targetTime,
  now,
}: {
  countupSettings: ClockOptions['countupSettings'];
  targetTime: Moment;
  now: Moment;
}): string {
  let timeDiff = moment.duration(now.diff(targetTime));
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
    formattedTimePassed =
      timeDiff.years() === 1 ? t('renderTime.year', '1 year, ') : timeDiff.years() + t('renderTime.years', ' years, ');
    previous = 'years';
  }
  if (timeDiff.months() > 0 || previous === 'years') {
    formattedTimePassed +=
      timeDiff.months() === 1
        ? t('renderTime.month', '1 month, ')
        : timeDiff.months() + t('renderTime.months', ' months, ');
    previous = 'months';
  }
  if (timeDiff.days() > 0 || previous === 'months') {
    formattedTimePassed +=
      timeDiff.days() === 1 ? t('renderTime.day', '1 day, ') : timeDiff.days() + t('renderTime.days', ' days, ');
    previous = 'days';
  }
  if (timeDiff.hours() > 0 || previous === 'days') {
    formattedTimePassed +=
      timeDiff.hours() === 1 ? t('renderTime.hour', '1 hour, ') : timeDiff.hours() + t('renderTime.hours', ' hours, ');
    previous = 'hours';
  }

  if (timeDiff.minutes() > 0 || previous === 'hours') {
    formattedTimePassed +=
      timeDiff.minutes() === 1
        ? t('renderTime.minute', '1 minute, ')
        : timeDiff.minutes() + t('renderTime.minutes', ' minutes, ');
  }

  formattedTimePassed +=
    timeDiff.seconds() === 1
      ? t('renderTime.second', '1 second ')
      : timeDiff.seconds() + t('renderTime.seconds', ' seconds');
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
  targetTime,
  err,
}: {
  now: moment.Moment;
  options: ClockOptions;
  targetTime: moment.Moment;
  err: string | null;
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
  if (err !== null) {
    return <h2 className={className}>{err}</h2>;
  }

  switch (mode) {
    case ClockMode.countdown:
      display = getCountdownText({
        countdownSettings: options.countdownSettings,
        targetTime: targetTime,
        now: now,
      });
      break;
    case ClockMode.countup:
      display = getCountupText({
        countupSettings: options.countupSettings,
        targetTime: targetTime,
        now: now,
      });
      break;
    default:
      display = targetTime.format(getTimeFormat(clockType, timeSettings));
      break;
  }

  return <h2 className={className}>{display}</h2>;
}
