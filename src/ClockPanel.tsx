import { css } from '@emotion/css';
import { PanelProps } from '@grafana/data';
import { useTheme2 } from '@grafana/ui';
import React, { useEffect, useMemo, useState } from 'react';
import { ClockOptions, ClockRefresh, DescriptionSource } from './types';

import { RenderDate } from 'components/RenderDate';
import { RenderTime } from 'components/RenderTime';
import { RenderZone } from 'components/RenderZone';
import { Moment } from 'moment-timezone';
import { getMoment } from 'utils';
import './external/moment-duration-format';
import { CalculateClockOptions } from 'components/CalculateClockOptions';
import { RenderDescription } from 'components/RenderDescription';

interface Props extends PanelProps<ClockOptions> {}

export function ClockPanel(props: Props) {
  const { options, width, height, data } = props;
  const theme = useTheme2();
  const { timezone: optionsTimezone, dateSettings, timezoneSettings } = options;
  // notice the uppercase Z.
  const { timeZone: dashboardTimezone } = props;
  const timezoneToUse = optionsTimezone === 'dashboard' ? dashboardTimezone : (optionsTimezone ?? '');
  const [now, setNow] = useState<Moment>(getMoment(timezoneToUse));

  const className = useMemo(() => {
    return css`
      display: flex;
      align-items: center;
      justify-content: center;
      flex-flow: column wrap;
      font-family: ${options.fontMono ? 'monospace' : ''};
      text-align: center;
      background-color: ${!options.bgColor
        ? theme.colors.background.primary
        : theme.visualization.getColorByName(options.bgColor)};
    `;
  }, [options.bgColor, options.fontMono, theme]);

  // Clock refresh only on dashboard refresh
  useEffect(() => {
    if (props.options.refresh === ClockRefresh.dashboard) {
      setNow(getMoment(timezoneToUse));
    }
  }, [props, timezoneToUse]);

  // Clock refresh every second
  useEffect(() => {
    if (props.options.refresh === ClockRefresh.sec) {
      const timer = setInterval(() => setNow(getMoment(timezoneToUse)), 1000);
      return () => clearInterval(timer);
    }
    return;
  }, [props.options.refresh, timezoneToUse]);

  //refresh the time
  let [targetTime, descriptionText, err]: [Moment, string, string | null] = useMemo(() => {
    return CalculateClockOptions({
      options: props.options,
      timezone: timezoneToUse,
      data,
      replaceVariables: props.replaceVariables,
      now,
    });
  }, [props.options, timezoneToUse, data, props.replaceVariables, now]);

  return (
    <div
      className={className}
      style={{
        width,
        height,
      }}
    >
      {dateSettings.showDate ? <RenderDate now={now} options={props.options} /> : null}
      <RenderTime options={props.options} targetTime={targetTime} err={err} now={now} />
      {timezoneSettings.showTimezone ? <RenderZone now={now} options={props.options} timezone={timezoneToUse} /> : null}
      {props.options.descriptionSettings.source !== DescriptionSource.none ? (
        <RenderDescription options={props.options} descriptionText={descriptionText} />
      ) : null}
    </div>
  );
}
