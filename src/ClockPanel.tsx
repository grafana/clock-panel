import React, { useEffect, useState } from 'react';
import { PanelProps } from '@grafana/data';
import { withTheme2, Themeable2 } from '@grafana/ui';
import { ClockOptions, ClockType, ZoneFormat, ClockMode, ClockRefresh, TimeSettings } from './types';
import { css } from '@emotion/css';

// eslint-disable-next-line
import moment, { Moment } from 'moment-timezone';
import './external/moment-duration-format';
import { getTemplateSrv } from '@grafana/runtime';

interface Props extends Themeable2, PanelProps<ClockOptions> {}

export function getTimeZoneNames(): string[] {
  return (moment as any).tz.names();
}

function getMoment(tz?: string): Moment {
  if (!tz) {
    tz = (moment as any).tz.guess();
  } else {
    tz = getTemplateSrv().replace(tz);
  }
  return (moment() as any).tz(tz);
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

export function ClockPanelFunctional(props: Props) {
  const [now, setNow] = useState<Moment>(getMoment(props.options.timezone));
  const { options, width, height, theme } = props;
  const { timezone, dateSettings, timezoneSettings, bgColor } = options;

  const className = css`
    display: flex;
    align-items: center;
    justify-content: center;
    flex-flow: column wrap;
    text-align: center;
    background-color: ${!bgColor ? theme.colors.background.primary : theme.v1.visualization.getColorByName(bgColor)};
  `;

  // Clock refresh only on dashboard refresh
  useEffect(() => {
    if (props.options.refresh === ClockRefresh.dashboard) {
      setNow(getMoment(props.options.timezone));
    }
  }, [props]);

  // Clock refresh every second
  useEffect(() => {
    if (props.options.refresh === ClockRefresh.sec) {
      const timer = setInterval(() => setNow(getMoment(timezone)), 1000);
      return () => clearInterval(timer);
    }
    return;
  }, [props.options.refresh, timezone]);

  function getCountdownText(): string {
    const { countdownSettings, timezone } = props.options;

    if (!countdownSettings.endCountdownTime) {
      return countdownSettings.endText;
    }

    const timeLeft = moment.duration(
      moment(props.replaceVariables(countdownSettings.endCountdownTime))
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

  function getCountupText(): string {
    const { countupSettings, timezone } = props.options;

    if (!countupSettings.beginCountupTime) {
      return countupSettings.beginText;
    }

    const timePassed = moment.duration(
      moment(now).diff(
        moment(props.replaceVariables(countupSettings.beginCountupTime)).utcOffset(
          getMoment(timezone).format('Z'),
          true
        )
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

  function renderZone() {
    const { timezoneSettings } = props.options;
    const { zoneFormat } = timezoneSettings;

    const className = css`
      font-size: ${timezoneSettings.fontSize};
      font-weight: ${timezoneSettings.fontWeight};
      line-height: 1.4;
    `;

    let zone = props.options.timezone || '';

    switch (zoneFormat) {
      case ZoneFormat.offsetAbbv:
        zone = now.format('Z z');
        break;
      case ZoneFormat.offset:
        zone = now.format('Z');
        break;
      case ZoneFormat.abbv:
        zone = now.format('z');
        break;
      default:
        try {
          zone = (getMoment(zone) as any)._z.name;
        } catch (e) {
          console.error('Error getting timezone', e);
        }
    }

    return (
      <h4 className={className}>
        {zone}
        {zoneFormat === ZoneFormat.nameOffset && (
          <>
            <br />({now.format('Z z')})
          </>
        )}
      </h4>
    );
  }

  function renderDate() {
    const { dateSettings } = props.options;

    const className = css`
      font-size: ${dateSettings.fontSize};
      font-weight: ${dateSettings.fontWeight};
    `;

    const display = now.locale(dateSettings.locale || '').format(dateSettings.dateFormat);

    return (
      <span>
        <h3 className={className}>{display}</h3>
      </span>
    );
  }

  function renderTime() {
    const { timeSettings, clockType, mode } = props.options;

    const className = css`
      font-size: ${timeSettings.fontSize};
      font-weight: ${timeSettings.fontWeight};
    `;

    let display = '';
    switch (mode) {
      case ClockMode.countdown:
        display = getCountdownText();
        break;
      case ClockMode.countup:
        display = getCountupText();
        break;
      default:
        display = now.format(getTimeFormat(clockType, timeSettings));
        break;
    }

    return <h2 className={className}>{display}</h2>;
  }

  return (
    <div
      className={className}
      style={{
        width,
        height,
      }}
    >
      {dateSettings.showDate && renderDate()}
      {renderTime()}
      {timezoneSettings.showTimezone && renderZone()}
    </div>
  );
}

export const ClockPanel = withTheme2(ClockPanelFunctional);
