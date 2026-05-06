import { LoadingState, PanelProps } from '@grafana/data';
import { t } from '@grafana/i18n';
import { useTheme2 } from '@grafana/ui';
import React, { useEffect, useMemo, useState } from 'react';
import { ClockOptions, ClockMode, ClockRefresh, ClockSource, ClockStyle, DescriptionSource } from './types';

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
  const theme = useTheme2();
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

  // Show a notice when an input-only panel has a stale query running — either because
  // migration couldn't clear it (e.g., Grafana 12 readonly targets) or because Grafana's
  // query editor re-added a default target row after the user opened and saved the panel.
  // Only the source that matches the active mode is actually consumed by CalculateClockOptions;
  // a stale source='query' on the inactive mode must not suppress the notice.
  const activeSourceIsQuery =
    options.descriptionSettings?.source === DescriptionSource.query ||
    (options.mode === ClockMode.countdown && options.countdownSettings?.source === ClockSource.query) ||
    (options.mode === ClockMode.countup && options.countupSettings?.source === ClockSource.query);
  const isNonQueryPanel = !activeSourceIsQuery;
  const hasDataErrors =
    data.state === LoadingState.Error || (Array.isArray(data.errors) && data.errors.length > 0);
  const hasActiveQuery = (data.request?.targets?.length ?? 0) > 0;
  const showStaleQueryNotice = isNonQueryPanel && (hasDataErrors || hasActiveQuery);

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
          data-testid={TEST_IDS.staleQueryNotice}
          style={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            right: 8,
            padding: '6px 10px',
            background: theme.colors.error.transparent,
            border: `1px solid ${theme.colors.error.borderTransparent}`,
            borderRadius: theme.shape.radius.default,
            fontSize: theme.typography.bodySmall.fontSize,
            color: theme.colors.error.text,
            pointerEvents: 'none',
          }}
        >
          {t(
            'ClockPanel.staleQueryNotice.message',
            'This panel does not use a datasource query but one is configured. Open the Query tab and remove all queries to clear this notice.'
          )}
        </div>
      )}
    </div>
  );
}
