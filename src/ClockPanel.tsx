import { css } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';
import React, { useEffect, useMemo, useState } from 'react';
import { ClockOptions, ClockRefresh } from './types';

// eslint-disable-next-line
import { RenderDate } from 'components/RenderDate';
import { RenderTime } from 'components/RenderTime';
import { RenderZone } from 'components/RenderZone';
import { Moment } from 'moment-timezone';
import { getMoment } from 'utils';
import './external/moment-duration-format';

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

  return (
    <div
      className={className}
      style={{
        width,
        height,
      }}
    >
      {dateSettings.showDate ? <RenderDate now={now} options={props.options} /> : null}
      <RenderTime now={now} replaceVariables={props.replaceVariables} options={props.options} />
      {timezoneSettings.showTimezone ? <RenderZone now={now} options={props.options} /> : null}
    </div>
  );
}
