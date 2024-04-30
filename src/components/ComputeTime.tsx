import { Field, PanelData, PanelProps } from '@grafana/data';
import moment, { Duration, Moment, MomentInput } from 'moment-timezone';
import {
  ClockMode,
  ClockOptions,
  ClockSource,
  CountdownQueryCalculation,
  CountupQueryCalculation,
  QueryCalculation,
} from 'types';
import { getMoment } from 'utils';

export function getValueFromQuery(
  data: PanelData,
  fieldName: string,
  fallbackText: string,
  noValueText: string,
  invalidValueText: string,
  queryCalculation: CountdownQueryCalculation | CountupQueryCalculation,
  clockMode: ClockMode.countdown | ClockMode.countup,
  now: Moment
): [Duration | undefined, string] {
  if (
    (data.state !== 'Done' || data.series.length === 0,
    !fieldName ||
      fieldName.length === 0 ||
      !data.series ||
      !data.series[0].fields ||
      data.series[0].fields.length === 0)
  ) {
    return [undefined, noValueText];
  }

  let field: Field | undefined = data.series[0].fields.find((field: Field) => field.name === fieldName) ?? undefined;
  if (!field) {
    return [undefined, noValueText];
  }

  let fieldValues = field.values;
  if (!fieldValues || fieldValues.length === 0) {
    return [undefined, noValueText];
  }

  let value: Moment | undefined = moment();
  let values: Moment[] = fieldValues
    .filter((v: MomentInput) => v !== null && v !== undefined && !Number.isNaN(v))
    .map((v: MomentInput) => moment(v));

  let sort_values = (v: Moment[]): Moment[] => {
    return v.sort((a: Moment, b: Moment) => a.diff(b));
  };

  switch (queryCalculation) {
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
  }

  if (!value) {
    return [undefined, noValueText];
  }
  if (!value.isValid()) {
    return [undefined, invalidValueText];
  }

  let time_diff = moment.duration(now.diff(value));
  if (clockMode === ClockMode.countdown) {
    time_diff = moment.duration(value.diff(now));
  }

  if (time_diff.asSeconds() <= 0) {
    return [undefined, fallbackText];
  }
  return [time_diff, ''];
}

export function getTime({
  clockSettings,
  timezone,
  data,
  replaceVariables,
  clockMode,
  now,
}: {
  clockSettings: ClockOptions['countdownSettings'] | ClockOptions['countupSettings'];
  timezone: ClockOptions['timezone'];
  data: PanelData;
  clockMode: ClockMode.countdown | ClockMode.countup;
  replaceVariables: PanelProps['replaceVariables'];
  now: Moment;
}): [Duration | undefined, string] {
  let fallbackText = '';
  let input: string | undefined = '';

  switch (clockMode) {
    case ClockMode.countdown:
      fallbackText = (clockSettings as ClockOptions['countdownSettings']).endText || '';
      input = (clockSettings as ClockOptions['countdownSettings']).endCountdownTime || '';
      break;
    case ClockMode.countup:
      fallbackText = (clockSettings as ClockOptions['countupSettings']).beginText || '';
      input = (clockSettings as ClockOptions['countupSettings']).beginCountupTime || '';
      break;
  }

  let value: Moment | undefined = undefined;

  switch (clockSettings.source) {
    case ClockSource.input:
      if (!input) {
        return [undefined, clockSettings.noValueText];
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
        return [undefined, clockSettings.noValueText];
      }

      let field: Field | undefined =
        data.series[0].fields.find((field: Field) => field.name === clockSettings.queryField) ?? undefined;
      if (!field) {
        return [undefined, clockSettings.noValueText];
      }

      let fieldValues = field.values;
      if (!fieldValues || fieldValues.length === 0) {
        return [undefined, clockSettings.noValueText];
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
          return [undefined, clockSettings.noValueText];
      }
      break;
  }

  if (!value) {
    return [undefined, clockSettings.noValueText];
  }
  if (!value.isValid()) {
    return [undefined, clockSettings.invalidValueText];
  }

  let time_diff = moment.duration(now.diff(value));
  if (clockMode === ClockMode.countdown) {
    time_diff = moment.duration(value.diff(now));
  }

  if (time_diff.asSeconds() <= 0) {
    return [undefined, fallbackText];
  }

  return [time_diff, ''];
}
