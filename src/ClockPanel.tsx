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
  const [tickNow, setTickNow] = useState<Moment>(() => getMoment(timezoneToUse));
  const interaction = useMemo(() => ({ clock_style: options.style || ClockStyle.text }), [options.style]);
  useInteraction('clock_panel_on_render', interaction);

  // Clock refresh every second
  useEffect(() => {
    if (props.options.refresh === ClockRefresh.sec) {
      const timer = setInterval(() => setTickNow(getMoment(timezoneToUse)), 1000);
      return () => clearInterval(timer);
    }
    return;
  }, [props.options.refresh, timezoneToUse]);

  // Clock refresh only on dashboard refresh — recompute during render on every
  // dashboard-triggered re-render instead of scheduling a state update from an effect.
  const now = props.options.refresh === ClockRefresh.dashboard ? getMoment(timezoneToUse) : tickNow;

  let [targetTime, descriptionText, err]: [Moment, string, string | null] = useMemo(() => {
    return CalculateClockOptions({
      options: props.options,
      timezone: timezoneToUse,
      data,
      replaceVariables: props.replaceVariables,
      now,
    });
  }, [props.options, timezoneToUse, data, props.replaceVariables, now]);

  // No stale-query notice is rendered here. Grafana 13 injects and executes a default query on
  // every panel regardless of what the panel JSON stores (verified on 13.0.2 with targets
  // omitted, targets: [] and targets: [] + datasource: null), and resolves it against the org
  // default datasource even when the panel names another one. On a datasource that rejects an
  // empty query the result is an error the panel cannot attribute, cannot clear, and cannot
  // advise on — Grafana core already surfaces it. See issue #535.
  return (
    <div
      className={panel}
      data-testid={TEST_IDS.clockPanel}
      style={{
        width,
        height,
        position: 'relative',
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
