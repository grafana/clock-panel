import { PanelProps } from '@grafana/data';
import React, { useEffect, useMemo, useState } from 'react';
import { ClockOptions, ClockRefresh, ClockStyle, DescriptionSource } from './types';

import { RenderDate } from 'components/RenderDate';
import { RenderTime } from 'components/RenderTime';
import { RenderZone } from 'components/RenderZone';
import { Moment } from 'moment-timezone';
import { getMoment } from 'utils';
import './external/moment-duration-format';
import { CalculateClockOptions } from 'components/CalculateClockOptions';
import { RenderDescription } from 'components/RenderDescription';
import { useInteraction } from 'hooks/useInteraction';
import { useClockStyles } from 'hooks/useClockStyles';
import { TEST_IDS } from './constants';

interface Props extends PanelProps<ClockOptions> {}

export function ClockPanel(props: Props) {
  const { options, width, height, data } = props;
  const { panel } = useClockStyles(options);
  const { timezone: optionsTimezone, dateSettings, timezoneSettings } = options;
  const { timeZone: dashboardTimezone } = props;
  const timezoneToUse = optionsTimezone === 'dashboard' ? dashboardTimezone : (optionsTimezone ?? '');
  const [now, setNow] = useState<Moment>(getMoment(timezoneToUse));
  const interaction = useMemo(() => ({ clock_style: options.style || ClockStyle.text }), [options.style]);
  useInteraction('clock_panel_on_render', interaction);

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
      className={panel}
      data-testid={TEST_IDS.clockPanel}
      style={{
        width,
        height,
      }}
    >
      {dateSettings.showDate ? <RenderDate now={now} options={props.options} width={width} height={height} /> : null}
      <RenderTime options={props.options} targetTime={targetTime} err={err} now={now} width={width} height={height} />
      {timezoneSettings.showTimezone ? (
        <RenderZone now={now} options={props.options} timezone={timezoneToUse} width={width} height={height} />
      ) : null}
      {props.options.descriptionSettings.source !== DescriptionSource.none ? (
        <RenderDescription options={props.options} descriptionText={descriptionText} width={width} height={height} />
      ) : null}
    </div>
  );
}
