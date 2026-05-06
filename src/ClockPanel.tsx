import { LoadingState, PanelProps } from '@grafana/data';
import { t } from '@grafana/i18n';
import React, { useEffect, useMemo, useState } from 'react';
import { ClockOptions, ClockRefresh, ClockSource, ClockStyle, DescriptionSource } from './types';

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

  // Detect panels that don't use a datasource query but have a stale target causing errors.
  // This can happen when migration couldn't clear the target (e.g., Grafana 12 readonly
  // targets with no Grafana built-in datasource registered).
  const isNonQueryPanel =
    options.countdownSettings?.source !== ClockSource.query &&
    options.countupSettings?.source !== ClockSource.query &&
    options.descriptionSettings?.source !== DescriptionSource.query;
  const hasDataErrors =
    data.state === LoadingState.Error || (Array.isArray(data.errors) && data.errors.length > 0);
  const showStaleQueryNotice = isNonQueryPanel && hasDataErrors;

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
      {showStaleQueryNotice && (
        <div
          data-testid={TEST_IDS.clockPanel + '-stale-query-notice'}
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            padding: '6px 10px',
            background: 'rgba(229, 84, 84, 0.12)',
            border: '1px solid rgba(229, 84, 84, 0.5)',
            borderRadius: 4,
            fontSize: '12px',
            color: '#e55454',
            pointerEvents: 'none',
          }}
        >
          {t(
            'ClockPanel.staleQueryNotice.message',
            'This panel does not use a datasource query. A stale query is causing an error. Open the Query tab and remove all queries to clear this warning.'
          )}
        </div>
      )}
    </div>
  );
}
