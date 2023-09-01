import { css } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';
import React, { useEffect, useMemo, useState } from 'react';
import { ClockOptions, ClockRefresh, ZoneFormat } from './types';

// eslint-disable-next-line
import { RenderTime } from 'components/RenderTime';
import { Moment } from 'moment-timezone';
import './external/moment-duration-format';
import { getMoment } from 'utils';

interface Props extends PanelProps<ClockOptions> {}

export function ClockPanel(props: Props) {
  const [now, setNow] = useState<Moment>(getMoment(props.options.timezone));
  const { options, width, height } = props;
  const theme = useTheme2();
  const { timezone, dateSettings, timezoneSettings } = options;

  const className = useMemo(() => {
    return css`
      display: flex;
      align-items: center;
      justify-content: center;
      flex-flow: column wrap;
      text-align: center;
      background-color: ${!options.bgColor
        ? theme.colors.background.primary
        : theme.v1.visualization.getColorByName(options.bgColor)};
    `;
  }, [options.bgColor, theme]);

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

  function renderZone() {
    const { timezoneSettings } = props.options;
    const { zoneFormat } = timezoneSettings;

    const className = css`
      font-size: ${timezoneSettings.fontSize};
      font-weight: ${timezoneSettings.fontWeight};
      line-height: 1.4;
      margin: 0;
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

  function RenderDate() {
    const { dateSettings } = props.options;

    const className = useMemo(() => {
      return css`
        font-size: ${dateSettings.fontSize};
        font-weight: ${dateSettings.fontWeight};
        margin: 0;
      `;
    }, [dateSettings]);

    const display = now.locale(dateSettings.locale || '').format(dateSettings.dateFormat);

    return (
      <span>
        <h3 className={className}>{display}</h3>
      </span>
    );
  }

  return (
    <div
      className={className}
      style={{
        width,
        height,
      }}
    >
      {dateSettings.showDate && RenderDate()}
      <RenderTime now={now} replaceVariables={props.replaceVariables} options={props.options} />
      {timezoneSettings.showTimezone && renderZone()}
    </div>
  );
}
