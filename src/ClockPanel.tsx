import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { withTheme2, Themeable2 } from '@grafana/ui';
import { ClockOptions, ClockType, ZoneFormat, ClockMode, ClockRefresh } from './types';
import { css } from '@emotion/css';

// eslint-disable-next-line
import moment, { Moment } from 'moment-timezone';
import './external/moment-duration-format';
import { getTemplateSrv } from '@grafana/runtime';

interface Props extends Themeable2, PanelProps<ClockOptions> {}
interface State {
  // eslint-disable-next-line
  now: Moment;
}

export function getTimeZoneNames(): string[] {
  return (moment as any).tz.names();
}

class UnthemedClockPanel extends PureComponent<Props, State> {
  timerID?: any = 0;
  state = { now: this.getTZ(), timezone: '' };

  componentDidMount() {
    this.initTimers();
  }

  componentDidUpdate(prevProps: Props) {
    const { options, data } = this.props;
    const { options: prevOptions, data: prevData } = prevProps;

    if (options.refresh !== prevOptions.refresh) {
      this.initTimers();
    }

    if (prevData !== data) {
      this.onPanelRefresh();
    }
  }

  initTimers = () => {
    const { refresh } = this.props.options;

    if (this.timerID) {
      clearInterval(this.timerID);
      this.timerID = 0;
    }

    if (refresh === ClockRefresh.dashboard) {
      return this.tick();
    }

    const delay = 1000; // 1sec
    this.timerID = setInterval(
      () => this.tick(),
      delay // 1 second or 1 min
    );
  };

  onPanelRefresh = () => {
    const { refresh } = this.props.options;
    if (refresh === ClockRefresh.dashboard) {
      this.tick();
    }
  };

  componentWillUnmount() {
    if (this.timerID) {
      clearInterval(this.timerID);
      this.timerID = 0;
    }
  }

  tick() {
    const { timezone } = this.props.options;
    this.setState({ now: this.getTZ(timezone) });
  }

  getTimeFormat() {
    const { clockType, timeSettings } = this.props.options;

    if (clockType === ClockType.Custom && timeSettings.customFormat) {
      return timeSettings.customFormat;
    }

    if (clockType === ClockType.H12) {
      return 'h:mm:ss A';
    }

    return 'HH:mm:ss';
  }

  // Return a new moment instnce in the selected timezone
  // eslint-disable-next-line
  getTZ(tz?: string): Moment {
    if (!tz) {
      tz = (moment as any).tz.guess();
    } else {
      tz = getTemplateSrv().replace(tz);
    }
    return (moment() as any).tz(tz);
  }

  getCountdownText(): string {
    const { now } = this.state;
    const { countdownSettings, timezone } = this.props.options;

    if (!countdownSettings.endCountdownTime) {
      return countdownSettings.endText;
    }

    const timeLeft = moment.duration(
      moment(this.props.replaceVariables(countdownSettings.endCountdownTime))
        .utcOffset(this.getTZ(timezone).format('Z'), true)
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

  getCountupText(): string {
    const { now } = this.state;
    const { countupSettings, timezone } = this.props.options;

    if (!countupSettings.beginCountupTime) {
      return countupSettings.beginText;
    }

    const timePassed = moment.duration(
      moment(now).diff(
        moment(this.props.replaceVariables(countupSettings.beginCountupTime)).utcOffset(
          this.getTZ(timezone).format('Z'),
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

  renderZone() {
    const { now } = this.state;
    const { timezoneSettings } = this.props.options;
    const { zoneFormat } = timezoneSettings;

    const clazz = css`
      font-size: ${timezoneSettings.fontSize};
      font-weight: ${timezoneSettings.fontWeight};
      line-height: 1.4;
    `;

    let zone = this.props.options.timezone || '';

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
          zone = (this.getTZ(zone) as any)._z.name;
        } catch (e) {
          console.log('Error getting timezone', e);
        }
    }

    return (
      <h4 className={clazz}>
        {zone}
        {zoneFormat === ZoneFormat.nameOffset && (
          <>
            <br />({now.format('Z z')})
          </>
        )}
      </h4>
    );
  }

  renderDate() {
    const { now } = this.state;
    const { dateSettings } = this.props.options;

    const clazz = css`
      font-size: ${dateSettings.fontSize};
      font-weight: ${dateSettings.fontWeight};
    `;

    const disp = now.locale(dateSettings.locale || '').format(dateSettings.dateFormat);
    return (
      <span>
        <h3 className={clazz}>{disp}</h3>
      </span>
    );
  }

  renderTime() {
    const { now } = this.state;
    const { options } = this.props;
    const { timeSettings, mode } = options;

    const clazz = css`
      font-size: ${timeSettings.fontSize};
      font-weight: ${timeSettings.fontWeight};
    `;

    var disp = now.format(this.getTimeFormat());
    if (mode === ClockMode.countdown) {
      disp = this.getCountdownText();
    } else if (mode === ClockMode.countup) {
      disp = this.getCountupText();
    }

    return <h2 className={clazz}>{disp}</h2>;
  }

  render() {
    const { options, width, height, theme } = this.props;
    const { dateSettings, timezoneSettings, bgColor } = options;

    const clazz = css`
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      text-align: center;
      background-color: ${!bgColor ? theme.colors.background.primary : theme.v1.visualization.getColorByName(bgColor)};
    `;

    return (
      <div
        className={clazz}
        style={{
          width,
          height,
        }}
      >
        {dateSettings.showDate && this.renderDate()}
        {this.renderTime()}
        {timezoneSettings.showTimezone && this.renderZone()}
      </div>
    );
  }
}

export const ClockPanel = withTheme2(UnthemedClockPanel);
