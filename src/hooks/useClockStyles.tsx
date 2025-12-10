import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import { ClockOptions, ClockStyle } from 'types';

export function useClockStyles(options: ClockOptions) {
  return useStyles2(getStyles, options);
}

const getStyles = (theme: GrafanaTheme2, options: ClockOptions) => {
  const {
    bgColor,
    dateSettings,
    descriptionSettings,
    digitalSettings,
    fontMono,
    style,
    timeSettings,
    timezoneSettings,
  } = options;
  const fill =
    style === ClockStyle.digital && digitalSettings?.fillColor
      ? theme.visualization.getColorByName(digitalSettings.fillColor)
      : '';
  const fontFamily = fontMono ? 'monospace' : '';

  return {
    panel: css`
      display: flex;
      align-items: center;
      justify-content: center;
      flex-flow: column wrap;
      font-family: ${fontFamily};
      text-align: center;
      background-color: ${!bgColor ? theme.colors.background.primary : theme.visualization.getColorByName(bgColor)};
    `,
    date: css`
      font-size: ${dateSettings.fontSize};
      font-weight: ${dateSettings.fontWeight};
      font-family: ${fontFamily};
      margin: 0;
      color: ${fill};
    `,
    description: css`
      font-size: ${descriptionSettings.fontSize};
      font-weight: ${descriptionSettings.fontWeight};
      font-family: ${fontFamily};
      margin: 0;
      color: ${fill};
    `,
    time: css`
      font-size: ${timeSettings.fontSize};
      font-family: ${fontFamily};
      font-weight: ${timeSettings.fontWeight};
      color: ${fill};
      margin: 0;
    `,
    zone: css`
      font-size: ${timezoneSettings.fontSize};
      font-weight: ${timezoneSettings.fontWeight};
      font-family: ${fontFamily};
      line-height: 1.4;
      color: ${fill};
      margin: 0;
    `,
  };
};
