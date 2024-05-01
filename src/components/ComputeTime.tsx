import { Field, PanelData, PanelProps } from '@grafana/data';
import moment, { Moment, MomentInput } from 'moment-timezone';
import {
  ClockMode,
  ClockOptions,
  ClockSource,
  CountdownQueryCalculation,
  CountupQueryCalculation,
  QueryCalculation,
} from 'types';
import { getMoment } from 'utils';

export function getTime({
  options,
  timezone,
  data,
  replaceVariables,
  now,
}: {
  options: ClockOptions;
  timezone: ClockOptions['timezone'];
  data: PanelData;
  replaceVariables: PanelProps['replaceVariables'];
  now: Moment;
}): [Moment, string | undefined] {
  if (options.mode !== ClockMode.countdown && options.mode !== ClockMode.countup) {
    return [now, undefined];
  }

  let input: string | undefined = '';
  let clockSettings: ClockOptions['countdownSettings'] | ClockOptions['countupSettings'];
  switch (options.mode) {
    case ClockMode.countdown:
      input = options.countdownSettings.endCountdownTime || '';
      clockSettings = options.countdownSettings;
      break;
    case ClockMode.countup:
      input = options.countupSettings.beginCountupTime || '';
      clockSettings = options.countupSettings;
      break;
  }

  let value: Moment | undefined = undefined;

  switch (clockSettings.source) {
    case ClockSource.input:
      if (!input) {
        return [now, clockSettings.noValueText];
      }
      value = moment(replaceVariables(input)).utcOffset(getMoment(timezone).format('Z'), true);
    case ClockSource.query:
      if (
        (data.state !== 'Done' || data.series.length === 0,
        !clockSettings.queryField ||
          clockSettings.queryField.length === 0 ||
          !data.series ||
          !data.series[0].fields ||
          data.series[0].fields.length === 0)
      ) {
        return [now, clockSettings.noValueText];
      }

      let field: Field | undefined =
        data.series[0].fields.find((field: Field) => field.name === clockSettings.queryField) ?? undefined;
      if (!field) {
        return [now, clockSettings.noValueText];
      }

      let fieldValues = field.values;
      if (!fieldValues || fieldValues.length === 0) {
        return [now, clockSettings.noValueText];
      }

      let values: Moment[] = fieldValues
        .filter((v: MomentInput) => v !== null && v !== undefined && !Number.isNaN(v))
        .map((v: MomentInput) => moment(v));

      let sort_values = (v: Moment[]): Moment[] => {
        return v.sort((a: Moment, b: Moment) => a.diff(b));
      };

      switch (clockSettings.queryCalculation) {
        case QueryCalculation.lastNotNull:
          value = values.length > 0 ? values.at(-1) : undefined;
          break;
        case QueryCalculation.last:
          value = moment(fieldValues.at(-1));
          break;
        case QueryCalculation.firstNotNull:
          value = values.length > 0 ? values[0] : undefined;
          break;
        case QueryCalculation.first:
          value = moment(fieldValues[0]);
          break;
        case QueryCalculation.min:
          value = values.length > 0 ? sort_values(values)[0] : undefined;
          break;
        case CountdownQueryCalculation.minFuture:
          values = values.filter((v: Moment) => v.isAfter(now));
          value = values.length > 0 ? sort_values(values)[0] : undefined;
          break;
        case QueryCalculation.max:
          value = values.length > 0 ? sort_values(values).at(-1) : undefined;
          break;
        case CountupQueryCalculation.maxPast:
          values = values.filter((v: Moment) => v.isBefore(now));
          value = values.length > 0 ? sort_values(values).at(-1) : undefined;
          break;
        default:
          console.error('Invalid query calculation');
          return [now, clockSettings.noValueText];
      }
      break;
  }

  if (!value) {
    return [now, clockSettings.noValueText];
  }
  if (!value.isValid()) {
    return [now, clockSettings.invalidValueText];
  }

  return [value, undefined];
}
